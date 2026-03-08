import { useCallback } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import RootNavigator from "./src/navigation/RootNavigator";

// Keep the splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [fontsLoaded] = useFonts({
        Georgia: require("./assets/font/Georgia.ttf"),
        "Georgia-Italic": require("./assets/font/Georgia-Italic.ttf"),
        "Georgia-Bold": require("./assets/font/Georgia-Bold.ttf"),
        "Georgia-BoldItalic": require("./assets/font/Georgia-BoldItalic.ttf"),
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaProvider>
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                <NavigationContainer>
                    <RootNavigator />
                </NavigationContainer>
            </View>
        </SafeAreaProvider>
    );
}
