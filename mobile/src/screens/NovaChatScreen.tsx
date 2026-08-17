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

type NovaReply = {
  response: string;
  type: 'question' | 'statement';
  options?: string[];
};

export const NovaChatScreen = ({ navigation }: Props) => {
  const { skills, selectedValues, setChatSummary, setPortraitBullets } = useOnboardingStore();
  const scrollRef = useRef<ScrollView>(null);

  const [profileSummary, setProfileSummary] = useState('');
  const [openingQuestion, setOpeningQuestion] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  // Accumulated portrait bullets — updated from getProfile initially, refined by final statement
  const [pendingPortraitBullets, setPendingPortraitBullets] = useState<string[]>([]);

  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  // Latest structured reply from Nova
  const [latestReply, setLatestReply] = useState<NovaReply | null>(null);

  useEffect(() => {
    novaApi.getProfile({ skills, values: selectedValues }).then((result) => {
      setProfileSummary(result.profileSummary);
      setOpeningQuestion(result.openingQuestion);
      if (result.portraitBullets && result.portraitBullets.length > 0) {
        setPendingPortraitBullets(result.portraitBullets);
      }
      setProfileLoading(false);
      // Opening question from getProfile is always a question — no confirm yet
      setLatestReply({ response: result.openingQuestion, type: 'question' });
    });
  }, []);

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

    const result = await novaApi.chat(userMessage, newHistory, profileSummary, 'novachat');

    const reply: NovaReply = {
      response: result.response,
      type: (result.type as 'question' | 'statement') ?? 'question',
      options: result.options,
    };

    // Capture refined portrait bullets when Nova delivers the final statement
    if (reply.type === 'statement' && result.portraitBullets && result.portraitBullets.length > 0) {
      setPendingPortraitBullets(result.portraitBullets);
    }

    setLatestReply(reply);
    const updatedHistory: ChatMessage[] = [...newHistory, { role: 'nova', content: result.response }];
    setHistory(updatedHistory);
    setSending(false);
    scrollToBottom();
  };

  const handleSend = () => sendMessage(input);

  const handleOptionTap = (option: string) => sendMessage(option);

  const handleConfirm = () => {
    const summary = history
      .map((m) => `${m.role === 'user' ? 'User' : 'Nova'}: ${m.content}`)
      .join('\n');
    setChatSummary(summary);
    if (pendingPortraitBullets.length > 0) {
      setPortraitBullets(pendingPortraitBullets);
    }
    navigation.navigate('Path');
  };

  const showConfirm = latestReply?.type === 'statement' && !sending;
  const showOptions = latestReply?.type === 'question' && latestReply.options && latestReply.options.length > 0 && !sending;
  const showInput = !showConfirm;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.cream }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scrollable={false}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
          style={{ flex: 1 }}
        >
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
                message={profileSummary}
                subtitle="online"
              />

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
                    <Text style={{ fontSize: 14 }}>{'✦'}</Text>
                  </View>
                  <View style={{
                    backgroundColor: Colors.white, borderRadius: 16,
                    paddingHorizontal: 16, paddingVertical: 10,
                  }}>
                    <ActivityIndicator color={Colors.orange} size="small" />
                  </View>
                </View>
              )}

              {/* A/B option chips (when Nova asks a question with options) */}
              {showOptions && (
                <View style={{ gap: 8, marginTop: 4, marginBottom: 8 }}>
                  {latestReply!.options!.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => handleOptionTap(opt)}
                      style={{
                        backgroundColor: Colors.white,
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderWidth: 1.5,
                        borderColor: Colors.orange,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.orange }}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Bottom area */}
        {!profileLoading && (
          <View style={{ paddingBottom: Platform.OS === 'ios' ? 8 : 16 }}>
            {/* Confirm button — ONLY when Nova made a statement */}
            {showConfirm && (
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

            {/* Text input — hidden when confirm is showing */}
            {showInput && (
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
                  placeholder="Chat with Nova a little bit more about yourself..."
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
                  <Text style={{ fontSize: 16, color: Colors.white }}>{'→'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <ProgressDots current={4} />
      </Screen>
    </KeyboardAvoidingView>
  );
};
