import { PropsWithChildren } from "react";
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";

const BG = "#f4ece4";

export default function Screen({ children, style, ...rest }: PropsWithChildren<SafeAreaViewProps>) {
    return (
        <SafeAreaView style={[{ flex: 1, backgroundColor: BG }, style]} {...rest}>
            {children}
        </SafeAreaView>
    );
}
