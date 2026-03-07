import { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";

type Question = {
    id: string;
    author: string;
    category: string;
    title: string;
    body: string;
    answers: number;
    helpful: number;
    time: string;
    topAnswer?: string;
};

const MOCK_QUESTIONS: Question[] = [
    {
        id: "1",
        author: "SnazzyOwl42",
        category: "Exams",
        title: "How do I apply for an exam deferral?",
        body: "I've had a family emergency and need to defer my January exams. Who do I contact and what evidence do I need?",
        answers: 4,
        helpful: 12,
        time: "2h ago",
        topAnswer:
            "Go to your student portal → Support & Wellbeing → Extenuating Circumstances. You'll need a self-cert or a supporting document. Apply at least 3 days before the exam.",
    },
    {
        id: "2",
        author: "BubblyCrane88",
        category: "Admin",
        title: "How long does a council tax exemption letter take?",
        body: "My landlord is asking for proof I'm a full-time student. Any idea how long the registry takes to send the letter?",
        answers: 2,
        helpful: 7,
        time: "5h ago",
        topAnswer: "Usually 3-5 working days via email. Go to the Registry page on the student portal.",
    },
    {
        id: "3",
        author: "CalmBadger19",
        category: "Careers",
        title: "Best time to apply for summer internships?",
        body: "Is October/November too early for summer internships at big tech companies?",
        answers: 6,
        helpful: 21,
        time: "1d ago",
        topAnswer:
            "Not at all — for big tech, October/November is actually the sweet spot. Many close applications in December. Start your CV review in September.",
    },
    {
        id: "4",
        author: "QuietMaple77",
        category: "Campus",
        title: "Is the library open on bank holidays?",
        body: "Trying to plan my revision schedule around the upcoming bank holiday.",
        answers: 1,
        helpful: 3,
        time: "2d ago",
        topAnswer: "The 24/7 study area stays open but the main desks close. Check the library website for exact hours.",
    },
];

const CATEGORIES = ["All", "Exams", "Admin", "Careers", "Campus"];

const CATEGORY_COLORS: Record<string, string> = {
    Exams: "bg-red-50 text-red-600 border-red-100",
    Admin: "bg-blue-50 text-blue-600 border-blue-100",
    Careers: "bg-green-50 text-green-600 border-green-100",
    Campus: "bg-yellow-50 text-yellow-600 border-yellow-100",
};

export default function QAScreen() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [selected, setSelected] = useState<Question | null>(null);
    const [askVisible, setAskVisible] = useState(false);
    const [newQuestion, setNewQuestion] = useState("");

    const filtered =
        activeCategory === "All"
            ? MOCK_QUESTIONS
            : MOCK_QUESTIONS.filter((q) => q.category === activeCategory);

    return (
        <Screen>
            <View className="flex-1">
                {/* Header */}
                <View className="px-5 pt-12 pb-4 flex-row items-center justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">Q&amp;A</Text>
                        <Text className="text-gray-400 text-sm">Ask the campus community</Text>
                    </View>
                    <Pressable
                        onPress={() => setAskVisible(true)}
                        className="bg-violet-600 rounded-xl px-4 py-2"
                    >
                        <Text className="text-white font-semibold text-sm">+ Ask</Text>
                    </Pressable>
                </View>

                {/* Category filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 4 }}
                    className="mb-2"
                >
                    {CATEGORIES.map((cat) => (
                        <Pressable
                            key={cat}
                            onPress={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full border ${
                                cat === activeCategory
                                    ? "bg-violet-600 border-violet-600"
                                    : "bg-white border-gray-200"
                            }`}
                        >
                            <Text
                                className={`text-sm font-medium ${
                                    cat === activeCategory ? "text-white" : "text-gray-500"
                                }`}
                            >
                                {cat}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* Question list */}
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 20, gap: 12 }}
                    showsVerticalScrollIndicator={false}
                >
                    {filtered.map((q) => (
                        <Pressable
                            key={q.id}
                            onPress={() => setSelected(q)}
                            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                        >
                            <View className="flex-row items-center gap-2 mb-2">
                                <View
                                    className={`px-2.5 py-0.5 rounded-full border ${
                                        CATEGORY_COLORS[q.category] ??
                                        "bg-gray-50 text-gray-500 border-gray-100"
                                    }`}
                                >
                                    <Text className="text-xs font-medium">{q.category}</Text>
                                </View>
                                <Text className="text-gray-400 text-xs ml-auto">{q.time}</Text>
                            </View>
                            <Text className="text-gray-900 font-semibold text-base leading-5 mb-1">
                                {q.title}
                            </Text>
                            <Text className="text-gray-400 text-sm leading-5" numberOfLines={2}>
                                {q.body}
                            </Text>
                            <View className="flex-row gap-4 mt-3">
                                <Text className="text-gray-400 text-xs">
                                    💬 {q.answers} answers
                                </Text>
                                <Text className="text-gray-400 text-xs">
                                    👍 {q.helpful} helpful
                                </Text>
                                <Text className="text-gray-400 text-xs ml-auto">
                                    by {q.author}
                                </Text>
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Question Detail Modal */}
            <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet">
                {selected && (
                    <View className="flex-1 bg-white">
                        <View className="px-5 pt-6 pb-4 border-b border-gray-100">
                            <View className="flex-row items-center justify-between mb-3">
                                <View
                                    className={`px-2.5 py-0.5 rounded-full border ${
                                        CATEGORY_COLORS[selected.category] ??
                                        "bg-gray-50 text-gray-500 border-gray-100"
                                    }`}
                                >
                                    <Text className="text-xs font-medium">{selected.category}</Text>
                                </View>
                                <Pressable onPress={() => setSelected(null)}>
                                    <Text className="text-gray-400 text-sm">Close ✕</Text>
                                </Pressable>
                            </View>
                            <Text className="text-xl font-bold text-gray-900 leading-6">
                                {selected.title}
                            </Text>
                            <Text className="text-gray-500 text-sm mt-1">
                                Asked by {selected.author} · {selected.time}
                            </Text>
                        </View>

                        <ScrollView
                            className="flex-1 px-5 pt-5"
                            showsVerticalScrollIndicator={false}
                        >
                            <Text className="text-gray-700 leading-6 mb-6">{selected.body}</Text>

                            {selected.topAnswer && (
                                <View>
                                    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                                        Top Answer
                                    </Text>
                                    <View className="bg-green-50 border border-green-100 rounded-2xl p-4">
                                        <View className="flex-row items-center gap-2 mb-2">
                                            <Text className="text-green-600 text-sm font-semibold">
                                                ✅ Most Helpful
                                            </Text>
                                        </View>
                                        <Text className="text-gray-700 leading-5">
                                            {selected.topAnswer}
                                        </Text>
                                        <Pressable className="flex-row items-center gap-1 mt-3">
                                            <Text className="text-gray-400 text-xs">
                                                👍 Mark as helpful
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        <View className="px-5 pb-8 pt-3 border-t border-gray-100">
                            <PrimaryButton
                                label="Add an Answer"
                                onPress={() => setSelected(null)}
                            />
                        </View>
                    </View>
                )}
            </Modal>

            {/* Ask Question Modal */}
            <Modal visible={askVisible} animationType="slide" presentationStyle="pageSheet">
                <KeyboardAvoidingView
                    className="flex-1 bg-white"
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <View className="px-5 pt-6 pb-4 border-b border-gray-100 flex-row items-center justify-between">
                        <Text className="text-xl font-bold text-gray-900">Ask a Question</Text>
                        <Pressable onPress={() => setAskVisible(false)}>
                            <Text className="text-gray-400 text-sm">Cancel</Text>
                        </Pressable>
                    </View>
                    <ScrollView
                        className="flex-1 px-5 pt-5"
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text className="text-sm font-medium text-gray-700 mb-1.5">
                            Your question
                        </Text>
                        <TextInput
                            className="border border-gray-200 rounded-xl p-4 text-gray-900 text-base bg-gray-50 min-h-[120px]"
                            placeholder="What would you like to ask the campus community?"
                            placeholderTextColor="#9ca3af"
                            multiline
                            textAlignVertical="top"
                            value={newQuestion}
                            onChangeText={setNewQuestion}
                        />
                        <Text className="text-gray-400 text-xs mt-2">
                            Be specific and include relevant context.
                        </Text>
                    </ScrollView>
                    <View className="px-5 pb-8 pt-3">
                        <PrimaryButton
                            label="Post Question"
                            onPress={() => setAskVisible(false)}
                        />
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </Screen>
    );
}
