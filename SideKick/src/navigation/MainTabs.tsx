import React from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
    Home as HomeIcon,
    MessagesSquare as MessagesSquareIcon,
    Footprints as FootprintsIcon,
    User as UserIcon,
    MessageCircle as MessageCircleIcon,
} from "lucide-react-native";
import HomeScreen from "../screens/tabs/HomeScreen";
import QAScreen from "../screens/tabs/QAScreen";
import SafeWalkScreen from "../screens/tabs/SafeWalkScreen";
import ProfileScreen from "../screens/tabs/ProfileScreen";
import ChatScreen from "../screens/tabs/ChatScreen";

const LucideIcon = (
    Component: React.ComponentType<{ size: number; color: string; strokeWidth: number }>
) =>
    function TabIcon({ color }: { color: string }) {
        return <Component size={24} color={color} strokeWidth={1.5} />;
    };

const HomeTabIcon = LucideIcon(HomeIcon as any);
const QATabIcon = LucideIcon(MessagesSquareIcon as any);
const SafeWalkTabIcon = LucideIcon(FootprintsIcon as any);
const ProfileTabIcon = LucideIcon(UserIcon as any);
const ChatTabIcon = LucideIcon(MessageCircleIcon as any);

const BG = "#f4ece4";
const TAB_BG = "#ddd9d4";
const ACTIVE = "#85817d";
const INACTIVE = "#b5b0ab";

export type MainTabsParamList = {
    Home: undefined;
    QA: undefined;
    Chat: undefined;
    SafeWalk: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: ACTIVE,
                tabBarInactiveTintColor: INACTIVE,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: TAB_BG,
                    borderTopWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                    height: 72,
                    paddingBottom: 12,
                    paddingTop: 12,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ tabBarIcon: HomeTabIcon }}
            />
            <Tab.Screen
                name="QA"
                component={QAScreen}
                options={{ tabBarLabel: "Q&A", tabBarIcon: QATabIcon }}
            />
            <Tab.Screen
                name="Chat"
                component={ChatScreen}
                options={{ tabBarLabel: "Chat", tabBarIcon: ChatTabIcon }}
            />
            <Tab.Screen
                name="SafeWalk"
                component={SafeWalkScreen}
                options={{ tabBarLabel: "Safe Walk", tabBarIcon: SafeWalkTabIcon }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarIcon: ProfileTabIcon }}
            />
        </Tab.Navigator>
    );
}
