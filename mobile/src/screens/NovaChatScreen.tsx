import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { NovaBubble } from '../components/nova/NovaBubble';
import { ProgressDots } from '../components/ui/ProgressDots';
import { Colors } from '../constants/colors';
import { useOnboardingStore } from '../lib/store/onboarding.store';
import { novaApi } from '../lib/api/onboarding.api';
import type { ChatMessage } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NovaChat'>;
};

export const NovaChatScreen = ({ navigation }: Props) => {
  const { skills, selectedValues, setChatSummary } = useOnboardingStore();
  const scrollRef = useRef<ScrollView>(null);

  // Profile init
  const [profileSummary, setProfileSummary] = useState('');
  const [openingQuestion, setOpeningQuestion] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);

  // Chat state
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load profile on mount
  useEffect(() => {
    novaApi.getProfile({ skills, values: selectedValues }).then((result) => {
      setProfileSummary(result.profileSummary);
      setOpeningQuestion(result.openingQuestion);
      setProfileLoading(false);
      setShowConfirm(true);
    });
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMessage = input.trim();
    setInput('');
    setShowConfirm(false);
    setSending(true);

    const newHistory: ChatMessage[] = [...history, { role: 'user', content: userMessage }];
    setHistory(newHistory);
    scrollToBottom();

    const profileContext = profileSummary;
    const result = await novaApi.chat(userMessage, newHistory, profileContext);

    const updatedHistory: ChatMessage[] = [...newHistory, { role: 'nova', content: result.response }];
    setHistory(updatedHistory);
    setSending(false);
    setShowConfirm(true);
    scrollToBottom();
  };

  const handleConfirm = () => {
    // Build a chat summary from the conversation to pass to path analysis
    const summary = history
      .map((m) => `${m.role === 'user' ? 'User' : 'Nova'}: ${m.content}`)
      .join('\n');
    setChatSummary(summary);
    navigation.navigate('Path');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.cream }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <Screen scrollable={false}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
          style={{ flex: 1 }}
        >
          {/* Profile loading */}
          {profileLoading ? (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <ActivityIndicator color={Colors.orange} size="large" />
              <Text style={{ fontSize: 14, color: Colors.muted, marginTop: 16, textAlign: 'center' }}>
                nova is putting together your profile...
              </Text>
            </View>
          ) : (
            <>
              {/* Initial Nova profile bubble */}
              <NovaBubble
                message={`${profileSummary}\n\n${openingQuestion}`}
                subtitle="online"
              />

              {/* Chat history */}
              {history.map((msg, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  {msg.role === 'user' ? (
                    // User message — right-aligned bubble
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
                    // Nova response — left-aligned bubble
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
            </>
          )}
        </ScrollView>

        {/* Bottom input area */}
        {!profileLoading && (
          <View style={{ paddingBottom: Platform.OS === 'ios' ? 8 : 16 }}>
            {/* Confirm button — appears after Nova responds */}
            {showConfirm && !sending && (
              <TouchableOpacity
                onPress={handleConfirm}
                style={{
                  backgroundColor: Colors.orange,
                  borderRadius: 999,
                  paddingVertical: 14,
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: Colors.white, fontSize: 15, fontWeight: '700' }}>
                  confirm my profile →
                </Text>
              </TouchableOpacity>
            )}

            {/* Text input row */}
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
                placeholder="Chat with Nova a little bit more about yourself e.g. hobbies, future plans..."
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
        )}

        <ProgressDots current={4} />
      </Screen>
    </KeyboardAvoidingView>
  );
};
