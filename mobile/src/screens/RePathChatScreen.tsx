import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { NovaBubble } from '../components/nova/NovaBubble';
import { Colors } from '../constants/colors';
import { useOnboardingStore } from '../lib/store/onboarding.store';
import { novaApi } from '../lib/api/onboarding.api';
import type { ChatMessage } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RePathChat'>;
};

const NOVA_OPENING =
  "What new direction would you like to explore? Tell me about any industries, roles, or interests you're curious about — doesn't have to be something you've done before.";

export const RePathChatScreen = ({ navigation }: Props) => {
  const { chatSummary, skills, selectedValues, appendChatSummary } = useOnboardingStore();
  const scrollRef = useRef<ScrollView>(null);

  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  // After Nova responds, show yes/no buttons
  const [showActions, setShowActions] = useState(false);
  const [lastNovaMessage, setLastNovaMessage] = useState('');

  const scrollToBottom = () =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMessage = input.trim();
    setInput('');
    setShowActions(false);
    setSending(true);

    const newHistory: ChatMessage[] = [...history, { role: 'user', content: userMessage }];
    setHistory(newHistory);
    scrollToBottom();

    const result = await novaApi.chat(userMessage, newHistory, chatSummary || '');

    const novaReply = result.response;
    setLastNovaMessage(novaReply);
    const updatedHistory: ChatMessage[] = [...newHistory, { role: 'nova', content: novaReply }];
    setHistory(updatedHistory);
    setSending(false);
    setShowActions(true);
    scrollToBottom();
  };

  const handleYes = () => {
    // Append this exchange to chatSummary so Path screen uses the new context
    const exchangeText = history
      .slice(-2)
      .map((m) => `${m.role === 'user' ? 'User' : 'Nova'}: ${m.content}`)
      .join('\n');
    appendChatSummary(`[Explore more paths]\n${exchangeText}`);
    navigation.navigate('Path', { fromRepath: true });
  };

  const handleNo = () => {
    setShowActions(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.cream }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 20, paddingVertical: 14,
          borderBottomWidth: 1, borderBottomColor: Colors.border,
        }}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 22, color: Colors.muted }}>←</Text>
          </TouchableOpacity>
          <View style={{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: Colors.orangeLight,
            alignItems: 'center', justifyContent: 'center',
            marginRight: 10,
          }}>
            <Text style={{ fontSize: 16 }}>✦</Text>
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.dark }}>Nova</Text>
            <Text style={{ fontSize: 11, color: Colors.orange }}>explore new paths</Text>
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
                <NovaBubble message={msg.content} subtitle="online" />
              )}
            </View>
          ))}

          {/* Typing indicator */}
          {sending && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
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

          {/* Yes / No action buttons after Nova responds */}
          {showActions && !sending && (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 12, justifyContent: 'center' }}>
              <TouchableOpacity
                onPress={handleYes}
                style={{
                  flex: 1,
                  backgroundColor: Colors.orange,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.white }}>
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
                  borderColor: Colors.border,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.muted }}>
                  no, keep chatting
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Input area */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: Platform.OS === 'ios' ? 12 : 16,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          backgroundColor: Colors.cream,
        }}>
          <View style={{
            flexDirection: 'row', alignItems: 'flex-end', gap: 10,
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
              placeholder="Share what you're curious about..."
              placeholderTextColor={Colors.muted}
              multiline
              style={{
                flex: 1,
                fontSize: 14,
                color: Colors.dark,
                maxHeight: 100,
                lineHeight: 20,
              }}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || sending}
              style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: input.trim() && !sending ? Colors.orange : Colors.orangeLight,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: Colors.white }}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
