import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CircleChevronRight as CircleChevronRightIcon } from "lucide-react-native";
import { OnboardingStackParamList } from "../../navigation/OnboardingStack";
import Wordmark from "../../../assets/wordmark.svg";
import { colors, fonts } from "../../theme/tokens";

// lucide-react-native's color prop maps to SVG stroke at runtime but its TS
// types don't surface it through the SvgProps chain in this dependency set.
const CircleChevronRight = CircleChevronRightIcon as React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
}>

const SECONDARY = colors.secondary;
const BG = colors.background;
const FONT_ITALIC = fonts.italic;

type Props = NativeStackScreenProps<OnboardingStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                {/* Top content group */}
                <View style={styles.content}>
                    <Text style={styles.welcomeText}>Welcome to</Text>
                    <Wordmark width={260} height={226} />
                    <Text style={styles.subtitle}>
                        A women-only platform for{"\n"}Durham University
                        students.
                    </Text>
                </View>

                {/* Bottom navigation button */}
                <TouchableOpacity
                    style={styles.chevronButton}
                    onPress={() => navigation.navigate("WhatIsSideKick")}
                    activeOpacity={0.7}
                >
                    <CircleChevronRight
                        size={80}
                        color={SECONDARY}
                        strokeWidth={1.5}
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: BG,
    },
    container: {
        flex: 1,
        alignItems: "center",
        paddingTop: 56,
        paddingHorizontal: 36,
        paddingBottom: 40,
        justifyContent: "space-between",
    },
    content: {
        alignItems: "center",
        gap: 46,
    },
    welcomeText: {
        fontFamily: FONT_ITALIC,
        fontSize: 48,
        color: SECONDARY,
        lineHeight: 56,
    },
    subtitle: {
        fontFamily: FONT_ITALIC,
        fontSize: 24,
        color: SECONDARY,
        textAlign: "center",
        lineHeight: 36,
        maxWidth: 329,
    },
    chevronButton: {
        alignItems: "center",
    },
});
