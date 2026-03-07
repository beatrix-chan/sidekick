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

type WalkRequest = {
    id: string;
    author: string;
    from: string;
    to: string;
    leavingIn: string;
    posted: string;
};

const MOCK_REQUESTS: WalkRequest[] = [
    {
        id: "1",
        author: "BubblyCrane88",
        from: "Main Library",
        to: "Halls of Residence (North)",
        leavingIn: "Now",
        posted: "2 min ago",
    },
    {
        id: "2",
        author: "CalmBadger19",
        from: "Student Union",
        to: "Sports Centre",
        leavingIn: "In 5 min",
        posted: "7 min ago",
    },
    {
        id: "3",
        author: "QuietMaple77",
        from: "Engineering Building",
        to: "Town Centre Bus Stop",
        leavingIn: "In 10 min",
        posted: "12 min ago",
    },
];

const LEAVE_OPTIONS = ["Now", "In 5 min", "In 10 min", "In 15 min"];

type SessionState = "matched" | "verified" | "active";

export default function SafeWalkScreen() {
    const [createVisible, setCreateVisible] = useState(false);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [leaveOption, setLeaveOption] = useState("Now");

    const [session, setSession] = useState<WalkRequest | null>(null);
    const [sessionState, setSessionState] = useState<SessionState>("matched");
    const [partnerPin, setPartnerPin] = useState("");
    const [pinError, setPinError] = useState("");

    // Mock: user's own PIN for this session
    const MY_PIN = "7834";
    const PARTNER_PIN_CORRECT = "2951";

    function handleAccept(req: WalkRequest) {
        setSession(req);
        setSessionState("matched");
        setPartnerPin("");
        setPinError("");
    }

    function handleVerifyPin() {
        if (partnerPin === PARTNER_PIN_CORRECT) {
            setSessionState("verified");
            setPinError("");
        } else {
            setPinError("Incorrect PIN. Ask your partner to confirm.");
        }
    }

    function handleEndSession() {
        setSession(null);
        setPartnerPin("");
        setPinError("");
    }

    return (
        <Screen>
            <View className="flex-1">
                {/* Header */}
                <View className="px-5 pt-12 pb-4 flex-row items-center justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">Safe Walk</Text>
                        <Text className="text-gray-400 text-sm">
                            Find a verified walk buddy
                        </Text>
                    </View>
                    <Pressable
                        onPress={() => setCreateVisible(true)}
                        className="bg-violet-600 rounded-xl px-4 py-2"
                    >
                        <Text className="text-white font-semibold text-sm">+ Create</Text>
                    </Pressable>
                </View>

                {/* Request list */}
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 20, gap: 12 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                        Open requests ({MOCK_REQUESTS.length})
                    </Text>
                    {MOCK_REQUESTS.map((req) => (
                        <View
                            key={req.id}
                            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                        >
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-8 h-8 rounded-full bg-violet-100 items-center justify-center">
                                        <Text className="text-violet-600 text-xs font-bold">
                                            {req.author.slice(0, 2).toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-700 font-medium text-sm">
                                        {req.author}
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <View className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                    <Text className="text-green-600 text-xs font-medium">
                                        {req.leavingIn}
                                    </Text>
                                </View>
                            </View>

                            <View className="gap-1 mb-3">
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-gray-400 text-xs w-6">From</Text>
                                    <Text className="text-gray-700 text-sm font-medium flex-1">
                                        {req.from}
                                    </Text>
                                </View>
                                <View className="ml-6 w-px h-3 bg-gray-200 self-center" />
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-gray-400 text-xs w-6">To</Text>
                                    <Text className="text-gray-700 text-sm font-medium flex-1">
                                        {req.to}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between">
                                <Text className="text-gray-400 text-xs">{req.posted}</Text>
                                <Pressable
                                    onPress={() => handleAccept(req)}
                                    className="bg-violet-600 rounded-xl px-4 py-1.5"
                                >
                                    <Text className="text-white text-sm font-semibold">
                                        Accept
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Create Request Modal */}
            <Modal visible={createVisible} animationType="slide" presentationStyle="pageSheet">
                <KeyboardAvoidingView
                    className="flex-1 bg-white"
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <View className="px-5 pt-6 pb-4 border-b border-gray-100 flex-row items-center justify-between">
                        <Text className="text-xl font-bold text-gray-900">New Walk Request</Text>
                        <Pressable onPress={() => setCreateVisible(false)}>
                            <Text className="text-gray-400 text-sm">Cancel</Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        className="flex-1 px-5 pt-5"
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ gap: 20 }}
                    >
                        {/* From */}
                        <View className="gap-1.5">
                            <Text className="text-sm font-medium text-gray-700">From</Text>
                            <TextInput
                                className="h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-base"
                                placeholder="e.g. Main Library"
                                placeholderTextColor="#9ca3af"
                                value={from}
                                onChangeText={setFrom}
                            />
                        </View>

                        {/* To */}
                        <View className="gap-1.5">
                            <Text className="text-sm font-medium text-gray-700">To</Text>
                            <TextInput
                                className="h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-base"
                                placeholder="e.g. North Halls"
                                placeholderTextColor="#9ca3af"
                                value={to}
                                onChangeText={setTo}
                            />
                        </View>

                        {/* Leaving */}
                        <View className="gap-1.5">
                            <Text className="text-sm font-medium text-gray-700">Leaving</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {LEAVE_OPTIONS.map((opt) => (
                                    <Pressable
                                        key={opt}
                                        onPress={() => setLeaveOption(opt)}
                                        className={`px-4 py-2 rounded-xl border ${
                                            leaveOption === opt
                                                ? "bg-violet-600 border-violet-600"
                                                : "bg-white border-gray-200"
                                        }`}
                                    >
                                        <Text
                                            className={`text-sm font-medium ${
                                                leaveOption === opt
                                                    ? "text-white"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            {opt}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <View className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                            <Text className="text-violet-700 text-sm leading-5">
                                🔒 Your request will be visible to verified campus members only.
                                Your real name is never shown.
                            </Text>
                        </View>
                    </ScrollView>

                    <View className="px-5 pb-8 pt-3">
                        <PrimaryButton
                            label="Post Request"
                            onPress={() => setCreateVisible(false)}
                        />
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Session Panel Modal */}
            <Modal visible={!!session} animationType="slide" presentationStyle="pageSheet">
                {session && (
                    <View className="flex-1 bg-white">
                        <View className="px-5 pt-6 pb-4 border-b border-gray-100">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-xl font-bold text-gray-900">
                                    Walk Session
                                </Text>
                                <View
                                    className={`px-3 py-1 rounded-full ${
                                        sessionState === "verified"
                                            ? "bg-green-100"
                                            : "bg-yellow-100"
                                    }`}
                                >
                                    <Text
                                        className={`text-xs font-semibold ${
                                            sessionState === "verified"
                                                ? "text-green-700"
                                                : "text-yellow-700"
                                        }`}
                                    >
                                        {sessionState === "verified" ? "✅ Verified" : "⏳ Matched"}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <ScrollView
                            className="flex-1 px-5 pt-5"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ gap: 20 }}
                        >
                            {/* Route summary */}
                            <View className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Text className="text-gray-400 text-xs">From</Text>
                                    <Text className="text-gray-700 font-medium text-sm">
                                        {session.from}
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-gray-400 text-xs">To</Text>
                                    <Text className="text-gray-700 font-medium text-sm">
                                        {session.to}
                                    </Text>
                                </View>
                            </View>

                            {/* Partners */}
                            <View className="flex-row gap-3">
                                <View className="flex-1 bg-violet-50 border border-violet-100 rounded-2xl p-4 items-center">
                                    <Text className="text-violet-400 text-xs mb-1">You</Text>
                                    <Text className="text-violet-700 font-bold text-sm">
                                        SnazzyOwl42
                                    </Text>
                                </View>
                                <View className="items-center justify-center">
                                    <Text className="text-gray-300 text-xl">↔</Text>
                                </View>
                                <View className="flex-1 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 items-center">
                                    <Text className="text-indigo-400 text-xs mb-1">Partner</Text>
                                    <Text className="text-indigo-700 font-bold text-sm">
                                        {session.author}
                                    </Text>
                                </View>
                            </View>

                            {/* Your PIN */}
                            <View className="bg-gray-900 rounded-2xl p-5">
                                <Text className="text-gray-400 text-xs mb-2">
                                    Your PIN — share with your partner
                                </Text>
                                <View className="flex-row gap-3 justify-center">
                                    {MY_PIN.split("").map((digit, i) => (
                                        <View
                                            key={i}
                                            className="w-12 h-14 bg-white/10 rounded-xl items-center justify-center"
                                        >
                                            <Text className="text-white text-2xl font-bold">
                                                {digit}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                                <Text className="text-gray-500 text-xs text-center mt-3">
                                    Say these digits aloud to your partner
                                </Text>
                            </View>

                            {/* Enter partner PIN */}
                            {sessionState !== "verified" && (
                                <View className="gap-3">
                                    <Text className="text-sm font-medium text-gray-700">
                                        Enter your partner's PIN
                                    </Text>
                                    <TextInput
                                        className={`h-12 px-4 rounded-xl border text-center text-2xl font-bold tracking-widest ${
                                            pinError
                                                ? "border-red-400 bg-red-50"
                                                : "border-gray-200 bg-gray-50"
                                        } text-gray-900`}
                                        placeholder="• • • •"
                                        placeholderTextColor="#d1d5db"
                                        keyboardType="number-pad"
                                        maxLength={4}
                                        secureTextEntry
                                        value={partnerPin}
                                        onChangeText={(t) => {
                                            setPartnerPin(t);
                                            if (pinError) setPinError("");
                                        }}
                                    />
                                    {pinError ? (
                                        <Text className="text-red-500 text-xs">{pinError}</Text>
                                    ) : null}
                                    <PrimaryButton
                                        label="Verify PIN"
                                        onPress={handleVerifyPin}
                                    />
                                </View>
                            )}

                            {sessionState === "verified" && (
                                <View className="bg-green-50 border border-green-100 rounded-2xl p-4">
                                    <Text className="text-green-700 font-semibold text-base mb-1">
                                        ✅ Identity confirmed!
                                    </Text>
                                    <Text className="text-green-600 text-sm leading-5">
                                        Both PINs matched. Your walk session is active. Stay safe
                                        and enjoy the campus!
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* End session */}
                        <View className="px-5 pb-8 pt-3 border-t border-gray-100">
                            <Pressable
                                onPress={handleEndSession}
                                className="h-12 items-center justify-center rounded-xl border border-red-200 bg-red-50"
                            >
                                <Text className="text-red-600 font-semibold">End Walk Session</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </Modal>
        </Screen>
    );
}
