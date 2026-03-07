import { useState } from "react";
import { View, Text, ScrollView, Pressable, Switch, Alert } from "react-native";
import Screen from "../../components/Screen";

type ToggleSetting = {
    id: string;
    label: string;
    sublabel: string;
    value: boolean;
};

export default function ProfileScreen() {
    const [nickname] = useState("SnazzyOwl42");
    const [regenCount] = useState(1); // used 1 of 3 regens
    const MAX_REGENS = 3;

    const [settings, setSettings] = useState<ToggleSetting[]>([
        {
            id: "inAppRefresh",
            label: "In-app notifications",
            sublabel: "Refresh feed to see new activity",
            value: true,
        },
        {
            id: "walkRequests",
            label: "Show my walk requests",
            sublabel: "Others can see and accept your requests",
            value: true,
        },
        {
            id: "showCourse",
            label: "Show year & course",
            sublabel: "Visible to other campus members",
            value: false,
        },
    ]);

    function toggleSetting(id: string) {
        setSettings((prev) =>
            prev.map((s) => (s.id === id ? { ...s, value: !s.value } : s))
        );
    }

    function handleRegenerate() {
        if (regenCount >= MAX_REGENS) {
            Alert.alert(
                "Limit reached",
                "You can only regenerate your nickname 3 times."
            );
        } else {
            Alert.alert(
                "Regenerate nickname?",
                "This will change your nickname across the app.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Regenerate", style: "destructive", onPress: () => {} },
                ]
            );
        }
    }

    function handleLogout() {
        Alert.alert("Log out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Log out", style: "destructive", onPress: () => {} },
        ]);
    }

    return (
        <Screen>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Text className="text-2xl font-bold text-gray-900 mb-6">Profile</Text>

                {/* Nickname card */}
                <View className="bg-violet-600 rounded-2xl p-6 mb-6">
                    <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-4">
                        <Text className="text-white text-2xl font-bold">
                            {nickname.slice(0, 2).toUpperCase()}
                        </Text>
                    </View>
                    <Text className="text-white/70 text-sm mb-0.5">Your nickname</Text>
                    <Text className="text-white text-2xl font-bold tracking-tight">{nickname}</Text>
                    <Text className="text-white/50 text-xs mt-1">
                        Your real name is never shown to anyone.
                    </Text>

                    <Pressable
                        onPress={handleRegenerate}
                        className="mt-4 flex-row items-center gap-2 bg-white/10 rounded-xl px-4 py-2 self-start"
                    >
                        <Text className="text-white text-sm font-medium">🔄 Regenerate</Text>
                        <View className="bg-white/20 rounded-full px-2 py-0.5">
                            <Text className="text-white text-xs">
                                {MAX_REGENS - regenCount} left
                            </Text>
                        </View>
                    </Pressable>
                </View>

                {/* Account info */}
                <View className="bg-gray-50 rounded-2xl border border-gray-100 mb-6 overflow-hidden">
                    <View className="px-4 py-3 border-b border-gray-100 flex-row items-center justify-between">
                        <Text className="text-gray-700 text-sm font-medium">Email</Text>
                        <Text className="text-gray-400 text-sm">owl@campus.ac.uk</Text>
                    </View>
                    <View className="px-4 py-3 flex-row items-center justify-between">
                        <Text className="text-gray-700 text-sm font-medium">Member since</Text>
                        <Text className="text-gray-400 text-sm">March 2026</Text>
                    </View>
                </View>

                {/* Settings */}
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Settings
                </Text>
                <View className="bg-gray-50 rounded-2xl border border-gray-100 mb-6 overflow-hidden">
                    {settings.map((s, i) => (
                        <View
                            key={s.id}
                            className={`px-4 py-4 flex-row items-center justify-between ${
                                i < settings.length - 1 ? "border-b border-gray-100" : ""
                            }`}
                        >
                            <View className="flex-1 pr-3">
                                <Text className="text-gray-800 text-sm font-medium">{s.label}</Text>
                                <Text className="text-gray-400 text-xs mt-0.5">{s.sublabel}</Text>
                            </View>
                            <Switch
                                value={s.value}
                                onValueChange={() => toggleSetting(s.id)}
                                trackColor={{ false: "#e5e7eb", true: "#7c3aed" }}
                                thumbColor="#fff"
                            />
                        </View>
                    ))}
                </View>

                {/* Danger zone */}
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Account
                </Text>
                <View className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                    <Pressable className="px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
                        <Text className="text-gray-700 text-sm font-medium">📋 Terms of Service</Text>
                        <Text className="text-gray-300">›</Text>
                    </Pressable>
                    <Pressable className="px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
                        <Text className="text-gray-700 text-sm font-medium">🔒 Privacy Policy</Text>
                        <Text className="text-gray-300">›</Text>
                    </Pressable>
                    <Pressable
                        onPress={handleLogout}
                        className="px-4 py-4 flex-row items-center"
                    >
                        <Text className="text-red-500 text-sm font-medium">Log out</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </Screen>
    );
}
