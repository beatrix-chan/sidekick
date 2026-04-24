import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { MainTabsParamList } from "../../navigation/MainTabs";
import Screen from "../../components/Screen";
import { auth, db } from "../../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { getNotifications } from "../../dbHelpers";
import { colors, fonts } from "../../theme/tokens";

const SECONDARY = colors.secondary;
const PRIMARY = colors.primary;
const CARD_BG = colors.card;
const FONT_ITALIC = fonts.italic;
const FONT_BOLD_ITALIC = fonts.boldItalic;

type Props = BottomTabScreenProps<MainTabsParamList, "Home">;

type Update = { icon: string; text: string; nickname: string };

export default function HomeScreen({ navigation }: Props) {
    const [nickname, setNickname] = useState("User");
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [safeWalks, setSafeWalks] = useState(0);
    const [helpedTotal, setHelpedTotal] = useState(0);
    const [updates, setUpdates] = useState<Update[]>([]);
    const uid = auth.currentUser?.uid;

    // Live listener on user document — stats update instantly
    useEffect(() => {
        if (!uid) return;

        const unsubscribe = onSnapshot(doc(db, "users", uid), (snap) => {
            if (!snap.exists()) return;
            const data = snap.data();
            const walks = data.safeWalkCount || 0;
            const answered = data.questionsAnswered || 0;
            setNickname(data.nickname || "User");
            setSafeWalks(walks);
            setQuestionsAnswered(answered);
            setHelpedTotal(walks + answered);
        });

        getNotifications(uid).then((notifs) => {
            const recent = notifs.slice(0, 5).map((n: any) => {
                const icons: Record<string, string> = {
                    new_answer: "😊",
                    walk_matched: "🚶",
                    walk_verified: "🔒",
                    walk_request_nearby: "📍",
                };
                return {
                    icon: icons[n.type] || "🔔",
                    text: n.message,
                    nickname: "Someone",
                };
            });
            setUpdates(recent);
        });

        return () => unsubscribe();
    }, [uid]);

    const compliments = [
        "Look at you!! Such a nice queen (✿◠‿◠✿)",
        "You're doing amazing things! ✨",
        "The campus is better because of you! 💛",
    ];
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];

    return (
        <Screen>
            <ScrollView
                style={styles.flex1}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Greeting */}
                <Text style={styles.greeting}>Hi {nickname}!</Text>

                {/* Compliment */}
                <Text style={styles.compliment}>{compliment}</Text>

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{questionsAnswered}</Text>
                        <Text style={styles.statLabel}>questions{"\n"}answered</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{safeWalks}</Text>
                        <Text style={styles.statLabel}>safe walk{"\n"}company</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{helpedTotal}</Text>
                        <Text style={styles.statLabel}>helped in{"\n"}total</Text>
                    </View>
                </View>

                {/* Recent activity */}
                <Text style={styles.sectionTitle}>Some of your recent activities</Text>

                {updates.length === 0 ? (
                    <Text style={styles.emptyText}>No recent activity yet. Start helping!</Text>
                ) : (
                    updates.map((u, i) => (
                        <View key={i} style={styles.activityCard}>
                            <View style={styles.activityAvatar}>
                                <Text style={styles.activityAvatarText}>{u.icon}</Text>
                            </View>
                            <Text style={styles.activityText}>{u.text}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 32 },
    greeting: {
        fontFamily: FONT_BOLD_ITALIC,
        fontSize: 36,
        color: PRIMARY,
        marginBottom: 20,
    },
    compliment: {
        fontFamily: FONT_ITALIC,
        fontSize: 16,
        color: SECONDARY,
        lineHeight: 24,
        marginBottom: 32,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 40,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statNumber: {
        fontFamily: FONT_ITALIC,
        fontSize: 40,
        color: PRIMARY,
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: FONT_ITALIC,
        fontSize: 13,
        color: PRIMARY,
        textAlign: "center",
        lineHeight: 18,
    },
    statDivider: {
        width: 1,
        height: 60,
        backgroundColor: colors.placeholder,
        marginTop: 8,
    },
    sectionTitle: {
        fontFamily: FONT_ITALIC,
        fontSize: 16,
        color: SECONDARY,
        marginBottom: 24,
    },
    emptyText: {
        fontFamily: FONT_ITALIC,
        color: PRIMARY,
        fontSize: 14,
        textAlign: "center",
        marginTop: 16,
    },
    activityCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    activityAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.avatarMuted,
        alignItems: "center",
        justifyContent: "center",
    },
    activityAvatarText: { fontSize: 22 },
    activityText: {
        flex: 1,
        fontFamily: FONT_ITALIC,
        fontSize: 14,
        color: PRIMARY,
        lineHeight: 20,
    },
});
