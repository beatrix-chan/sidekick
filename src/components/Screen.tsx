import { PropsWithChildren } from "react";
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";
import { colors } from "../theme/tokens";

const BG = colors.background;

export default function Screen({ children, style, ...rest }: PropsWithChildren<SafeAreaViewProps>) {
    return (
        <SafeAreaView style={[{ flex: 1, backgroundColor: BG }, style]} {...rest}>
            {children}
        </SafeAreaView>
    );
}
