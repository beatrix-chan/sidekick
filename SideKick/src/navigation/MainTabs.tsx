import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/tabs/HomeScreen";
import QAScreen from "../screens/tabs/QAScreen";
import SafeWalkScreen from "../screens/tabs/SafeWalkScreen";
import ProfileScreen from "../screens/tabs/ProfileScreen";

export type MainTabsParamList = {
    Home: undefined;
    QA: undefined;
    SafeWalk: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export default function MainTabs() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="QA" component={QAScreen} />
            <Tab.Screen name="SafeWalk" component={SafeWalkScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
