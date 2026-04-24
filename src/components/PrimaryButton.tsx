import { Pressable, Text, PressableProps, StyleSheet } from "react-native";
import { colors, fonts, fontSizes, radii, spacing } from "../theme/tokens";

type Props = PressableProps & {
    label: string;
};

export default function PrimaryButton({ label, style, ...props }: Props) {
    return (
        <Pressable
            style={[styles.button, style as any]}
            {...props}
        >
            <Text style={styles.label}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: spacing.xxxl,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radii.full,
        backgroundColor: colors.button,
        alignSelf: "center",
    },
    label: {
        color: colors.white,
        fontFamily: fonts.regular,
        fontWeight: "600",
        fontSize: fontSizes.base,
    },
});
