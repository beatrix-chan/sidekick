import { View, Text, Image } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "../../navigation/OnboardingStack";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
    return (
        <Screen>
            <View className="flex-1 px-6 pt-16 pb-10">
                {/* Logo / illustration area */}
                <View className="flex-1 items-center justify-center gap-6">
                    <View className="w-24 h-24 rounded-3xl bg-violet-600 items-center justify-center shadow-lg">
                        <Text className="text-white text-5xl">🛡️</Text>
                    </View>

                    <View className="items-center gap-2">
                        <Text className="text-4xl font-bold text-gray-900 tracking-tight">
                            SideKick
                        </Text>
                        <Text className="text-base text-gray-500 text-center leading-6 px-8">
                            Walk safer, learn faster — your trusted campus companion.
                        </Text>
                    </View>

                    {/* Feature pills */}
                    <View className="flex-row gap-2 mt-2 flex-wrap justify-center">
                        {["🚶 Safe Walk", "💬 Q&A", "🎓 Campus"].map((f) => (
                            <View
                                key={f}
                                className="px-4 py-1.5 bg-violet-50 rounded-full border border-violet-100"
                            >
                                <Text className="text-violet-700 text-sm font-medium">{f}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* CTA buttons */}
                <View className="gap-3">
                    <PrimaryButton
                        label="Get Started"
                        onPress={() => navigation.navigate("WhatIsSideKick")}
                    />
                    <PrimaryButton
                        label="I already have an account"
                        onPress={() => navigation.navigate("Register")}
                        style={{ backgroundColor: "transparent", borderWidth: 1.5, borderColor: "#111" }}
                    />
                </View>
            </View>
        </Screen>
    );
}
