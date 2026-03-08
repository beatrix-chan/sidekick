import { useState, useEffect } from "react";
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
    FlatList,
} from "react-native";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import { auth } from "../../firebase";
import {
    createQuestion,
    getQuestion,
    createAnswer,
    getAnswers,
    markAnswerHelpful,
    getUserProfile,
    subscribeToQuestions,
    deleteQuestion,
    deleteAnswer,
} from "../../dbHelpers";

const SECONDARY = "#5b798a";
const PRIMARY = "#85817d";
const CARD_BG = "#ddd9d4";
const INPUT_BG = "#f9f4ee";
const BG = "#f4ece4";

type Question = {
    id: string;
    authorId: string;
    authorNickname: string;
    course: string;
    level: number;
    title: string;
    body: string;
    createdAt: any;
    answerCount: number;
};

type Answer = {
    id: string;
    authorId: string;
    authorNickname: string;
    body: string;
    helpfulCount: number;
    createdAt: any;
};

// Figma filter tabs
const FILTER_TABS = ["Priority", "Course", "Level", "Academic"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

// Sub-options for "Level"
const LEVEL_OPTIONS = [1, 2, 3, 4];

// Sub-options for "Course"
const COURSE_OPTIONS = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Engineering",
    "Economics",
    "Psychology",
    "Business",
    "Law",
];

