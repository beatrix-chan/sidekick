import { db } from './firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    addDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    onSnapshot,
    increment
} from 'firebase/firestore';

// ============ USER FUNCTIONS ============

export async function getUserProfile(uid: string) {
    const docSnap = await getDoc(doc(db, 'users', uid));
    return docSnap.exists() ? docSnap.data() : null;
}

export async function regenerateNickname(uid: string) {
    const adjectives = ['Happy', 'Cozy', 'Brave', 'Sunny', 'Swift', 'Calm', 'Bright', 'Kind'];
    const animals = ['Panda', 'Fox', 'Owl', 'Rabbit', 'Dolphin', 'Koala', 'Penguin', 'Otter'];
    const number = Math.floor(Math.random() * 100);
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const newNickname = `${adj}${animal}${number}`;

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().nicknameRegenCount < 3) {
        await updateDoc(userRef, {
            nickname: newNickname,
            nicknameRegenCount: increment(1)
        });
        return newNickname;
    }
    throw new Error('Maximum nickname regenerations reached (3)');
}

// Update user's current location (call this periodically in the app)
export async function updateUserLocation(uid: string, lat: number, lng: number) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        location: {
            lat,
            lng,
            updatedAt: serverTimestamp()
        }
    });
}

// Get all users with recent location (within last 30 minutes)
async function getNearbyUsers(lat: number, lng: number, excludeUserId: string): Promise<string[]> {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const nearbyUserIds: string[] = [];

    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

    usersSnapshot.docs.forEach(userDoc => {
        const userData = userDoc.data();

        // Skip the requester and users without location
        if (userDoc.id === excludeUserId || !userData.location) return;

        // Skip if location is too old
        const locationTime = userData.location.updatedAt?.toDate?.();
        if (locationTime && locationTime < thirtyMinsAgo) return;

        // Check if within 200 meters
        const distance = calculateDistance(
            lat,
            lng,
            userData.location.lat,
            userData.location.lng
        );

        if (distance <= MAX_DISTANCE_METERS) {
            nearbyUserIds.push(userDoc.id);
        }
    });

    return nearbyUserIds;
}

// ============ Q&A FUNCTIONS ============

export async function createQuestion(
    authorId: string,
    title: string,
    body: string,
    course: string,
    level: number
) {
    const questionRef = await addDoc(collection(db, 'questions'), {
        authorId,
        title,
        body,
        course,
        level,
        createdAt: serverTimestamp()
    });
    return questionRef.id;
}

export async function getQuestions() {
    const q = query(collection(db, 'questions'));
    const snapshot = await getDocs(q);
    // Sort client-side to avoid composite index
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    docs.sort((a: any, b: any) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
    });
    return docs;
}

// Real-time listener for questions
export function subscribeToQuestions(callback: (questions: any[]) => void) {
    const q = query(collection(db, 'questions'));
    return onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        docs.sort((a: any, b: any) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
        });
        callback(docs);
    });
}

export async function getQuestion(questionId: string) {
    const docSnap = await getDoc(doc(db, 'questions', questionId));
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
        id: docSnap.id,
        authorId: data.authorId as string,
        title: data.title as string,
        body: data.body as string,
        category: data.category as string,
        createdAt: data.createdAt
    };
}

export async function createAnswer(questionId: string, authorId: string, body: string) {
    // Create the answer
    const answerRef = await addDoc(collection(db, 'questions', questionId, 'answers'), {
        authorId,
        body,
        helpfulCount: 0,
        createdAt: serverTimestamp()
    });

    // Increment answerCount on the question doc so the live listener picks it up
    await updateDoc(doc(db, 'questions', questionId), {
        answerCount: increment(1)
    });

    // Increment questionsAnswered count on the answerer's profile
    try {
        const userRef = doc(db, 'users', authorId);
        const userSnap = await getDoc(userRef);
        const current = userSnap.data()?.questionsAnswered || 0;
        await updateDoc(userRef, { questionsAnswered: current + 1 });
    } catch (e) {
        console.error('Failed to increment questionsAnswered:', e);
    }

    // Get the question to find who asked it
    const question = await getQuestion(questionId);

    // Notify the question author (if it's not the same person answering)
    if (question && question.authorId !== authorId) {
        await createNotification(
            question.authorId,           // who receives notification
            'new_answer',                 // type
            `Someone answered your question: "${question.title}"`,
            questionId,
            answerRef.id
        );
    }

    return answerRef.id;
}

