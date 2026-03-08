import { Pressable, Text, PressableProps, StyleSheet } from "react-native";

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
        paddingHorizontal: 32,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        backgroundColor: "#9a958f",
        alignSelf: "center",
    },
    label: {
        color: "#fff",
        fontFamily: "Georgia",
        fontWeight: "600",
        fontSize: 16,
    },
});
