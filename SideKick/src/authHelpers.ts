import { auth, db } from "./firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// ─── Email Validation ─────────────────────────────────────────────────────────

/**
 * Validates the Durham University student email format.
 *
 * Required format: exactly 4 lowercase letters + 2 numeric digits + @durham.ac.uk
 * Example valid input: abcd12@durham.ac.uk
 *
 * The anchors (^ and $) ensure the entire string is matched, preventing
 * partial matches that could introduce security vulnerabilities.
 *
 * @param email - Raw string from the login/register input
 * @returns true if the email matches the institutional format exactly
 */
// Function to validate the Durham University student email format: 4 letters + 2 numbers
export const validateDurhamEmail = (email: string): boolean => {
    // Pattern: Start + 4 lowercase letters + 2 digits + domain + End
    const durhamRegex = /^[a-z]{4}[0-9]{2}@durham\.ac\.uk$/;

    // Returns true if it matches exactly, false if it does not
    return durhamRegex.test(email.toLowerCase().trim());
};

// Example usage for your login button:
// if (validateDurhamEmail(userEmail)) {
//   proceedToApp();
// } else {
//   showErrorMessage("Please use a valid Durham student ID");
// }

/** Backward-compatible alias — delegates to validateDurhamEmail. */
export function isUniversityEmail(email: string): boolean {
    return validateDurhamEmail(email);
}

// ─── Nickname Generator ───────────────────────────────────────────────────────

function generateNickname(): string {
    const adjectives = ["Happy", "Cozy", "Brave", "Sunny", "Swift", "Calm", "Bright", "Kind"];
    const animals = ["Panda", "Fox", "Owl", "Rabbit", "Dolphin", "Koala", "Penguin", "Otter"];
    const number = Math.floor(Math.random() * 100);
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${adj}${animal}${number}`;
}

// ─── Registration ─────────────────────────────────────────────────────────────

/**
 * Register a new user with a Durham email + password.
 * The email is validated via RegEx before account creation.
 * A Firestore profile is created immediately on success.
 */
export async function registerUser(email: string, password: string): Promise<User> {
    if (!validateDurhamEmail(email)) {
        throw new Error("Please use your Durham University email (e.g. abcd12@durham.ac.uk).");
    }

    const normalised = email.trim().toLowerCase();
    const { user } = await createUserWithEmailAndPassword(auth, normalised, password);

    // Create Firestore profile
    const profileRef = doc(db, "users", user.uid);
    const snap = await getDoc(profileRef);
    if (!snap.exists()) {
        await setDoc(profileRef, {
            nickname: generateNickname(),
            email: normalised,
            nicknameRegenCount: 0,
            createdAt: serverTimestamp(),
        });
    }

    return user;
}

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Sign in with a Durham email + password.
 * Email format is validated via RegEx before the Firebase call.
 */
export async function loginUser(email: string, password: string): Promise<User> {
    if (!validateDurhamEmail(email)) {
        throw new Error("Please use your Durham University email (e.g. abcd12@durham.ac.uk).");
    }

    const { user } = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
    );
    return user;
}

// ─── General Auth Helpers ─────────────────────────────────────────────────────

export async function logOut(): Promise<void> {
    await signOut(auth);
}

export function getCurrentUser(): User | null {
    return auth.currentUser;
}

export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}