export async function getAnswers(questionId: string) {
    const q = query(
        collection(db, 'questions', questionId, 'answers'),
        orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Delete a question (owner only) — also deletes all answers in subcollection
export async function deleteQuestion(questionId: string, currentUserId: string) {
    const questionRef = doc(db, 'questions', questionId);
    const questionSnap = await getDoc(questionRef);
    if (!questionSnap.exists()) throw new Error('Question not found');
    if (questionSnap.data().authorId !== currentUserId) throw new Error('You can only delete your own questions');

    // Delete all answers in subcollection first (ignore individual permission errors)
    try {
        const answersSnap = await getDocs(collection(db, 'questions', questionId, 'answers'));
        await Promise.all(answersSnap.docs.map(d => deleteDoc(d.ref).catch(() => {})));
    } catch (e) {
        console.warn('Could not delete some answers:', e);
    }

    // Delete the question
    await deleteDoc(questionRef);
}

// Delete an answer (owner only) — also decrements answerCount on the question
export async function deleteAnswer(questionId: string, answerId: string, currentUserId: string) {
    const answerRef = doc(db, 'questions', questionId, 'answers', answerId);
    const answerSnap = await getDoc(answerRef);
    if (!answerSnap.exists()) throw new Error('Answer not found');
    if (answerSnap.data().authorId !== currentUserId) throw new Error('You can only delete your own answers');

    await deleteDoc(answerRef);

    // Decrement answerCount on the question so the live listener picks it up
    await updateDoc(doc(db, 'questions', questionId), {
        answerCount: increment(-1)
    });
}

export async function markAnswerHelpful(questionId: string, answerId: string, userId: string): Promise<boolean> {
    const answerRef = doc(db, 'questions', questionId, 'answers', answerId);
    const answerSnap = await getDoc(answerRef);

    if (!answerSnap.exists()) return false;

    const data = answerSnap.data();
    const upvotedBy: string[] = data.upvotedBy || [];

    // Already upvoted by this user
    if (upvotedBy.includes(userId)) return false;

    await updateDoc(answerRef, {
        helpfulCount: increment(1),
        upvotedBy: [...upvotedBy, userId],
    });
    return true;
}

// ============ NOTIFICATION FUNCTIONS ============

// Create a notification
async function createNotification(
    userId: string,
    type: 'new_answer' | 'walk_matched' | 'walk_verified' | 'walk_request_nearby',
    message: string,
    questionId?: string,
    answerId?: string,
    walkRequestId?: string
) {
    await addDoc(collection(db, 'notifications'), {
        userId,
        type,
        message,
        questionId: questionId || null,
        answerId: answerId || null,
        walkRequestId: walkRequestId || null,
        read: false,
        createdAt: serverTimestamp()
    });
}

// Get user's notifications
export async function getNotifications(userId: string) {
    const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string): Promise<number> {
    const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
}

// Mark notification as read
export async function markNotificationRead(notificationId: string) {
    await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
    });
}

// Mark all notifications as read
export async function markAllNotificationsRead(userId: string) {
    const notifications = await getNotifications(userId);
    const unread = notifications.filter((n: any) => !n.read);

    await Promise.all(
        unread.map((n: any) => markNotificationRead(n.id))
    );
}

// Real-time notifications listener
export function subscribeToNotifications(userId: string, callback: (notifications: any[]) => void) {
    const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(notifications);
    });
}

// ============ SAFE WALK FUNCTIONS ============

