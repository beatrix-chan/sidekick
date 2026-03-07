import { View, Text, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "../../navigation/OnboardingStack";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";

type Props = NativeStackScreenProps<OnboardingStackParamList, "WhatIsSideKick">;

const FEATURES = [
    {
        icon: "🚶‍♀️",
        title: "Safe Walk",
        description:
            "Match with a verified fellow student walking the same route. Confirm each other's identity using a one-time PIN, then walk together with confidence.",
    },
    {
        icon: "💬",
        title: "Trusted Q&A",
        description:
            "Get fast, reliable answers from students who've been there — modules, admin hassles, careers, campus life.",
    },
    {
        icon: "🎓",
        title: "Campus-Only Access",
        description:
            "Only verified university email addresses can join. Your nickname shields your real identity — we never show your name.",
    },
    {
        icon: "🔒",
        title: "Privacy First",
        description:
            "No real names. No photos. No strangers from outside campus. Just a trusted community of students.",
    },
];

export default function WhatIsSideKickScreen({ navigation }: Props) {
    return (
        <Screen>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="mb-8">
                    <Text className="text-3xl font-bold text-gray-900 leading-tight">
                        What is{"\n"}SideKick?
                    </Text>
                    <Text className="text-gray-500 text-base mt-2">
                        Your campus safety &amp; support network.
                    </Text>
                </View>

                {/* Feature cards */}
                <View className="gap-4 mb-10">
                    {FEATURES.map((f) => (
                        <View
                            key={f.title}
                            className="bg-gray-50 rounded-2xl p-5 border border-gray-100"
                        >
                            <View className="flex-row items-center gap-3 mb-2">
                                <View className="w-10 h-10 rounded-xl bg-violet-100 items-center justify-center">
                                    <Text className="text-xl">{f.icon}</Text>
                                </View>
                                <Text className="text-gray-900 font-semibold text-base">
                                    {f.title}
                                </Text>
                            </View>
                            <Text className="text-gray-500 text-sm leading-5">
                                {f.description}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* CTA */}
                <PrimaryButton
                    label="Next — Create Account"
                    onPress={() => navigation.navigate("Register")}
                />

                <Text
                    className="text-center text-gray-400 text-sm mt-4"
                    onPress={() => navigation.goBack()}
                >
                    ← Back
                </Text>
            </ScrollView>
        </Screen>
    );
}