export default function QAScreen() {
    // Filter state
    const [activeTab, setActiveTab] = useState<FilterTab | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

    // Data
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    // Question detail
    const [detailQuestion, setDetailQuestion] = useState<Question | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);

    // Ask modal
    const [askVisible, setAskVisible] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newBody, setNewBody] = useState("");
    const [newCourse, setNewCourse] = useState("");
    const [newLevel, setNewLevel] = useState(1);

    // Answer modal
    const [answerVisible, setAnswerVisible] = useState(false);
    const [newAnswer, setNewAnswer] = useState("");

    // ── Live subscription to questions ──
    useEffect(() => {
        const unsubscribe = subscribeToQuestions(async (data) => {
            const withExtras = await Promise.all(
                data.map(async (q: any) => {
                    const profile = await getUserProfile(q.authorId);
                    return {
                        ...q,
                        course: q.course || q.category || "",
                        level: q.level || 1,
                        authorNickname: profile?.nickname || "Anonymous",
                        answerCount: q.answerCount || 0,
                    };
                })
            );
            setQuestions(withExtras as Question[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // ── Filter logic ──
    function handleTabPress(tab: FilterTab) {
        if (activeTab === tab) {
            // Toggle off
            setActiveTab(null);
            setSelectedLevel(null);
            setSelectedCourse(null);
        } else {
            setActiveTab(tab);
            setSelectedLevel(null);
            setSelectedCourse(null);
        }
    }

    const filtered = questions.filter((q) => {
        if (selectedLevel !== null) return q.level === selectedLevel;
        if (selectedCourse !== null) return q.course === selectedCourse;
        return true;
    });

    // ── Open question detail ──
    async function openQuestion(q: Question) {
        setDetailQuestion(q);
        try {
            const data = await getAnswers(q.id);
            const withNicknames = await Promise.all(
                data.map(async (a: any) => {
                    const profile = await getUserProfile(a.authorId);
                    return { ...a, authorNickname: profile?.nickname || "Anonymous" };
                })
            );
            // Most upvoted answer first
            withNicknames.sort((a: any, b: any) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
            setAnswers(withNicknames as Answer[]);
        } catch (e) {
            console.error("Failed to load answers:", e);
        }
    }

    // ── Post question ──
    async function handlePostQuestion() {
        const uid = auth.currentUser?.uid;
        if (!uid || !newTitle.trim()) {
            Alert.alert("Error", "Please enter a title for your question.");
            return;
        }
        try {
            await createQuestion(uid, newTitle.trim(), newBody.trim(), newCourse.trim(), newLevel);
            setAskVisible(false);
            setNewTitle("");
            setNewBody("");
            setNewCourse("");
            setNewLevel(1);
        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    }

    // ── Post answer ──
    async function handlePostAnswer() {
        const uid = auth.currentUser?.uid;
        if (!uid || !detailQuestion || !newAnswer.trim()) {
            Alert.alert("Error", "Please write an answer.");
            return;
        }
        try {
            await createAnswer(detailQuestion.id, uid, newAnswer.trim());
            setNewAnswer("");
            setAnswerVisible(false);
            // Refresh answers
            await openQuestion(detailQuestion);
        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    }

    async function handleMarkHelpful(answerId: string) {
        const uid = auth.currentUser?.uid;
        if (!detailQuestion || !uid) return;
        const didUpvote = await markAnswerHelpful(detailQuestion.id, answerId, uid);
        if (!didUpvote) {
            Alert.alert("Already upvoted", "You can only upvote an answer once.");
            return;
        }
        openQuestion(detailQuestion);
    }

    async function handleDeleteQuestion() {
        const uid = auth.currentUser?.uid;
        if (!detailQuestion || !uid) return;
        Alert.alert("Delete Question", "Are you sure you want to delete this question? All answers will also be removed.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await deleteQuestion(detailQuestion.id, uid);
                        setDetailQuestion(null);
                        setAnswers([]);
                    } catch (e: any) {
                        Alert.alert("Error", e.message);
                    }
                }
            },
        ]);
    }

    async function handleDeleteAnswer(answerId: string) {
        const uid = auth.currentUser?.uid;
        if (!detailQuestion || !uid) return;
        Alert.alert("Delete Answer", "Are you sure you want to delete this answer?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await deleteAnswer(detailQuestion.id, answerId, uid);
                        await openQuestion(detailQuestion);
                    } catch (e: any) {
                        Alert.alert("Error", e.message);
                    }
                }
            },
        ]);
    }

    function timeAgo(timestamp: any): string {
        if (!timestamp?.seconds) return "";
        const diff = Date.now() - timestamp.seconds * 1000;
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} minutes ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    }

    // Build tags for display on cards
    function getCardTags(q: Question): string[] {
        const tags: string[] = [];
        if (q.course) tags.push(q.course);
        if (q.level) tags.push(`Level ${q.level}`);
        return tags;
    }

    return (
        <Screen>
            <View style={styles.flex1}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>
                        Some of your peers need help!
                    </Text>

                    {/* Filter tabs — match Figma: Priority, Course, Level, Academic */}
                    <View style={styles.filterRow}>
                        {FILTER_TABS.map((tab) => (
                            <Pressable
                                key={tab}
                                onPress={() => handleTabPress(tab)}
                                style={[
                                    styles.filterPill,
                                    activeTab === tab && styles.filterPillActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.filterPillText,
                                        activeTab === tab && styles.filterPillTextActive,
                                    ]}
                                >
                                    {tab}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Sub-filters for Level */}
                    {activeTab === "Level" && (
                        <View style={styles.subFilterRow}>
                            {LEVEL_OPTIONS.map((lvl) => (
                                <Pressable
                                    key={lvl}
                                    onPress={() =>
                                        setSelectedLevel(selectedLevel === lvl ? null : lvl)
                                    }
                                    style={[
                                        styles.subPill,
                                        selectedLevel === lvl && styles.subPillActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.subPillText,
                                            selectedLevel === lvl && styles.subPillTextActive,
                                        ]}
                                    >
                                        Level {lvl}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    {/* Sub-filters for Course */}
                    {activeTab === "Course" && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.subFilterScroll}
                            contentContainerStyle={styles.subFilterRow}
                        >
                            {COURSE_OPTIONS.map((course) => (
                                <Pressable
                                    key={course}
                                    onPress={() =>
                                        setSelectedCourse(selectedCourse === course ? null : course)
                                    }
                                    style={[
                                        styles.subPill,
                                        selectedCourse === course && styles.subPillActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.subPillText,
                                            selectedCourse === course && styles.subPillTextActive,
                                        ]}
                                    >
                                        {course}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Question list */}
                <ScrollView
                    style={styles.flex1}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                >
                    {loading ? (
                        <ActivityIndicator
                            size="large"
                            color={SECONDARY}
                            style={{ marginTop: 40 }}
                        />
                    ) : filtered.length === 0 ? (
                        <Text style={styles.emptyText}>
                            No questions yet. Be the first to ask!
                        </Text>
                    ) : (
                        filtered.map((q) => {
                            const tags = getCardTags(q);
                            const visibleTag = tags[0] || "";
                            const extraCount = Math.max(0, tags.length - 1);

                            return (
                                <Pressable
                                    key={q.id}
                                    onPress={() => openQuestion(q)}
                                    style={styles.questionCard}
                                >
                                    <Text style={styles.questionTitle}>{q.title}</Text>
                                    <Text style={styles.questionBody} numberOfLines={3}>
                                        {q.body}
                                    </Text>

                                    <View style={styles.questionDivider} />

                                    <Text style={styles.questionMeta}>
                                        <Text style={styles.questionMetaBold}>
                                            {q.authorNickname}
                                        </Text>
                                        {" "}posted this {timeAgo(q.createdAt)}
                                    </Text>

                                    <View style={styles.questionFooter}>
                                        <View style={styles.tagRow}>
                                            {visibleTag ? (
                                                <View style={styles.categoryBadge}>
                                                    <Text style={styles.categoryBadgeText}>
                                                        {visibleTag}
                                                    </Text>
                                                </View>
                                            ) : null}
                                            {extraCount > 0 && (
                                                <Text style={styles.extraTagText}>
                                                    +{extraCount}
                                                </Text>
                                            )}
                                        </View>
                                        <Text style={styles.answerCountText}>
                                            {q.answerCount === 0
                                                ? "No answers yet"
                                                : q.answerCount === 1
                                                ? "1 person has answered"
                                                : `${q.answerCount} people have answered`}
                                        </Text>
                                    </View>
                                </Pressable>
                            );
                        })
                    )}

                    {/* Ask button */}
                    <Pressable
                        onPress={() => setAskVisible(true)}
                        style={styles.fab}
                    >
                        <Text style={styles.fabText}>+ Ask a Question</Text>
                    </Pressable>
                </ScrollView>
            </View>

            {/* ══════════ Question Detail Modal ══════════ */}
            <Modal
                visible={detailQuestion !== null}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => {
                    setDetailQuestion(null);
                    setAnswerVisible(false);
                    setNewAnswer("");
                }}
            >
                {detailQuestion && (
                    <KeyboardAvoidingView
                        style={[styles.modalWrap, { backgroundColor: BG }]}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                    >
                        <View style={styles.modalTopBar}>
                            <Pressable
                                onPress={() => {
                                    setDetailQuestion(null);
                                    setAnswerVisible(false);
                                    setNewAnswer("");
                                }}
                            >
                                <Text style={styles.backText}>← Back</Text>
                            </Pressable>
                        </View>

                        <ScrollView
                            style={styles.flex1}
                            contentContainerStyle={styles.modalScrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text style={styles.detailTitle}>{detailQuestion.title}</Text>
                            <Text style={styles.detailMeta}>
                                Asked by{" "}
                                <Text style={styles.questionMetaBold}>
                                    {detailQuestion.authorNickname}
                                </Text>
                                {" · "}
                                {timeAgo(detailQuestion.createdAt)}
                            </Text>
                            <Text style={styles.detailBody}>{detailQuestion.body}</Text>

                            {/* Delete question button (owner only) */}
                            {auth.currentUser?.uid === detailQuestion.authorId && (
                                <Pressable onPress={handleDeleteQuestion} style={styles.deleteRow}>
                                    <Text style={styles.deleteText}>🗑️ Delete this question</Text>
                                </Pressable>
                            )}

                            <View style={styles.questionDivider} />

                            <Text style={styles.answersLabel}>
                                Answers ({answers.length})
                            </Text>
                            {answers.map((a) => (
                                <View key={a.id} style={styles.answerCard}>
                                    <Text style={styles.answerBody}>{a.body}</Text>
                                    <View style={styles.answerFooter}>
                                        <Text style={styles.answerAuthor}>
                                            by {a.authorNickname}
                                        </Text>
                                        <View style={styles.answerActions}>
                                            {auth.currentUser?.uid === a.authorId && (
                                                <Pressable onPress={() => handleDeleteAnswer(a.id)}>
                                                    <Text style={styles.deleteAnswerText}>🗑️</Text>
                                                </Pressable>
                                            )}
                                            <Pressable onPress={() => handleMarkHelpful(a.id)}>
                                                <Text style={styles.helpfulText}>
                                                    👍 {a.helpfulCount}
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            ))}

                            {/* Inline answer input (shown when user taps "Add an Answer") */}
                            {answerVisible && (
                                <View style={styles.inlineAnswerBox}>
                                    <Text style={styles.answersLabel}>Your Answer</Text>
                                    <TextInput
                                        style={styles.multilineInput}
                                        placeholder="Write your answer..."
                                        placeholderTextColor="#b5b0ab"
                                        multiline
                                        textAlignVertical="top"
                                        value={newAnswer}
                                        onChangeText={setNewAnswer}
                                        autoFocus
                                    />
                                    <View style={{ marginTop: 12 }}>
                                        <PrimaryButton label="Post Answer" onPress={handlePostAnswer} />
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {!answerVisible && (
                            <View style={styles.modalBottomBar}>
                                <PrimaryButton
                                    label="Add an Answer"
                                    onPress={() => setAnswerVisible(true)}
                                />
                            </View>
                        )}
                    </KeyboardAvoidingView>
                )}
            </Modal>

            {/* ══════════ Ask Question Modal ══════════ */}
            <Modal
                visible={askVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setAskVisible(false)}
            >
                <KeyboardAvoidingView
                    style={[styles.modalWrap, { backgroundColor: BG }]}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <View style={styles.formTopBar}>
                        <Text style={styles.formTitle}>Ask a Question</Text>
                        <Pressable onPress={() => setAskVisible(false)}>
                            <Text style={styles.backText}>Cancel</Text>
                        </Pressable>
                    </View>
                    <ScrollView
                        style={styles.formBody}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ gap: 20 }}
                    >
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Title</Text>
                            <TextInput
                                style={styles.singleInput}
                                placeholder="Short summary of your question"
                                placeholderTextColor="#b5b0ab"
                                value={newTitle}
                                onChangeText={setNewTitle}
                            />
                        </View>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Details</Text>
                            <TextInput
                                style={styles.multilineInput}
                                placeholder="What would you like to ask?"
                                placeholderTextColor="#b5b0ab"
                                multiline
                                textAlignVertical="top"
                                value={newBody}
                                onChangeText={setNewBody}
                            />
                        </View>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Course</Text>
                            <TextInput
                                style={styles.singleInput}
                                placeholder="e.g. Computer Science, Physics"
                                placeholderTextColor="#b5b0ab"
                                value={newCourse}
                                onChangeText={setNewCourse}
                            />
                        </View>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Level (year of study)</Text>
                            <View style={styles.filterRow}>
                                {[1, 2, 3, 4].map((lvl) => (
                                    <Pressable
                                        key={lvl}
                                        onPress={() => setNewLevel(lvl)}
                                        style={[
                                            styles.filterPill,
                                            newLevel === lvl && styles.filterPillActive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.filterPillText,
                                                newLevel === lvl && styles.filterPillTextActive,
                                            ]}
                                        >
                                            Level {lvl}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                    <View style={styles.formBottomBar}>
                        <PrimaryButton label="Post Question" onPress={handlePostQuestion} />
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </Screen>
    );
}

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    header: {
        paddingHorizontal: 24,
        paddingTop: 56,
        paddingBottom: 16,
    },
    headerTitle: {
        fontFamily: "Georgia-Italic",
        fontSize: 16,
        color: SECONDARY,
        marginBottom: 16,
    },
    // Filter pills (top-level)
    filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: PRIMARY,
    },
    filterPillActive: {
        backgroundColor: "#9a958f",
        borderColor: "#9a958f",
    },
    filterPillText: {
        fontFamily: "Georgia-Italic",
        fontSize: 14,
        color: PRIMARY,
    },
    filterPillTextActive: { color: "#fff" },
    // Sub-filter pills
    subFilterScroll: { marginTop: 10 },
    subFilterRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 10,
    },
    subPill: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: SECONDARY,
    },
    subPillActive: {
        backgroundColor: SECONDARY,
        borderColor: SECONDARY,
    },
    subPillText: {
        fontFamily: "Georgia-Italic",
        fontSize: 12,
        color: SECONDARY,
    },
    subPillTextActive: { color: "#fff" },
    // List
    listContent: { paddingHorizontal: 24, paddingBottom: 32, gap: 16 },
    emptyText: {
        fontFamily: "Georgia-Italic",
        color: PRIMARY,
        textAlign: "center",
        marginTop: 32,
    },
    // Question card
    questionCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 20,
    },
    questionTitle: {
        fontFamily: "Georgia-BoldItalic",
        fontSize: 18,
        color: PRIMARY,
        marginBottom: 8,
    },
    questionBody: {
        fontFamily: "Georgia-Italic",
        fontSize: 14,
        color: PRIMARY,
        lineHeight: 20,
    },
    questionDivider: {
        height: 1,
        backgroundColor: "#b5b0ab",
        marginVertical: 12,
    },
    questionMeta: {
        fontFamily: "Georgia-Italic",
        fontSize: 13,
        color: PRIMARY,
        marginBottom: 12,
    },
    questionMetaBold: {
        fontFamily: "Georgia-BoldItalic",
        textDecorationLine: "underline",
    },
    questionFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    tagRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: PRIMARY,
    },
    categoryBadgeText: {
        fontFamily: "Georgia-Italic",
        fontSize: 12,
        color: PRIMARY,
    },
    extraTagText: {
        fontFamily: "Georgia-Italic",
        fontSize: 12,
        color: PRIMARY,
    },
    answerCountText: {
        fontFamily: "Georgia-BoldItalic",
        fontSize: 12,
        color: SECONDARY,
    },
    fab: {
        alignSelf: "center",
        backgroundColor: "#9a958f",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 999,
        marginTop: 8,
    },
    fabText: {
        fontFamily: "Georgia",
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    // ── Shared modal styles ──
    modalWrap: { flex: 1 },
    modalTopBar: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 12,
    },
    backText: {
        fontFamily: "Georgia-Italic",
        color: SECONDARY,
        fontSize: 14,
    },
    modalScrollContent: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 32,
    },
    modalBottomBar: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        paddingTop: 12,
    },
    // Detail modal
    detailTitle: {
        fontFamily: "Georgia-BoldItalic",
        fontSize: 22,
        color: PRIMARY,
        marginBottom: 4,
    },
    detailMeta: {
        fontFamily: "Georgia-Italic",
        fontSize: 14,
        color: PRIMARY,
        marginBottom: 16,
    },
    detailBody: {
        fontFamily: "Georgia-Italic",
        color: PRIMARY,
        lineHeight: 22,
        fontSize: 15,
    },
    answersLabel: {
        fontFamily: "Georgia-Italic",
        fontSize: 14,
        color: SECONDARY,
        marginBottom: 12,
    },
    answerCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    answerBody: {
        fontFamily: "Georgia-Italic",
        color: PRIMARY,
        lineHeight: 20,
    },
    answerFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
    },
    answerAuthor: {
        fontFamily: "Georgia-Italic",
        color: PRIMARY,
        fontSize: 12,
    },
    helpfulText: {
        fontFamily: "Georgia-Italic",
        color: SECONDARY,
        fontSize: 12,
    },
    inlineAnswerBox: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#b5b0ab",
    },
    // Form modals
    formTopBar: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    formTitle: {
        fontFamily: "Georgia-BoldItalic",
        fontSize: 20,
        color: PRIMARY,
    },
    formBody: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
    formBottomBar: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12 },
    fieldGroup: { gap: 6 },
    fieldLabel: {
        fontFamily: "Georgia-Italic",
        fontSize: 14,
        color: PRIMARY,
    },
    singleInput: {
        borderRadius: 999,
        padding: 16,
        color: PRIMARY,
        fontFamily: "Georgia-Italic",
        fontSize: 16,
        backgroundColor: INPUT_BG,
    },
    multilineInput: {
        borderRadius: 16,
        padding: 16,
        color: PRIMARY,
        fontFamily: "Georgia-Italic",
        fontSize: 16,
        backgroundColor: INPUT_BG,
        minHeight: 120,
    },
    // Delete styles
    deleteRow: {
        marginTop: 12,
        alignSelf: "flex-start",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#c45c5c",
    },
    deleteText: {
        fontFamily: "Georgia-Italic",
        fontSize: 13,
        color: "#c45c5c",
    },
    answerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    deleteAnswerText: {
        fontSize: 16,
    },
});
