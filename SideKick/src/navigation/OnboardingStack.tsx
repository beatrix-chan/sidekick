import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/onboarding/WelcomeScreen";
import WhatIsSideKickScreen from "../screens/onboarding/WhatIsSideKickScreen";
import RegisterScreen from "../screens/onboarding/RegisterScreen";
import MainTabs from "./MainTabs";

export type OnboardingStackParamList = {
    Welcome: undefined;
    WhatIsSideKick: undefined;
    Register: undefined;
    MainTabs: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen
                name="WhatIsSideKick"
                component={WhatIsSideKickScreen}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
    );
}
