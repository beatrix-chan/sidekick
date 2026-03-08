import { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    StyleSheet,
    Dimensions,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Region } from "react-native-maps";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import { auth } from "../../firebase";
import {
    createWalkRequest,
    subscribeToNearbyWalkRequests,
    subscribeToWalkRequest,
    acceptWalkRequest,
    getWalkSession,
    verifyPIN,
    endWalkSession,
    incrementSafeWalkCount,
    subscribeToSession,
    getUserProfile,
    updateUserLocation,
} from "../../dbHelpers";

const SECONDARY = "#5b798a";
const PRIMARY = "#85817d";
const CARD_BG = "#ddd9d4";
const INPUT_BG = "#f9f4ee";
const BG = "#f4ece4";

type WalkRequest = {
    id: string;
    requesterId: string;
    authorNickname: string;
    fromLabel: string;
    toLabel: string;
    leavingInMins: number;
    createdAt: any;
};

// Durham University & city locations with accurate coordinates
const ALL_LOCATIONS = [
    // Libraries & Study
    { name: "Billy B (Bill Bryson Library)", short: "Billy B", lat: 54.76820, lng: -1.57334 },
    { name: "Teaching and Learning Centre", short: "TLC", lat: 54.76726, lng: -1.57576 },

    // Teaching Buildings & University Services
    { name: "MCS (Mathematical Sciences & Computer Science)", short: "MCS", lat: 54.76374, lng: -1.57215 },
    { name: "Chemistry Building", short: "Chemistry", lat: 54.76799, lng: -1.57015 },
    { name: "Engineering Building", short: "Engineering", lat: 54.76740, lng: -1.57063 },
    { name: "Calman Learning Centre", short: "Calman", lat: 54.76752, lng: -1.57202 },

    // Colleges (All 17)
    { name: "Grey College", short: "Grey", lat: 54.76493, lng: -1.57559 },
    { name: "John Snow College", short: "John Snow", lat: 54.76264, lng: -1.58472 },

    // Shops & Food
    { name: "Tesco Extra (Dragonville)", short: "Big Tesco", lat: 54.77666, lng: -1.57605 },

    // Transport
    { name: "Durham Train Station", short: "Train Station", lat: 54.77935, lng: -1.58168 },
];

