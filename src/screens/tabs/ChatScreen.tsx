import { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from "react-native";
import Screen from "../../components/Screen";
import SafetyToolkit from "../../components/SafetyToolkit";
import { auth } from "../../firebase";
import { sendChatMessage, subscribeToChatMessages, getUserProfile } from "../../dbHelpers";
import { colors, fonts } from "../../theme/tokens";

const SECONDARY = colors.secondary;
const PRIMARY = colors.primary;
const CARD_BG = colors.card;
const INPUT_BG = colors.inputBackground;
const BG = colors.background;
const OWN_BUBBLE = colors.secondary;
const OTHER_BUBBLE = colors.card;
const FONT_REGULAR = fonts.regular;
const FONT_ITALIC = fonts.italic;
const FONT_BOLD_ITALIC = fonts.boldItalic;

type ChatMsg = {
    id: string;
    authorId: string;
    nickname: string;
    text: string;
    createdAt: any;
};

export default function ChatScreen() {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState("");
    const [nickname, setNickname] = useState("Anonymous");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const uid = auth.currentUser?.uid;

    useEffect(() => {
        if (!uid) return;
        getUserProfile(uid).then((p) => {
            if (p?.nickname) setNickname(p.nickname);
        });
    }, [uid]);

    useEffect(() => {
        const unsubscribe = subscribeToChatMessages((msgs) => {
            setMessages(msgs as ChatMsg[]);
        });
        return () => unsubscribe();
    }, []);

    async function handleSend() {
        if (!uid || !input.trim()) return;
        const text = input.trim();
        setInput("");
        try {
            await sendChatMessage(uid, nickname, text);
        } catch (e) {
            console.error("Failed to send message:", e);
        }
    }

    function formatTime(timestamp: any): string {
        if (!timestamp?.seconds) return "";
        const date = new Date(timestamp.seconds * 1000);
        const hours = date.getHours();
        const mins = date.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        const h = hours % 12 || 12;
        return `${h}:${mins} ${ampm}`;
    }

    const renderMessage = ({ item }: { item: ChatMsg }) => {
        const isOwn = item.authorId === uid;
        return (
            <Pressable
                onLongPress={() => {
                    if (!isOwn) setSelectedUserId(item.authorId);
                }}
                style={[
                    styles.bubbleRow,
                    isOwn ? styles.bubbleRowOwn : styles.bubbleRowOther,
                ]}
            >
                <View
                    style={[
                        styles.bubble,
                        isOwn ? styles.bubbleOwn : styles.bubbleOther,
                    ]}
                >
                    {!isOwn && (
                        <Text style={styles.bubbleNickname}>{item.nickname}</Text>
                    )}
                    <Text
                        style={[
                            styles.bubbleText,
                            isOwn ? styles.bubbleTextOwn : styles.bubbleTextOther,
                        ]}
                    >
                        {item.text}
                    </Text>
                    <Text
                        style={[
                            styles.bubbleTime,
                            isOwn ? styles.bubbleTimeOwn : styles.bubbleTimeOther,
                        ]}
                    >
                        {formatTime(item.createdAt)}
                    </Text>
                </View>
            </Pressable>
        );
    };

    return (
        <Screen>
            <KeyboardAvoidingView
                style={styles.flex1}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Global Chat</Text>
                    <Text style={styles.headerSub}>
                        Chat with everyone on campus 💬
                    </Text>
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() =>
                        flatListRef.current?.scrollToEnd({ animated: true })
                    }
                    onLayout={() =>
                        flatListRef.current?.scrollToEnd({ animated: false })
                    }
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            No messages yet. Say hi! 👋
                        </Text>
                    }
                />

                {/* Input bar */}
                <View style={styles.inputBar}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.placeholder}
                        value={input}
                        onChangeText={setInput}
                        multiline
                        maxLength={500}
                        returnKeyType="send"
                        blurOnSubmit={false}
                        onSubmitEditing={handleSend}
                    />
                    <Pressable
                        onPress={handleSend}
                        style={[
                            styles.sendBtn,
                            !input.trim() && styles.sendBtnDisabled,
                        ]}
                        disabled={!input.trim()}
                    >
                        <Text style={styles.sendBtnText}>Send</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>

            {/* Safety Toolkit — visible when a user is selected via long-press */}
            {uid && selectedUserId && (
                <SafetyToolkit
                    currentUserId={uid}
                    targetUserId={selectedUserId}
                    onDismiss={() => setSelectedUserId(null)}
                />
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    header: {
        paddingHorizontal: 24,
        paddingTop: 56,
        paddingBottom: 12,
    },
    headerTitle: {
        fontFamily: FONT_BOLD_ITALIC,
        fontSize: 24,
        color: PRIMARY,
    },
    headerSub: {
        fontFamily: FONT_ITALIC,
        fontSize: 14,
        color: SECONDARY,
        marginTop: 4,
    },
    messageList: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        flexGrow: 1,
        justifyContent: "flex-end",
    },
    emptyText: {
        fontFamily: FONT_ITALIC,
        color: PRIMARY,
        textAlign: "center",
        marginTop: 40,
        fontSize: 16,
    },
    // Bubble layout
    bubbleRow: {
        marginVertical: 3,
        flexDirection: "row",
    },
    bubbleRowOwn: {
        justifyContent: "flex-end",
    },
    bubbleRowOther: {
        justifyContent: "flex-start",
    },
    bubble: {
        maxWidth: "78%",
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    bubbleOwn: {
        backgroundColor: OWN_BUBBLE,
        borderBottomRightRadius: 4,
    },
    bubbleOther: {
        backgroundColor: OTHER_BUBBLE,
        borderBottomLeftRadius: 4,
    },
    bubbleNickname: {
        fontFamily: FONT_BOLD_ITALIC,
        fontSize: 11,
        color: SECONDARY,
        marginBottom: 2,
    },
    bubbleText: {
        fontFamily: FONT_ITALIC,
        fontSize: 15,
        lineHeight: 20,
    },
    bubbleTextOwn: {
        color: colors.white,
    },
    bubbleTextOther: {
        color: PRIMARY,
    },
    bubbleTime: {
        fontFamily: FONT_ITALIC,
        fontSize: 10,
        marginTop: 4,
        alignSelf: "flex-end",
    },
    bubbleTimeOwn: {
        color: "rgba(255,255,255,0.6)",
    },
    bubbleTimeOther: {
        color: colors.placeholder,
    },
    // Input bar
    inputBar: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 10,
        paddingBottom: Platform.select({ ios: 28, android: 12 }),
        borderTopWidth: 1,
        borderTopColor: colors.card,
        backgroundColor: BG,
        gap: 8,
    },
    textInput: {
        flex: 1,
        backgroundColor: INPUT_BG,
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontFamily: FONT_ITALIC,
        fontSize: 15,
        color: PRIMARY,
        maxHeight: 100,
    },
    sendBtn: {
        backgroundColor: OWN_BUBBLE,
        borderRadius: 22,
        paddingHorizontal: 18,
        paddingVertical: 10,
    },
    sendBtnDisabled: {
        opacity: 0.4,
    },
    sendBtnText: {
        fontFamily: FONT_BOLD_ITALIC,
        color: colors.white,
        fontSize: 14,
    },
});
