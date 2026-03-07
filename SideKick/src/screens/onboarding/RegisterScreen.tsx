import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Pressable,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "../../navigation/OnboardingStack";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    function handleContinue() {
        if (!email.includes("@") || !email.includes(".")) {
            setEmailError("Please enter a valid university email address.");
            return;
        }
        setEmailError("");
        // Placeholder: navigate straight to MainTabs (no real auth)
        navigation.navigate("MainTabs");
    }

    return (
        <Screen>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 32 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Back */}
                    <Pressable onPress={() => navigation.goBack()} className="mb-8">
                        <Text className="text-gray-400 text-sm">← Back</Text>
                    </Pressable>

                    {/* Heading */}
                    <View className="mb-8">
                        <Text className="text-3xl font-bold text-gray-900">
                            Create account
                        </Text>
                        <Text className="text-gray-500 text-base mt-1">
                            Use your university email to join the campus community.
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="gap-5 flex-1">
                        {/* Email */}
                        <View className="gap-1.5">
                            <Text className="text-sm font-medium text-gray-700">
                                University email
                            </Text>
                            <TextInput
                                className={`h-12 px-4 rounded-xl border bg-gray-50 text-gray-900 text-base ${
                                    emailError ? "border-red-400" : "border-gray-200"
                                }`}
                                placeholder="yourname@university.ac.uk"
                                placeholderTextColor="#9ca3af"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={email}
                                onChangeText={(t) => {
                                    setEmail(t);
                                    if (emailError) setEmailError("");
                                }}
                            />
                            {emailError ? (
                                <Text className="text-red-500 text-xs">{emailError}</Text>
                            ) : null}
                        </View>

                        {/* Privacy note */}
                        <View className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                            <Text className="text-violet-700 text-sm leading-5">
                                🔒 We'll verify your university email. Your real name is never
                                shown — you'll get an auto-generated nickname instead.
                            </Text>
                        </View>
                    </View>

                    {/* Bottom CTA */}
                    <View className="mt-8">
                        <PrimaryButton label="Continue" onPress={handleContinue} />
                        <Text className="text-center text-gray-400 text-xs mt-3 leading-4">
                            By continuing you agree to our Terms of Service and Privacy Policy.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}