// Lookup coordinates by location name (matches full name or short)
function getLocationCoords(name: string): { lat: number; lng: number } | null {
    const lower = name.toLowerCase();
    const found = ALL_LOCATIONS.find(
        (loc) => loc.name.toLowerCase() === lower || loc.short.toLowerCase() === lower
    );
    return found ? { lat: found.lat, lng: found.lng } : null;
}
export default function SafeWalkScreen() {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [loading, setLoading] = useState(false);

    // Location state
    const [userLat, setUserLat] = useState<number | null>(null);
    const [userLng, setUserLng] = useState<number | null>(null);
    const [locationError, setLocationError] = useState("");

    // Nearby requests from other users
    const [nearbyRequests, setNearbyRequests] = useState<WalkRequest[]>([]);
    const unsubNearbyRef = useRef<(() => void) | null>(null);

    // Track requester's own pending request
    const [myRequestId, setMyRequestId] = useState<string | null>(null);
    const unsubMyRequestRef = useRef<(() => void) | null>(null);

    // Session state
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessionData, setSessionData] = useState<any>(null);
    const [sessionState, setSessionState] = useState<string>("matched");
    const [partnerPin, setPartnerPin] = useState("");
    const [pinError, setPinError] = useState("");
    const [myPin, setMyPin] = useState("");
    const [partnerNickname, setPartnerNickname] = useState("");
    const [myNickname, setMyNickname] = useState("");

    // Map state
    const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [routeFromLabel, setRouteFromLabel] = useState("");
    const [routeToLabel, setRouteToLabel] = useState("");

    // Autocomplete state
    const [activeField, setActiveField] = useState<"from" | "to" | null>(null);
    const [fromSuggestions, setFromSuggestions] = useState<typeof ALL_LOCATIONS>([]);
    const [toSuggestions, setToSuggestions] = useState<typeof ALL_LOCATIONS>([]);

    const uid = auth.currentUser?.uid;

    // ── Request location permission & get GPS on mount ──
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setLocationError("Location permission denied. Safe Walk needs your location to find nearby peers.");
                return;
            }

            try {
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                setUserLat(loc.coords.latitude);
                setUserLng(loc.coords.longitude);

                // Update user profile location so notifications can find them
                if (uid) {
                    updateUserLocation(uid, loc.coords.latitude, loc.coords.longitude);
                }
            } catch (e) {
                setLocationError("Could not get your location. Please enable GPS.");
            }
        })();
    }, [uid]);

    // ── Subscribe to nearby walk requests when we have location ──
    useEffect(() => {
        if (userLat === null || userLng === null || !uid) return;

        // Clean up previous subscription
        if (unsubNearbyRef.current) unsubNearbyRef.current();

        const unsub = subscribeToNearbyWalkRequests(
            userLat,
            userLng,
            uid,
            async (requests) => {
                // Attach nicknames
                const withNicknames = await Promise.all(
                    requests.map(async (r: any) => {
                        const profile = await getUserProfile(r.requesterId);
                        return {
                            ...r,
                            authorNickname: profile?.nickname || "Anonymous",
                        };
                    })
                );
                setNearbyRequests(withNicknames as WalkRequest[]);
            }
        );
        unsubNearbyRef.current = unsub;

        return () => {
            if (unsubNearbyRef.current) unsubNearbyRef.current();
        };
    }, [userLat, userLng, uid]);

    // ── User nickname ──
    useEffect(() => {
        if (uid) {
            getUserProfile(uid).then((p) => setMyNickname(p?.nickname || "You"));
        }
    }, [uid]);

    // ── Session subscription ──
    useEffect(() => {
        if (!sessionId) return;
        const unsubscribe = subscribeToSession(sessionId, (session) => {
            setSessionData(session);
            setSessionState(session.status);
        });
        return () => unsubscribe();
    }, [sessionId]);

    // ── Watch requester's own request for acceptance ──
    useEffect(() => {
        if (!myRequestId || sessionId) return; // already in session

        const unsub = subscribeToWalkRequest(myRequestId, async (request) => {
            if (request.status === "matched" && request.matchedSessionId) {
                // Someone accepted our request!
                const session = await getWalkSession(request.matchedSessionId) as any;
                if (session) {
                    setSessionId(request.matchedSessionId);
                    setMyPin(session.pinA as string); // requester gets pinA
                    setSessionData(session);
                    setSessionState("matched");
                    setMyRequestId(null); // stop watching

                    // Get the acceptor's nickname
                    const acceptorProfile = await getUserProfile(session.userBId);
                    setPartnerNickname(acceptorProfile?.nickname || "Your partner");

                    // Resolve map coordinates from session data
                    const sl = session.fromLabel || "";
                    const tl = session.toLabel || "";
                    setRouteFromLabel(sl);
                    setRouteToLabel(tl);
                    resolveMapCoords(sl, tl);
                }
            }
        });
        unsubMyRequestRef.current = unsub;

        return () => {
            if (unsubMyRequestRef.current) unsubMyRequestRef.current();
        };
    }, [myRequestId, sessionId]);

    // ── Create walk request with real GPS ──
    async function handleLeaveNow() {
        if (!uid || !from.trim() || !to.trim()) {
            Alert.alert("Error", "Please fill in From and Destination");
            return;
        }
        if (userLat === null || userLng === null) {
            Alert.alert("Error", "Waiting for your location. Please try again in a moment.");
            return;
        }
        setLoading(true);
        try {
            const requestId = await createWalkRequest(uid, from.trim(), to.trim(), 0, userLat, userLng);
            setMyRequestId(requestId); // subscribe to watch for acceptance
            Alert.alert("Request posted!", "Nearby users within 200m will be notified. You'll see the session as soon as someone accepts.");
            setFrom("");
            setTo("");
        } catch (e: any) {
            Alert.alert("Error", e.message);
        } finally {
            setLoading(false);
        }
    }

    // ── Accept another user's request ──
    async function handleAccept(req: WalkRequest) {
        if (!uid) return;
        try {
            const sid = await acceptWalkRequest(req.id, uid);
            setSessionId(sid);
            setPartnerNickname(req.authorNickname);
            setRouteFromLabel(req.fromLabel);
            setRouteToLabel(req.toLabel);

            // Resolve map coordinates
            resolveMapCoords(req.fromLabel, req.toLabel);

            const session = await getWalkSession(sid) as any;
            if (session) {
                setMyPin(session.pinB as string);
                setSessionData(session);
                setSessionState("matched");
            }
        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    }

    // Resolve coordinates for from/to labels
    async function resolveMapCoords(fromName: string, toName: string) {
        // Try known locations first
        let fc = getLocationCoords(fromName);
        let tc = getLocationCoords(toName);

        // Geocode unknown locations
        if (!fc) {
            try {
                const results = await Location.geocodeAsync(fromName + ", Durham, UK");
                if (results.length > 0) fc = { lat: results[0].latitude, lng: results[0].longitude };
            } catch { }
        }
        if (!tc) {
            try {
                const results = await Location.geocodeAsync(toName + ", Durham, UK");
                if (results.length > 0) tc = { lat: results[0].latitude, lng: results[0].longitude };
            } catch { }
        }

        // Fallback to user's current GPS position
        if (!fc && userLat !== null && userLng !== null) {
            fc = { lat: userLat, lng: userLng };
        }

        setFromCoords(fc);
        setToCoords(tc);
    }

    function selectLocation(name: string) {
        if (!from.trim()) {
            setFrom(name);
        } else if (!to.trim()) {
            setTo(name);
        }
    }

    // Autocomplete helpers
    function handleFromChange(text: string) {
        setFrom(text);
        setActiveField("from");
        if (text.trim().length > 0) {
            const lower = text.toLowerCase();
            setFromSuggestions(
                ALL_LOCATIONS.filter(
                    (loc) =>
                        loc.name.toLowerCase().includes(lower) ||
                        loc.short.toLowerCase().includes(lower)
                ).slice(0, 5)
            );
        } else {
            setFromSuggestions([]);
        }
    }

    function handleToChange(text: string) {
        setTo(text);
        setActiveField("to");
        if (text.trim().length > 0) {
            const lower = text.toLowerCase();
            setToSuggestions(
                ALL_LOCATIONS.filter(
                    (loc) =>
                        loc.name.toLowerCase().includes(lower) ||
                        loc.short.toLowerCase().includes(lower)
                ).slice(0, 5)
            );
        } else {
            setToSuggestions([]);
        }
    }

    function pickFromSuggestion(loc: typeof ALL_LOCATIONS[0]) {
        setFrom(loc.name);
        setFromSuggestions([]);
        setActiveField(null);
    }

    function pickToSuggestion(loc: typeof ALL_LOCATIONS[0]) {
        setTo(loc.name);
        setToSuggestions([]);
        setActiveField(null);
    }

    async function handleVerifyPin() {
        if (!sessionId || !uid) return;
        const result = await verifyPIN(sessionId, uid, partnerPin);
        if (result) {
            setPinError("");
        } else {
            setPinError("Incorrect PIN. Ask your partner to confirm.");
        }
    }

    async function handleEndSession() {
        if (!sessionId) return;

        // Increment safe walk count for current user
        if (uid && sessionData) {
            try {
                await incrementSafeWalkCount(uid);
            } catch (e) {
                console.error("Failed to increment walk count:", e);
            }
        }

        await endWalkSession(sessionId);
        setSessionId(null);
        setSessionData(null);
        setPartnerPin("");
        setPinError("");
    }

    function timeAgo(timestamp: any): string {
        if (!timestamp?.seconds) return "";
        const diff = Date.now() - timestamp.seconds * 1000;
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
    }

    return (
        <Screen>
            <ScrollView
                style={styles.flex1}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Text style={styles.headerTitle}>
                    Don't want to walk alone? Find a peer!
                </Text>

                {/* Location error */}
                {locationError ? (
                    <Text style={styles.errorText}>{locationError}</Text>
                ) : userLat === null ? (
                    <View style={styles.locatingRow}>
                        <ActivityIndicator size="small" color={SECONDARY} />
                        <Text style={styles.locatingText}>Getting your location...</Text>
                    </View>
                ) : null}

                {/* From input with autocomplete */}
                <View style={styles.autocompleteWrap}>
                    <TextInput
                        style={styles.input}
                        placeholder="From (e.g. Billy B, MCS)"
                        placeholderTextColor="#b5b0ab"
                        value={from}
                        onChangeText={handleFromChange}
                        onFocus={() => setActiveField("from")}
                    />
                    {activeField === "from" && fromSuggestions.length > 0 && (
                        <View style={styles.suggestionsBox}>
                            {fromSuggestions.map((loc) => (
                                <Pressable
                                    key={loc.name}
                                    onPress={() => pickFromSuggestion(loc)}
                                    style={styles.suggestionItem}
                                >
                                    <Text style={styles.suggestionIcon}>📍</Text>
                                    <View style={styles.suggestionText}>
                                        <Text style={styles.suggestionName}>{loc.short}</Text>
                                        <Text style={styles.suggestionFull} numberOfLines={1}>
                                            {loc.name}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                {/* Destination input with autocomplete */}
                <View style={styles.autocompleteWrap}>
                    <TextInput
                        style={styles.input}
                        placeholder="Destination (e.g. Train Station)"
                        placeholderTextColor="#b5b0ab"
                        value={to}
                        onChangeText={handleToChange}
                        onFocus={() => setActiveField("to")}
                    />
                    {activeField === "to" && toSuggestions.length > 0 && (
                        <View style={styles.suggestionsBox}>
                            {toSuggestions.map((loc) => (
                                <Pressable
                                    key={loc.name}
                                    onPress={() => pickToSuggestion(loc)}
                                    style={styles.suggestionItem}
                                >
                                    <Text style={styles.suggestionIcon}>📍</Text>
                                    <View style={styles.suggestionText}>
                                        <Text style={styles.suggestionName}>{loc.short}</Text>
                                        <Text style={styles.suggestionFull} numberOfLines={1}>
                                            {loc.name}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                {/* Leave now button */}
                {loading ? (
                    <ActivityIndicator size="small" color={SECONDARY} style={{ marginTop: 8 }} />
                ) : (
                    <Pressable onPress={handleLeaveNow} style={styles.leaveButton}>
                        <Text style={styles.leaveButtonText}>Leave now</Text>
                    </Pressable>
                )}

                {/* ── Nearby Requests from other users ── */}
                {nearbyRequests.length > 0 && (
                    <View style={styles.nearbySection}>
                        <Text style={styles.recentLabel}>
                            Nearby requests ({nearbyRequests.length})
                        </Text>
                        <View style={styles.recentDivider} />

                        {nearbyRequests.map((req) => (
                            <View key={req.id} style={styles.requestCard}>
                                <Text style={styles.requestAuthor}>
                                    {req.authorNickname}
                                </Text>
                                <Text style={styles.requestRoute}>
                                    {req.fromLabel} → {req.toLabel}
                                </Text>
                                <Text style={styles.requestTime}>
                                    {timeAgo(req.createdAt)}
                                </Text>
                                <Pressable
                                    onPress={() => handleAccept(req)}
                                    style={styles.acceptButton}
                                >
                                    <Text style={styles.acceptButtonText}>
                                        Walk together
                                    </Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Session Panel Modal */}
            <Modal
                visible={!!sessionId}
                animationType="slide"
                onRequestClose={handleEndSession}
            >
                {sessionId && (
                    <View style={[styles.modalContainer, { backgroundColor: BG }]}>
                        <View style={styles.sessionHeader}>
                            <Text style={styles.sessionTitle}>Walk Session</Text>
                            <View
                                style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor:
                                            sessionState === "verified" ? "#c5d5c0" : "#ddd9d4",
                                    },
                                ]}
                            >
                                <Text style={styles.statusBadgeText}>
                                    {sessionState === "verified" ? "✅ Verified" : "⏳ Matched"}
                                </Text>
                            </View>
                        </View>

                        <ScrollView
                            style={styles.flex1}
                            contentContainerStyle={styles.sessionBody}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Partners */}
                            <View style={styles.partnersRow}>
                                <View style={styles.partnerCard}>
                                    <Text style={styles.partnerLabel}>You</Text>
                                    <Text style={styles.partnerName}>{myNickname}</Text>
                                </View>
                                <Text style={styles.arrow}>↔</Text>
                                <View style={styles.partnerCard}>
                                    <Text style={styles.partnerLabel}>Partner</Text>
                                    <Text style={styles.partnerName}>{partnerNickname}</Text>
                                </View>
                            </View>

                            {/* Route Map */}
                            {(fromCoords || toCoords) && (
                                <View style={styles.mapSection}>
                                    <Text style={styles.mapLabel}>
                                        📍 {routeFromLabel || "Start"} → {routeToLabel || "Destination"}
                                    </Text>
                                    <View style={styles.mapContainer}>
                                        <MapView
                                            style={styles.map}
                                            initialRegion={{
                                                latitude: fromCoords?.lat || toCoords?.lat || 54.77,
                                                longitude: fromCoords?.lng || toCoords?.lng || -1.57,
                                                latitudeDelta: 0.02,
                                                longitudeDelta: 0.02,
                                            }}
                                        >
                                            {fromCoords && (
                                                <Marker
                                                    coordinate={{
                                                        latitude: fromCoords.lat,
                                                        longitude: fromCoords.lng,
                                                    }}
                                                    title={routeFromLabel || "From"}
                                                    pinColor="green"
                                                />
                                            )}
                                            {toCoords && (
                                                <Marker
                                                    coordinate={{
                                                        latitude: toCoords.lat,
                                                        longitude: toCoords.lng,
                                                    }}
                                                    title={routeToLabel || "To"}
                                                    pinColor="red"
                                                />
                                            )}
                                        </MapView>
                                    </View>
                                </View>
                            )}

                            {/* Your PIN */}
                            <View style={styles.pinCard}>
                                <Text style={styles.pinCardLabel}>
                                    Your PIN — share with your partner
                                </Text>
                                <View style={styles.pinDigitsRow}>
                                    {myPin.split("").map((digit, i) => (
                                        <View key={i} style={styles.pinDigitBox}>
                                            <Text style={styles.pinDigit}>{digit}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Enter partner PIN */}
                            {sessionState !== "verified" && (
                                <View style={styles.verifySection}>
                                    <Text style={styles.fieldLabel}>
                                        Enter your partner's PIN
                                    </Text>
                                    <TextInput
                                        style={styles.pinInput}
                                        placeholder="• • • •"
                                        placeholderTextColor="#b5b0ab"
                                        keyboardType="number-pad"
                                        maxLength={4}
                                        value={partnerPin}
                                        onChangeText={(t) => {
                                            setPartnerPin(t);
                                            if (pinError) setPinError("");
                                        }}
                                    />
                                    {pinError ? (
                                        <Text style={styles.errorText}>{pinError}</Text>
                                    ) : null}
                                    <PrimaryButton label="Verify PIN" onPress={handleVerifyPin} />
                                </View>
                            )}

                            {sessionState === "verified" && (
                                <View style={styles.verifiedCard}>
                                    <Text style={styles.verifiedTitle}>
                                        ✅ Identity confirmed!
                                    </Text>
                                    <Text style={styles.verifiedBody}>
                                        Both PINs matched. Stay safe and enjoy the walk!
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles.endFooter}>
                            <Pressable onPress={handleEndSession} style={styles.endButton}>
                                <Text style={styles.endButtonText}>End Walk Session</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </Modal>
        </Screen>
    );
}

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 32 },
    headerTitle: {
        fontFamily: "Georgia-Italic",
        fontSize: 16,
        color: SECONDARY,
        marginBottom: 20,
    },
    errorText: {
        fontFamily: "Georgia-Italic",
        color: "#c45c5c",
        fontSize: 13,
        marginBottom: 12,
    },
    locatingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    locatingText: {
        fontFamily: "Georgia-Italic",
        color: PRIMARY,
        fontSize: 13,
    },
    input: {
        width: "100%",
        height: 44,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor: INPUT_BG,
        color: PRIMARY,
        fontFamily: "Georgia-Italic",
        fontSize: 15,
        marginBottom: 0,
    },
    // Autocomplete
    autocompleteWrap: {
        marginBottom: 12,
        zIndex: 1,
    },
    suggestionsBox: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginTop: 4,
        paddingVertical: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    suggestionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
    },
    suggestionIcon: {
        fontSize: 16,
    },
    suggestionText: {
        flex: 1,
    },
    suggestionName: {
        fontFamily: "Georgia-BoldItalic",
        fontSize: 14,
        color: SECONDARY,
    },
    suggestionFull: {
        fontFamily: "Georgia-Italic",
        fontSize: 12,
        color: PRIMARY,
    },
    leaveButton: {
        alignSelf: "flex-start",
        backgroundColor: "#9a958f",
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 999,
        marginBottom: 32,
    },
    leaveButtonText: {
        fontFamily: "Georgia",
        color: "#fff",
        fontSize: 14,
    },
    // Nearby requests section
    nearbySection: { marginBottom: 32 },
    requestCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    requestAuthor: {
        fontFamily: "Georgia-BoldItalic",
        fontSize: 16,
        color: SECONDARY,
        marginBottom: 4,
    },
    requestRoute: {
        fontFamily: "Georgia-Italic",
        fontSize: 14,
        color: PRIMARY,
        marginBottom: 4,
    },
    requestTime: {
        fontFamily: "Georgia-Italic",
        fontSize: 12,
        color: "#b5b0ab",
        marginBottom: 12,
    },
    acceptButton: {
        alignSelf: "flex-start",
        backgroundColor: SECONDARY,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 999,
    },
    acceptButtonText: {
        fontFamily: "Georgia",
        color: "#fff",
        fontSize: 14,
    },
    // Recent section
    recentSection: { marginTop: 8 },
    recentLabel: {
        fontFamily: "Georgia-Italic",
        fontSize: 14,
        color: PRIMARY,
        marginBottom: 8,
    },
    recentDivider: {
        height: 1,
        backgroundColor: SECONDARY,
        marginBottom: 24,
    },
    locationItem: { marginBottom: 24 },
    locationName: {
        fontFamily: "Georgia-BoldItalic",
        fontSize: 18,
        color: SECONDARY,
        marginBottom: 2,
    },
    locationAddress: {
        fontFamily: "Georgia-Italic",
        fontSize: 14,
        color: PRIMARY,
        lineHeight: 20,
    },
    // Modal / Session styles
    modalContainer: { flex: 1 },
    sessionHeader: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sessionTitle: {
        fontFamily: "Georgia-BoldItalic",
        fontSize: 20,
        color: PRIMARY,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    statusBadgeText: {
        fontFamily: "Georgia-Italic",
        fontSize: 12,
        color: PRIMARY,
    },
    sessionBody: { paddingHorizontal: 24, paddingTop: 12, gap: 20 },
    partnersRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    partnerCard: {
        flex: 1,
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
    },
    partnerLabel: {
        fontFamily: "Georgia-Italic",
        fontSize: 12,
        color: PRIMARY,
        marginBottom: 4,
    },
    partnerName: {
        fontFamily: "Georgia-BoldItalic",
        fontSize: 14,
        color: SECONDARY,
    },
    arrow: {
        fontFamily: "Georgia",
        color: PRIMARY,
        fontSize: 20,
    },
    pinCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 20,
    },
    pinCardLabel: {
        fontFamily: "Georgia-Italic",
        color: PRIMARY,
        fontSize: 12,
        marginBottom: 12,
    },
    pinDigitsRow: { flexDirection: "row", gap: 12, justifyContent: "center" },
    pinDigitBox: {
        width: 48,
        height: 56,
        backgroundColor: BG,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    pinDigit: {
        fontFamily: "Georgia-BoldItalic",
        color: SECONDARY,
        fontSize: 24,
    },
    verifySection: { gap: 12 },
    fieldLabel: {
        fontFamily: "Georgia-Italic",
        fontSize: 14,
        color: PRIMARY,
    },
    pinInput: {
        height: 48,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor: INPUT_BG,
        textAlign: "center",
        fontSize: 24,
        fontFamily: "Georgia-BoldItalic",
        letterSpacing: 8,
        color: PRIMARY,
    },
    verifiedCard: {
        backgroundColor: "#c5d5c0",
        borderRadius: 16,
        padding: 16,
    },
    verifiedTitle: {
        fontFamily: "Georgia-BoldItalic",
        color: "#3d6635",
        fontSize: 16,
        marginBottom: 4,
    },
    verifiedBody: {
        fontFamily: "Georgia-Italic",
        color: "#3d6635",
        fontSize: 14,
        lineHeight: 20,
    },
    endFooter: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        paddingTop: 12,
    },
    endButton: {
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#c45c5c",
    },
    endButtonText: {
        fontFamily: "Georgia-Italic",
        color: "#c45c5c",
        fontSize: 14,
    },
    // Map styles
    mapSection: {
        gap: 8,
    },
    mapLabel: {
        fontFamily: "Georgia-Italic",
        fontSize: 14,
        color: PRIMARY,
    },
    mapContainer: {
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: CARD_BG,
    },
    map: {
        width: "100%",
        height: 200,
    },
});
