import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { NovaBubble } from '../components/nova/NovaBubble';
import { Colors } from '../constants/colors';
import { useOnboardingStore } from '../lib/store/onboarding.store';
import { novaApi } from '../lib/api/onboarding.api';
import type { ChatMessage } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Chat'>;
};

interface MessageItem extends ChatMessage {
  id: string;
  // After Nova's message, we may show an update-profile prompt
  newInfoSummary?: string;
  showUpdatePrompt?: boolean;
  promptDismissed?: boolean;
}

export const ChatScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { chatSummary, likedPaths, appendChatSummary } = useOnboardingStore();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<MessageItem[]>([{
    id: 'nova-intro',
    role: 'nova',
    content: `hey! i'm here whenever you want to chat more about your career journey ✦\n\nask me anything — next steps, specific roles, how to close skill gaps, or just think out loud.`,
  }]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userText = input.trim();
    setInput('');
    setSending(true);

    const userMsg: MessageItem = { id: `user-${Date.now()}`, role: 'user', content: userText };
    setMessages((prev) => [...prev, userMsg]);
    scrollToBottom();

    // Build context: chat summary + liked paths
    const profileContext = [
      chatSummary ? `User profile: ${chatSummary}` : '',
      likedPaths.length > 0 ? `Liked career paths: ${likedPaths.join(', ')}` : '',
    ].filter(Boolean).join('\n');

    // Fetch Nova response — ask it to also detect if user shared new personal info
    const historyForApi: ChatMessage[] = messages
      .concat(userMsg)
      .map((m) => ({ role: m.role, content: m.content }));

    const result = await novaApi.chat(userText, historyForApi, profileContext);

    // Ask Nova to summarize any new info in one line (best-effort, separate call)
    let newInfoSummary: string | undefined;
    try {
      const summaryResult = await novaApi.chat(
        `In one short sentence (max 15 words), summarize ONLY the new personal information the user just shared in their last message: "${userText}". 
If there is no new personal info, reply with exactly: NONE`,
        [],
        ''
      );
      const raw = summaryResult.response.trim();
      if (raw && raw !== 'NONE' && !raw.startsWith('NONE')) {
        newInfoSummary = raw;
      }
    } catch {
      // skip — profile update prompt is optional
    }

    const novaMsg: MessageItem = {
      id: `nova-${Date.now()}`,
      role: 'nova',
      content: result.response,
      newInfoSummary,
      showUpdatePrompt: !!newInfoSummary,
      promptDismissed: false,
    };
    setMessages((prev) => [...prev, novaMsg]);
    setSending(false);
    scrollToBottom();
  };

  const handleUpdateProfile = async (msgId: string, summary: string) => {
    appendChatSummary(summary);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, showUpdatePrompt: false, promptDismissed: false } : m
      )
    );
  };

  const handleDismissPrompt = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, showUpdatePrompt: false, promptDismissed: true } : m
      )
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.cream }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
          backgroundColor: Colors.cream,
        }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 22, color: Colors.dark }}>←</Text>
          </TouchableOpacity>
          <View style={{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: Colors.orangeLight,
            alignItems: 'center', justifyContent: 'center', marginRight: 10,
          }}>
            <Text style={{ fontSize: 14 }}>✦</Text>
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.dark }}>Nova</Text>
            <Text style={{ fontSize: 11, color: Colors.greenDot }}>● online</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={{ marginBottom: 14 }}>
              {msg.role === 'user' ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{
                    backgroundColor: Colors.orange,
                    borderRadius: 18,
                    borderBottomRightRadius: 4,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    maxWidth: '80%',
                  }}>
                    <Text style={{ color: Colors.white, fontSize: 14, lineHeight: 20 }}>
                      {msg.content}
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  <NovaBubble message={msg.content} subtitle="online" />

                  {/* Profile update prompt */}
                  {msg.showUpdatePrompt && msg.newInfoSummary && (
                    <View style={{
                      marginTop: 8,
                      marginLeft: 44,
                      backgroundColor: Colors.white,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: Colors.orangeMuted,
                      padding: 12,
                    }}>
                      <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 8, lineHeight: 17 }}>
                        ✦ nova noticed you shared:{'\n'}
                        <Text style={{ color: Colors.dark, fontWeight: '600' }}>
                          {msg.newInfoSummary}
                        </Text>
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => handleUpdateProfile(msg.id, msg.newInfoSummary!)}
                          style={{
                            flex: 1,
                            backgroundColor: Colors.orange,
                            borderRadius: 999,
                            paddingVertical: 8,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.white }}>
                            yes, update my profile
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDismissPrompt(msg.id)}
                          style={{
                            flex: 1,
                            backgroundColor: Colors.cream,
                            borderRadius: 999,
                            paddingVertical: 8,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: Colors.border,
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.muted }}>
                            not yet, keep chatting
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          ))}

          {/* Typing indicator */}
          {sending && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <View style={{
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: Colors.orangeLight,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 14 }}>✦</Text>
              </View>
              <View style={{
                backgroundColor: Colors.white, borderRadius: 16,
                paddingHorizontal: 16, paddingVertical: 10,
              }}>
                <ActivityIndicator color={Colors.orange} size="small" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 10,
          paddingHorizontal: 16,
          paddingVertical: 10,
          paddingBottom: insets.bottom + 10,
          backgroundColor: Colors.cream,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
        }}>
          <View style={{
            flex: 1,
            backgroundColor: Colors.white,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: Colors.border,
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="ask Nova anything about your career..."
              placeholderTextColor={Colors.muted}
              multiline
              style={{
                fontSize: 14,
                color: Colors.dark,
                maxHeight: 100,
                lineHeight: 20,
              }}
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || sending}
            style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: input.trim() && !sending ? Colors.orange : Colors.orangeLight,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18, color: Colors.white }}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
