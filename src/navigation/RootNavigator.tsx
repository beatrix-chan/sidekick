import { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { User } from "firebase/auth";
import OnboardingStack from "./OnboardingStack";
import MainTabs from "./MainTabs";
import { onAuthChange } from "../authHelpers";
import { colors } from "../theme/tokens";

export default function RootNavigator() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange((u) => {
            // Durham email is validated via RegEx at registration/login time,
            // so any authenticated Firebase user is trusted to enter the app.
            setUser(u);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color={colors.secondary} />
            </View>
        );
    }

    return user ? <MainTabs /> : <OnboardingStack />;
}
