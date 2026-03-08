import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Pressable,
    Alert,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "../../navigation/OnboardingStack";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import { signUp, signIn, isUniversityEmail } from "../../authHelpers";

const SECONDARY = "#5b798a";
const PRIMARY = "#85817d";
const BG = "#f4ece4";
const INPUT_BG = "#f9f4ee";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleContinue() {
        if (!email.includes("@") || !email.includes(".")) {
            setEmailError("Please enter a valid university email address.");
            return;
        }
        if (!isUniversityEmail(email)) {
            setEmailError("Please use a university email (.edu or .ac.uk).");
            return;
        }
        if (password.length < 6) {
            setEmailError("Password must be at least 6 characters.");
            return;
        }
        setEmailError("");
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }
            navigation.navigate("MainTabs");
        } catch (error: any) {
            setEmailError(error.message || "Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Screen>
            <KeyboardAvoidingView
                style={styles.flex1}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    style={styles.flex1}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Heading */}
                    <Text style={styles.heading}>
                        {isLogin ? "Sign In" : "Register"}
                    </Text>

                    {/* Subtitle */}
                    <Text style={styles.subtitle}>
                        129k students are already on{" "}
                        <Text style={styles.subtitleBold}>SideKick</Text>.
                        {"\n"}Join them to accelerate each other!
                    </Text>

                    {/* Email input */}
                    <TextInput
                        style={styles.input}
                        placeholder="first.last@durham.ac.uk"
                        placeholderTextColor="#b5b0ab"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={email}
                        onChangeText={(t) => {
                            setEmail(t);
                            if (emailError) setEmailError("");
                        }}
                    />

                    {/* Password input */}
                    <TextInput
                        style={styles.input}
                        placeholder="password"
                        placeholderTextColor="#b5b0ab"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    {emailError ? (
                        <Text style={styles.errorText}>{emailError}</Text>
                    ) : null}

                    {/* CTA */}
                    {loading ? (
                        <ActivityIndicator size="large" color={SECONDARY} style={{ marginTop: 24 }} />
                    ) : (
                        <PrimaryButton
                            label={isLogin ? "Sign In" : "Register"}
                            onPress={handleContinue}
                            style={{ marginTop: 24 }}
                        />
                    )}

                    {/* Toggle */}
                    <Pressable onPress={() => setIsLogin(!isLogin)} style={styles.toggleButton}>
                        <Text style={styles.toggleText}>
                            {isLogin
                                ? "Don't have an account? Register"
                                : "Already have an account? Sign in"}
                        </Text>
                    </Pressable>

                    {/* Bottom note */}
                    <Text style={styles.noteText}>
                        If you already have an account, your{"\n"}data will automatically restore.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 36,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    heading: {
        fontFamily: "Georgia-Italic",
        fontSize: 48,
        color: SECONDARY,
        textAlign: "center",
        marginBottom: 24,
    },
    subtitle: {
        fontFamily: "Georgia-Italic",
        fontSize: 16,
        color: PRIMARY,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 40,
    },
    subtitleBold: {
        fontFamily: "Georgia-BoldItalic",
        color: PRIMARY,
    },
    input: {
        width: "100%",
        height: 52,
        paddingHorizontal: 24,
        borderRadius: 999,
        backgroundColor: INPUT_BG,
        color: PRIMARY,
        fontFamily: "Georgia-Italic",
        fontSize: 16,
        marginBottom: 16,
    },
    errorText: {
        fontFamily: "Georgia-Italic",
        color: "#c45c5c",
        fontSize: 13,
        textAlign: "center",
        marginTop: 4,
    },
    toggleButton: { marginTop: 16 },
    toggleText: {
        fontFamily: "Georgia-Italic",
        textAlign: "center",
        color: SECONDARY,
        fontSize: 14,
    },
    noteText: {
        fontFamily: "Georgia-Italic",
        textAlign: "center",
        color: PRIMARY,
        fontSize: 14,
        marginTop: 32,
        lineHeight: 20,
    },
});
