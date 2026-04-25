import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Pressable,
    Modal,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { ShieldCheck as ShieldCheckIcon, X as XIcon } from "lucide-react-native";
import {
    doc,
    getDoc,
    updateDoc,
    addDoc,
    collection,
    arrayUnion,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// ─── Data Structures ────────────────────────────────────────────────

/** Shape of a report document stored in the `reports` Firestore collection. */
export interface Report {
    reportedId: string;
    reason: string;
    timestamp: ReturnType<typeof serverTimestamp>;
}

// ─── Props ──────────────────────────────────────────────────────────

interface SafetyToolkitProps {
    /** UID of the currently-signed-in user. */
    currentUserId: string;
    /** UID of the user being viewed / interacted with. */
    targetUserId: string;
    /** Called when the user dismisses the toolkit (e.g. cancel / close). */
    onDismiss?: () => void;
}

// ─── Report Reasons ─────────────────────────────────────────────────

const REPORT_REASONS = [
    "Harassment",
    "Wrong Person",
    "Inappropriate Content",
    "Spam",
    "Threatening Behaviour",
    "Other",
] as const;

// ─── Component ──────────────────────────────────────────────────────

export default function SafetyToolkit({
    currentUserId,
    targetUserId,
    onDismiss,
}: SafetyToolkitProps) {
    const [menuVisible, setMenuVisible] = useState(false);
    const [reasonPickerVisible, setReasonPickerVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [targetNickname, setTargetNickname] = useState<string>("this user");

    // Fetch the target user's nickname so we can show who is being blocked/reported
    useEffect(() => {
        if (!targetUserId) return;
        getDoc(doc(db, "users", targetUserId))
            .then((snap) => {
                if (snap.exists() && snap.data().nickname) {
                    setTargetNickname(snap.data().nickname);
                }
            })
            .catch(() => {});
    }, [targetUserId]);

    // ── Dismiss everything ──────────────────────────────────────────
    const dismissAll = () => {
        setMenuVisible(false);
        setReasonPickerVisible(false);
        onDismiss?.();
    };

    // ── Block Handler ───────────────────────────────────────────────
    const handleBlock = async () => {
        setMenuVisible(false);

        Alert.alert(
            "Block User",
            `Are you sure you want to block "${targetNickname}"? You won't see their content any more.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Block",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const userRef = doc(db, "users", currentUserId);
                            await updateDoc(userRef, {
                                blockedUsers: arrayUnion(targetUserId),
                            });
                            Alert.alert("Done", `"${targetNickname}" has been blocked.`);
                            onDismiss?.();
                        } catch (error) {
                            console.error("Block failed:", error);
                            Alert.alert(
                                "Error",
                                "Something went wrong while blocking. Please try again.",
                            );
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ],
        );
    };

    // ── Report Handler ──────────────────────────────────────────────
    const handleReport = () => {
        setMenuVisible(false);
        setReasonPickerVisible(true);
    };

    const submitReport = async (reason: string) => {
        setReasonPickerVisible(false);
        try {
            setLoading(true);
            const reportData: Report = {
                reportedId: targetUserId,
                reason,
                timestamp: serverTimestamp(),
            };

            await addDoc(collection(db, "reports"), {
                ...reportData,
                reportedBy: currentUserId,
            });

            Alert.alert(
                "Report Submitted",
                `Thank you — we'll review your report about "${targetNickname}" shortly.`,
            );
            onDismiss?.();
        } catch (error) {
            console.error("Report failed:", error);
            Alert.alert(
                "Error",
                "Something went wrong while reporting. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    // ── Render ──────────────────────────────────────────────────────
    return (
        <>
            {/* Floating Shield Button */}
            <Pressable
                style={styles.fab}
                onPress={() => setMenuVisible(true)}
                accessibilityLabel="Safety toolkit"
            >
                {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <ShieldCheckIcon
                        color="#fff"
                        size={22}
                        strokeWidth={2}
                    />
                )}
            </Pressable>

            {/* ── Main Action Sheet Modal ──────────────────────────── */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={dismissAll}
            >
                <View style={styles.backdrop}>
                    {/* Tapping the dark area closes the modal */}
                    <Pressable style={styles.backdropTouch} onPress={dismissAll} />

                    {/* Sheet — onStartShouldSetResponder prevents taps here from
                        bubbling up to the backdrop */}
                    <View
                        style={styles.sheet}
                        onStartShouldSetResponder={() => true}
                    >
                        <Text style={styles.sheetTitle}>
                            Safety Options for "{targetNickname}"
                        </Text>

                        <Pressable
                            style={styles.option}
                            onPress={handleReport}
                        >
                            <Text style={styles.optionText}>
                                🚩  Report User
                            </Text>
                        </Pressable>

                        <Pressable
                            style={styles.option}
                            onPress={handleBlock}
                        >
                            <Text style={[styles.optionText, styles.destructive]}>
                                🚫  Block User
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[styles.option, styles.cancelOption]}
                            onPress={dismissAll}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* ── Reason Picker Modal ──────────────────────────────── */}
            <Modal
                visible={reasonPickerVisible}
                transparent
                animationType="slide"
                onRequestClose={dismissAll}
            >
                <View style={styles.backdrop}>
                    {/* Tapping the dark area closes the modal */}
                    <Pressable style={styles.backdropTouch} onPress={dismissAll} />

                    <View
                        style={styles.sheet}
                        onStartShouldSetResponder={() => true}
                    >
                        <Text style={styles.sheetTitle}>
                            Why are you reporting "{targetNickname}"?
                        </Text>

                        {REPORT_REASONS.map((reason) => (
                            <Pressable
                                key={reason}
                                style={styles.option}
                                onPress={() => submitReport(reason)}
                            >
                                <Text style={styles.optionText}>{reason}</Text>
                            </Pressable>
                        ))}

                        <Pressable
                            style={[styles.option, styles.cancelOption]}
                            onPress={dismissAll}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    /* Floating action button */
    fab: {
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#9a958f",
        alignItems: "center",
        justifyContent: "center",
        /* Subtle shadow */
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 6,
        zIndex: 100,
    },

    /* Modal backdrop (fills screen) */
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },

    /* Touchable area above the sheet that dismisses the modal */
    backdropTouch: {
        flex: 1,
    },

    /* Bottom sheet container */
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingBottom: 36,
        paddingHorizontal: 24,
    },

    sheetTitle: {
        fontFamily: "Georgia",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
        textAlign: "center",
        color: "#333",
    },

    /* Individual option row */
    option: {
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#e0e0e0",
    },

    optionText: {
        fontFamily: "Georgia",
        fontSize: 16,
        color: "#333",
        textAlign: "center",
    },

    destructive: {
        color: "#c0392b",
    },

    /* Cancel button */
    cancelOption: {
        marginTop: 8,
        borderBottomWidth: 0,
    },

    cancelText: {
        fontFamily: "Georgia",
        fontSize: 16,
        fontWeight: "600",
        color: "#9a958f",
        textAlign: "center",
    },
});
