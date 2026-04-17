import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
    MessagesSquare,
    Footprints,
    HeartHandshake,
    CircleChevronRight as CircleChevronRightIcon,
} from "lucide-react-native";
import { OnboardingStackParamList } from "../../navigation/OnboardingStack";

// See WelcomeScreen for context on this cast
const CircleChevronRight = CircleChevronRightIcon as React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
}>;
const Icon = (
    Component: React.ComponentType<{
        size: number;
        color: string;
        strokeWidth: number;
    }>
) =>
    function LucideIcon() {
        return <Component size={75} color="#85817d" strokeWidth={1.25} />;
    };

const MessagesSquareIcon = Icon(
    MessagesSquare as React.ComponentType<{
        size: number;
        color: string;
        strokeWidth: number;
    }>
);
const FootprintsIcon = Icon(
    Footprints as React.ComponentType<{
        size: number;
        color: string;
        strokeWidth: number;
    }>
);
const HeartHandshakeIcon = Icon(
    HeartHandshake as React.ComponentType<{
        size: number;
        color: string;
        strokeWidth: number;
    }>
);

const PRIMARY = "#85817d";
const SECONDARY = "#5b798a";
const BG = "#f4ece4";

type Props = NativeStackScreenProps<OnboardingStackParamList, "WhatIsSideKick">;

type FeatureRowProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
    iconSide: "left" | "right";
};

function FeatureRow({ icon, title, description, iconSide }: FeatureRowProps) {
    const textAlign = iconSide === "left" ? "right" : "left";
    return (
        <View style={styles.row}>
            {iconSide === "left" && <View style={styles.iconBox}>{icon}</View>}
            <View style={[styles.textBox, { alignItems: iconSide === "left" ? "flex-end" : "flex-start" }]}>
                <Text style={[styles.featureTitle, { textAlign }]}>{title}</Text>
                <Text style={[styles.featureDesc, { textAlign }]}>{description}</Text>
            </View>
            {iconSide === "right" && <View style={styles.iconBox}>{icon}</View>}
        </View>
    );
}

export default function WhatIsSideKickScreen({ navigation }: Props) {
    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Heading */}
                <Text style={styles.heading}>
                    <Text style={styles.headingRegular}>{"What is "}</Text>
                    <Text style={styles.headingBold}>{"SideKick"}</Text>
                    <Text style={styles.headingRegular}>{"?"}</Text>
                </Text>

                {/* Feature rows */}
                <View style={styles.features}>
                    <FeatureRow
                        iconSide="left"
                        icon={<MessagesSquareIcon />}
                        title="Quick Q&A"
                        description="Get guidance for your assignment, study, or future plans from your peers"
                    />
                    <FeatureRow
                        iconSide="right"
                        icon={<FootprintsIcon />}
                        title="Safe Walk"
                        description="Quick match with another student to walk together"
                    />
                    <FeatureRow
                        iconSide="left"
                        icon={<HeartHandshakeIcon />}
                        title="For & by women"
                        description="We believe SideKick can be the space that brings women together to accelerate and inspire each other."
                    />
                </View>

                {/* Next button */}
                <TouchableOpacity
                    onPress={() => navigation.navigate("Login")}
                    activeOpacity={0.7}
                >
                    <CircleChevronRight size={80} color={SECONDARY} strokeWidth={1.5} />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: BG,
    },
    container: {
        alignItems: "center",
        paddingTop: 94,
        paddingHorizontal: 24,
        paddingBottom: 60,
        gap: 59,
    },
    heading: {
        alignSelf: "flex-start",
        fontSize: 40,
        lineHeight: 48,
    },
    headingRegular: {
        fontFamily: "Georgia-Italic",
        fontSize: 40,
        color: SECONDARY,
    },
    headingBold: {
        fontFamily: "Georgia-BoldItalic",
        fontSize: 40,
        color: PRIMARY,
    },
    features: {
        width: "100%",
        gap: 40,
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 16,
        width: "100%",
    },
    iconBox: {
        width: 75,
        height: 75,
        marginTop: 10,
    },
    textBox: {
        flex: 1,
        gap: 4,
    },
    featureTitle: {
        fontFamily: "Georgia-BoldItalic",
        fontSize: 24,
        color: PRIMARY,
    },
    featureDesc: {
        fontFamily: "Georgia-Italic",
        fontSize: 16,
        color: PRIMARY,
        lineHeight: 22,
    },
});
