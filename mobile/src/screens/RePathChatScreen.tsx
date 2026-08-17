import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { NovaBubble } from '../components/nova/NovaBubble';
import { useOnboardingStore } from '../lib/store/onboarding.store';
import { useTheme } from '../lib/useTheme';
import { novaApi } from '../lib/api/onboarding.api';
import type { ChatMessage } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RePathChat'>;
};

const NOVA_OPENING =
  "What new direction would you like to explore? Tell me about any industries, roles, or interests you're curious about — doesn't have to be something you've done before.";

type NovaReply = {
  response: string;
  type: 'question' | 'statement';
  options?: string[];
};

export const RePathChatScreen = ({ navigation }: Props) => {
  const { chatSummary, appendChatSummary } = useOnboardingStore();
  const { colors, fs } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  // Tracks the latest Nova reply with type + options
  const [latestReply, setLatestReply] = useState<NovaReply | null>(null);

  const scrollToBottom = () =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

  const sendMessage = async (message: string) => {
    if (!message.trim() || sending) return;
    const userMessage = message.trim();
    setInput('');
    setLatestReply(null);
    setSending(true);

    const newHistory: ChatMessage[] = [...history, { role: 'user', content: userMessage }];
    setHistory(newHistory);
    scrollToBottom();

    const result = await novaApi.chat(userMessage, newHistory, chatSummary || '', 'repath');

    const reply: NovaReply = {
      response: result.response,
      type: (result.type as 'question' | 'statement') ?? 'question',
      options: result.options,
    };

    setLatestReply(reply);
    const updatedHistory: ChatMessage[] = [...newHistory, { role: 'nova', content: result.response }];
    setHistory(updatedHistory);
    setSending(false);
    scrollToBottom();
  };

  const handleSend = () => sendMessage(input);

  // Auto-send when user taps an A/B option chip
  const handleOptionTap = (option: string) => sendMessage(option);

  const handleYes = () => {
    const exchangeText = history
      .slice(-2)
      .map((m) => `${m.role === 'user' ? 'User' : 'Nova'}: ${m.content}`)
      .join('\n');
    appendChatSummary(`[Explore more paths]\n${exchangeText}`);
    navigation.navigate('Path', { fromRepath: true });
  };

  const handleNo = () => {
    setLatestReply(null);
  };

  const showStatement = latestReply?.type === 'statement';
  const showOptions = latestReply?.type === 'question' && latestReply.options && latestReply.options.length > 0;
  // Hide text input when we're showing the final statement yes/no
  const showInput = !showStatement;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 20, paddingVertical: 14,
          borderBottomWidth: 1, borderBottomColor: colors.border,
        }}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 22, color: colors.muted }}>←</Text>
          </TouchableOpacity>
          <View style={{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: colors.orangeLight,
            alignItems: 'center', justifyContent: 'center',
            marginRight: 10,
          }}>
            <Text style={{ fontSize: 16 }}>✦</Text>
          </View>
          <View>
            <Text style={{ fontSize: fs(15), fontWeight: '800', color: colors.dark }}>Nova</Text>
            <Text style={{ fontSize: fs(11), color: colors.orange }}>explore new paths</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Opening message */}
          <NovaBubble message={NOVA_OPENING} subtitle="online" />

          {/* Chat history */}
          {history.map((msg, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              {msg.role === 'user' ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{
                    backgroundColor: colors.orange,
                    borderRadius: 18,
                    borderBottomRightRadius: 4,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    maxWidth: '80%',
                  }}>
                    <Text style={{ color: '#fff', fontSize: fs(14), lineHeight: 20 }}>
                      {msg.content}
                    </Text>
                  </View>
                </View>
              ) : (
                <NovaBubble message={msg.content} subtitle="online" />
              )}
            </View>
          ))}

          {/* Typing indicator */}
          {sending && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
              <View style={{
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: colors.orangeLight,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 14 }}>✦</Text>
              </View>
              <View style={{
                backgroundColor: colors.white, borderRadius: 16,
                paddingHorizontal: 16, paddingVertical: 10,
              }}>
                <ActivityIndicator color={colors.orange} size="small" />
              </View>
            </View>
          )}

          {/* A/B option chips (shown when Nova asks a question with options) */}
          {showOptions && !sending && (
            <View style={{ gap: 8, marginTop: 4, marginBottom: 12 }}>
              {latestReply!.options!.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => handleOptionTap(opt)}
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderWidth: 1.5,
                    borderColor: colors.orange,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: fs(13), fontWeight: '700', color: colors.orange }}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Yes / No buttons when Nova gives a statement */}
          {showStatement && !sending && (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 12, justifyContent: 'center' }}>
              <TouchableOpacity
                onPress={handleYes}
                style={{
                  flex: 1,
                  backgroundColor: colors.orange,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: fs(13), fontWeight: '800', color: '#fff' }}>
                  yes, generate new paths
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNo}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: fs(13), fontWeight: '700', color: colors.muted }}>
                  no, keep chatting
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Input area — hidden when showing yes/no statement */}
        {showInput && (
          <View style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingBottom: Platform.OS === 'ios' ? 12 : 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.cream,
          }}>
            <View style={{
              flexDirection: 'row', alignItems: 'flex-end', gap: 10,
              backgroundColor: colors.white,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Share what you're curious about..."
                placeholderTextColor={colors.muted}
                multiline
                style={{
                  flex: 1,
                  fontSize: fs(14),
                  color: colors.dark,
                  maxHeight: 100,
                  lineHeight: 20,
                }}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={!input.trim() || sending}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: input.trim() && !sending ? colors.orange : colors.orangeLight,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16, color: '#fff' }}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
