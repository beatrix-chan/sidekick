import { Pressable, Text, PressableProps } from "react-native";

type Props = PressableProps & {
    label: string;
};

export default function PrimaryButton({ label, ...props }: Props) {
    return (
        <Pressable
            className="h-12 items-center justify-center rounded-xl bg-black"
            {...props}
        >
            <Text className="text-white font-semibold">{label}</Text>
        </Pressable>
    );
}
