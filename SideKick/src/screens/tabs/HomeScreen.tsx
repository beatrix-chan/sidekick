import { View, Text, ScrollView, Pressable } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { MainTabsParamList } from "../../navigation/MainTabs";
import Screen from "../../components/Screen";

type Props = BottomTabScreenProps<MainTabsParamList, "Home">;

const QUICK_ACTIONS = [
    {
        icon: "💬",
        label: "Q&A",
        sublabel: "Ask & answer questions",
        color: "bg-indigo-50",
        border: "border-indigo-100",
        text: "text-indigo-700",
        tab: "QA" as keyof MainTabsParamList,
    },
    {
        icon: "🚶‍♀️",
        label: "Safe Walk",
        sublabel: "Find a walk buddy",
        color: "bg-violet-50",
        border: "border-violet-100",
        text: "text-violet-700",
        tab: "SafeWalk" as keyof MainTabsParamList,
    },
];

const UPDATES = [
    { icon: "✅", text: "Your Q&A post got 3 helpful votes." },
    { icon: "🚶", text: "A Safe Walk request is open near the library." },
    { icon: "🎓", text: "New answers in the Exams category." },
];

export default function HomeScreen({ navigation }: Props) {
    return (
        <Screen>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Greeting */}
                <View className="mb-8">
                    <Text className="text-gray-400 text-sm">Good morning 👋</Text>
                    <Text className="text-3xl font-bold text-gray-900 mt-0.5">
                        Hey, SnazzyOwl42
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">
                        What would you like to do today?
                    </Text>
                </View>

                {/* Quick Actions */}
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Quick Actions
                </Text>
                <View className="flex-row gap-3 mb-8">
                    {QUICK_ACTIONS.map((a) => (
                        <Pressable
                            key={a.label}
                            onPress={() => navigation.navigate(a.tab)}
                            className={`flex-1 ${a.color} border ${a.border} rounded-2xl p-4`}
                        >
                            <Text className="text-3xl mb-2">{a.icon}</Text>
                            <Text className={`font-semibold text-base ${a.text}`}>
                                {a.label}
                            </Text>
                            <Text className="text-gray-400 text-xs mt-0.5">{a.sublabel}</Text>
                        </Pressable>
                    ))}
                </View>

                {/* Status card */}
                <View className="bg-gray-900 rounded-2xl p-5 mb-8">
                    <View className="flex-row items-center gap-2 mb-1">
                        <View className="w-2 h-2 rounded-full bg-green-400" />
                        <Text className="text-green-400 text-xs font-medium">
                            Campus is active
                        </Text>
                    </View>
                    <Text className="text-white text-lg font-semibold">
                        3 walk requests open right now
                    </Text>
                    <Pressable
                        onPress={() => navigation.navigate("SafeWalk")}
                        className="mt-3 bg-white/10 rounded-xl py-2 px-4 self-start"
                    >
                        <Text className="text-white text-sm font-medium">View requests →</Text>
                    </Pressable>
                </View>

                {/* Updates */}
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Recent Activity
                </Text>
                <View className="gap-2">
                    {UPDATES.map((u) => (
                        <View
                            key={u.text}
                            className="flex-row items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100"
                        >
                            <Text className="text-lg">{u.icon}</Text>
                            <Text className="flex-1 text-gray-700 text-sm leading-5">{u.text}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </Screen>
    );
}
