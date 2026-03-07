import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, MessageCircle, PersonStanding, User } from "lucide-react-native";
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
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: "#7c3aed",
                tabBarInactiveTintColor: "#9ca3af",
                tabBarStyle: {
                    borderTopColor: "#f3f4f6",
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },
                tabBarIcon: ({ color, size }) => {
                    if (route.name === "Home")
                        return <Home size={size} color={color} />;
                    if (route.name === "QA")
                        return <MessageCircle size={size} color={color} />;
                    if (route.name === "SafeWalk")
                        return <PersonStanding size={size} color={color} />;
                    if (route.name === "Profile")
                        return <User size={size} color={color} />;
                    return null;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="QA" component={QAScreen} options={{ tabBarLabel: "Q&A" }} />
            <Tab.Screen
                name="SafeWalk"
                component={SafeWalkScreen}
                options={{ tabBarLabel: "Safe Walk" }}
            />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
