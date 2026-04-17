import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Pressable,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "../../navigation/OnboardingStack";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import { loginUser } from "../../authHelpers";

// ─── Design tokens ────────────────────────────────────────────────────────────
const SECONDARY = "#5b798a";
const PRIMARY = "#85817d";
const INPUT_BG = "#f9f4ee";
const ERROR_COLOR = "#c45c5c";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    // ── Sign In ───────────────────────────────────────────────────────────────
    async function handleLogin() {
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail || !password) {
            setFormError("Please enter both your email and password.");
            return;
        }

        setFormError("");
        setLoading(true);

        try {
            await loginUser(trimmedEmail, password);
            // onAuthChange in RootNavigator detects the new session and
            // automatically swaps OnboardingStack → MainTabs
        } catch (err: any) {
            const code: string = err?.code ?? "";
            if (
                code === "auth/user-not-found" ||
                code === "auth/wrong-password" ||
                code === "auth/invalid-credential"
            ) {
                setFormError("Incorrect email or password. Please try again.");
            } else {
                setFormError(err?.message ?? "Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────
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
                    <Text style={styles.heading}>Welcome back</Text>

                    <Text style={styles.subtitle}>
                        Sign in to your{" "}
                        <Text style={styles.subtitleBold}>SideKick</Text> account
                    </Text>

                    {/* Email input */}
                    <TextInput
                        style={styles.input}
                        placeholder="abcd12@durham.ac.uk"
                        placeholderTextColor="#b5b0ab"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={email}
                        onChangeText={(t) => {
                            setEmail(t);
                            if (formError) setFormError("");
                        }}
                    />

                    {/* Password input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#b5b0ab"
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={password}
                        onChangeText={(t) => {
                            setPassword(t);
                            if (formError) setFormError("");
                        }}
                    />

                    {formError ? (
                        <Text style={styles.errorText}>{formError}</Text>
                    ) : null}

                    {/* Sign In CTA */}
                    {loading ? (
                        <ActivityIndicator size="large" color={SECONDARY} style={{ marginTop: 24 }} />
                    ) : (
                        <PrimaryButton
                            label="Sign In"
                            onPress={handleLogin}
                            style={{ marginTop: 24 }}
                        />
                    )}

                    {/* Link to Register */}
                    <View style={styles.registerRow}>
                        <Text style={styles.registerHint}>Don't have an account?{" "}</Text>
                        <Pressable onPress={() => navigation.navigate("Register")}>
                            <Text style={styles.registerLink}>Create one here</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
        fontSize: 44,
        color: SECONDARY,
        textAlign: "center",
        marginBottom: 12,
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
        color: ERROR_COLOR,
        fontSize: 13,
        textAlign: "center",
        marginTop: 4,
    },

    registerRow: {
        flexDirection: "row",
        marginTop: 32,
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
    },

    registerHint: {
        fontFamily: "Georgia-Italic",
        color: PRIMARY,
        fontSize: 14,
    },

    registerLink: {
        fontFamily: "Georgia-Italic",
        color: SECONDARY,
        fontSize: 14,
        textDecorationLine: "underline",
    },
});