// Generate 4-digit PIN
function generatePIN(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Calculate distance between two coordinates in meters (Haversine formula)
function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371000; // Earth's radius in meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
}

// Maximum distance to see walk requests (200 meters)
const MAX_DISTANCE_METERS = 200;

export async function createWalkRequest(
    requesterId: string,
    fromLabel: string,
    toLabel: string,
    leavingInMins: number, // 0, 5, 10, or 15
    lat: number,           // Requester's current latitude
    lng: number            // Requester's current longitude
) {
    const requestRef = await addDoc(collection(db, 'walkRequests'), {
        requesterId,
        fromLabel,
        toLabel,
        leavingInMins,
        status: 'open',
        createdAt: serverTimestamp(),
        matchedSessionId: null,
        // Store requester's location for proximity filtering
        location: {
            lat,
            lng
        }
    });

    // Notify nearby users (within 200m)
    const nearbyUsers = await getNearbyUsers(lat, lng, requesterId);
    const leavingText = leavingInMins === 0 ? 'now' : `in ${leavingInMins} mins`;

    await Promise.all(
        nearbyUsers.map(userId =>
            createNotification(
                userId,
                'walk_request_nearby',
                `Someone nearby wants to walk from ${fromLabel} to ${toLabel} (leaving ${leavingText})`,
                undefined,
                undefined,
                requestRef.id
            )
        )
    );

    return requestRef.id;
}

// Get walk requests within 200 meters of current user
export async function getOpenWalkRequests(userLat: number, userLng: number) {
    const q = query(
        collection(db, 'walkRequests'),
        where('status', '==', 'open')
    );
    const snapshot = await getDocs(q);

    // Filter requests within 200 meters
    const allRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return allRequests.filter((request: any) => {
        if (!request.location) return false;

        const distance = calculateDistance(
            userLat,
            userLng,
            request.location.lat,
            request.location.lng
        );

        return distance <= MAX_DISTANCE_METERS;
    });
}

// Update requester's live location in their walk request
export async function updateWalkRequestLocation(requestId: string, lat: number, lng: number) {
    const requestRef = doc(db, 'walkRequests', requestId);
    await updateDoc(requestRef, {
        location: {
            lat,
            lng,
            updatedAt: serverTimestamp()
        }
    });
}

// Subscribe to nearby walk requests in real-time (live updates)
export function subscribeToNearbyWalkRequests(
    userLat: number,
    userLng: number,
    currentUserId: string,
    callback: (requests: any[]) => void
) {
    const q = query(
        collection(db, 'walkRequests'),
        where('status', '==', 'open')
    );

    return onSnapshot(q, (snapshot) => {
        const allRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filter: within 200m AND not user's own request
        const nearbyRequests = allRequests.filter((request: any) => {
            if (!request.location) return false;
            if (request.requesterId === currentUserId) return false; // Don't show own requests

            const distance = calculateDistance(
                userLat,
                userLng,
                request.location.lat,
                request.location.lng
            );

            return distance <= MAX_DISTANCE_METERS;
        });

        callback(nearbyRequests);
    });
}

// Create a live location updater that runs every 10 seconds
export function startLiveLocationUpdates(
    requestId: string,
    getLocation: () => Promise<{ lat: number; lng: number }>
) {
    const intervalId = setInterval(async () => {
        try {
            const { lat, lng } = await getLocation();
            await updateWalkRequestLocation(requestId, lat, lng);
        } catch (error) {
            console.error('Failed to update location:', error);
        }
    }, 10000); // Update every 10 seconds

    // Return function to stop updates
    return () => clearInterval(intervalId);
}

