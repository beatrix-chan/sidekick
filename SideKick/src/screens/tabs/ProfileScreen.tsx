import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from "react-native";
import Screen from "../../components/Screen";
import { auth, db } from "../../firebase";
import { regenerateNickname } from "../../dbHelpers";
import { logOut } from "../../authHelpers";
import { doc, onSnapshot } from "firebase/firestore";

const SECONDARY = "#5b798a";
const PRIMARY = "#85817d";

export default function ProfileScreen() {
    const [nickname, setNickname] = useState("...");
    const [contributions, setContributions] = useState(0);
    const [regenCount, setRegenCount] = useState(0);
    const MAX_REGENS = 3;
    const uid = auth.currentUser?.uid;

    useEffect(() => {
        if (!uid) return;
        const unsubscribe = onSnapshot(doc(db, "users", uid), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setNickname(data.nickname || "Anonymous");
                setRegenCount(data.nicknameRegenCount || 0);
                const total =
                    (data.safeWalkCount || 0) +
                    (data.questionsAnswered || 0) +
                    (data.helpedTotal || 0);
                setContributions(total);
            }
        });
        return () => unsubscribe();
    }, [uid]);

    function handleRegenerate() {
        if (regenCount >= MAX_REGENS) {
            Alert.alert(
                "Limit reached",
                "You can only regenerate your nickname 3 times."
            );
        } else {
            Alert.alert(
                "Regenerate nickname?",
                "This will change your nickname across the app.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Regenerate",
                        style: "destructive",
                        onPress: async () => {
                            if (!uid) return;
                            const newNick = await regenerateNickname(uid);
                            setNickname(newNick);
                            setRegenCount((c) => c + 1);
                        },
                    },
                ]
            );
        }
    }

    function handleLogout() {
        Alert.alert("Log out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Log out",
                style: "destructive",
                onPress: async () => {
                    await logOut();
                },
            },
        ]);
    }

    return (
        <Screen>
            <ScrollView
                style={styles.flex1}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {nickname.slice(0, 2).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.nickname}>{nickname}</Text>
                        <Text style={styles.contributions}>
                            {contributions} contributions so far
                        </Text>
                    </View>
                </View>

                {/* Regenerate button */}
                <Pressable onPress={handleRegenerate} style={styles.regenButton}>
                    <Text style={styles.regenText}>
                        🔄 Regenerate nickname ({MAX_REGENS - regenCount} left)
                    </Text>
                </Pressable>

                {/* App Info section */}
                <Text style={styles.sectionTitle}>App Info</Text>

                <View style={styles.infoList}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Version</Text>
                        <Text style={styles.infoValue}>1</Text>
                    </View>
                    <Pressable style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Privacy Policy</Text>
                    </Pressable>
                    <Pressable style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Terms and Conditions</Text>
                    </Pressable>
                    <Pressable style={styles.infoRow}>
                        <Text style={styles.infoLabel}>License</Text>
                    </Pressable>
                </View>

                {/* Log out */}
                <Pressable onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Log out</Text>
                </Pressable>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        marginBottom: 24,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#ddd9d4",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontFamily: "Georgia-BoldItalic",
        color: SECONDARY,
        fontSize: 36,
    },
    profileInfo: {
        flex: 1,
    },
    nickname: {
        fontFamily: "Georgia-BoldItalic",
        fontSize: 28,
        color: SECONDARY,
        marginBottom: 4,
    },
    contributions: {
        fontFamily: "Georgia-Italic",
        fontSize: 14,
        color: PRIMARY,
    },
    regenButton: {
        alignSelf: "flex-start",
        marginBottom: 60,
    },
    regenText: {
        fontFamily: "Georgia-Italic",
        fontSize: 14,
        color: SECONDARY,
    },
    sectionTitle: {
        fontFamily: "Georgia-BoldItalic",
        fontSize: 18,
        color: SECONDARY,
        marginBottom: 16,
    },
    infoList: {
        gap: 4,
        marginBottom: 40,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    infoLabel: {
        fontFamily: "Georgia-Italic",
        fontSize: 15,
        color: PRIMARY,
    },
    infoValue: {
        fontFamily: "Georgia-Italic",
        fontSize: 15,
        color: PRIMARY,
    },
    logoutButton: {
        alignSelf: "flex-start",
    },
    logoutText: {
        fontFamily: "Georgia-Italic",
        fontSize: 15,
        color: "#c45c5c",
    },
});