export async function acceptWalkRequest(requestId: string, acceptorId: string) {
    // Get the request
    const requestRef = doc(db, 'walkRequests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists() || requestSnap.data().status !== 'open') {
        throw new Error('Request no longer available');
    }

    const requestData = requestSnap.data();

    // Create walk session with PINs and route info
    const sessionRef = await addDoc(collection(db, 'walkSessions'), {
        userAId: requestData.requesterId, // requester
        userBId: acceptorId,              // acceptor
        pinA: generatePIN(),
        pinB: generatePIN(),
        verifiedA: false,
        verifiedB: false,
        status: 'matched',
        fromLabel: requestData.fromLabel || '',
        toLabel: requestData.toLabel || '',
        fromLat: requestData.location?.lat || null,
        fromLng: requestData.location?.lng || null,
        userALocation: null,
        userBLocation: null,
        createdAt: serverTimestamp(),
        endedAt: null
    });

    // Update request status
    await updateDoc(requestRef, {
        status: 'matched',
        matchedSessionId: sessionRef.id
    });

    return sessionRef.id;
}

export async function getWalkSession(sessionId: string) {
    const docSnap = await getDoc(doc(db, 'walkSessions', sessionId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

// Verify PIN (user enters partner's PIN)
export async function verifyPIN(sessionId: string, currentUserId: string, enteredPIN: string) {
    const sessionRef = doc(db, 'walkSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
        throw new Error('Session not found');
    }

    const session = sessionSnap.data();

    // Check which user is verifying
    if (currentUserId === session.userAId) {
        // User A enters User B's PIN
        if (enteredPIN === session.pinB) {
            await updateDoc(sessionRef, { verifiedA: true });
            // Check if both verified
            if (session.verifiedB) {
                await updateDoc(sessionRef, { status: 'verified' });
            }
            return true;
        }
    } else if (currentUserId === session.userBId) {
        // User B enters User A's PIN
        if (enteredPIN === session.pinA) {
            await updateDoc(sessionRef, { verifiedB: true });
            // Check if both verified
            if (session.verifiedA) {
                await updateDoc(sessionRef, { status: 'verified' });
            }
            return true;
        }
    }

    return false; // Wrong PIN
}

// Update user location in session
export async function updateLocation(sessionId: string, userId: string, lat: number, lng: number) {
    const sessionRef = doc(db, 'walkSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) return;

    const session = sessionSnap.data();
    const locationField = userId === session.userAId ? 'userALocation' : 'userBLocation';

    await updateDoc(sessionRef, {
        [locationField]: {
            lat,
            lng,
            updatedAt: serverTimestamp()
        }
    });
}

// Listen to session updates (real-time)
export function subscribeToSession(sessionId: string, callback: (session: any) => void) {
    return onSnapshot(doc(db, 'walkSessions', sessionId), (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() });
        }
    });
}

// End walk session
export async function endWalkSession(sessionId: string) {
    await updateDoc(doc(db, 'walkSessions', sessionId), {
        status: 'ended',
        endedAt: serverTimestamp()
    });
}

// Increment safe walk count for the current user when session ends
export async function incrementSafeWalkCount(userId: string) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const currentCount = userSnap.data()?.safeWalkCount || 0;
    await updateDoc(userRef, { safeWalkCount: currentCount + 1 });
}

// Get user stats (questions answered, safe walks, total helped)
export async function getUserStats(userId: string) {
    const profileSnap = await getDoc(doc(db, 'users', userId));
    const data = profileSnap.data() || {};
    return {
        safeWalkCount: data.safeWalkCount || 0,
        questionsAnswered: data.questionsAnswered || 0,
    };
}

// Subscribe to a single walk request (requester watches for acceptance)
export function subscribeToWalkRequest(requestId: string, callback: (request: any) => void) {
    return onSnapshot(doc(db, 'walkRequests', requestId), (docSnap) => {
        if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() });
        }
    });
}

// ============ GLOBAL CHAT FUNCTIONS ============

export async function sendChatMessage(authorId: string, nickname: string, text: string) {
    await addDoc(collection(db, 'globalChat'), {
        authorId,
        nickname,
        text,
        createdAt: serverTimestamp(),
    });
}

export function subscribeToChatMessages(callback: (messages: any[]) => void) {
    const q = query(
        collection(db, 'globalChat'),
        orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(msgs);
    });
}
