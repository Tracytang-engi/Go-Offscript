import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { setStringAsync } from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import type { Mentor } from '../../types';
import { buildMentorLinkedInSearchUrl } from '../../lib/mentorUtils';
import { novaApi } from '../../lib/api/onboarding.api';

type Purpose = 'job' | 'chat' | 'other';
type WizardStep = 'purpose' | 'followup' | 'result';

interface Props {
  visible: boolean;
  mentor: Mentor | null;
  chatSummary: string;
  portraitBullets?: string[];
  isContacted: boolean;
  onClose: () => void;
  onSaveMessage: (mentorId: string, message: string) => void;
}

export const MentorOutreachModal = ({
  visible,
  mentor,
  chatSummary,
  portraitBullets = [],
  isContacted,
  onClose,
  onSaveMessage,
}: Props) => {
  const insets = useSafeAreaInsets();
  const [mainTab, setMainTab] = useState<'profile' | 'message'>('profile');
  const [wizStep, setWizStep] = useState<WizardStep>('purpose');
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [otherDetail, setOtherDetail] = useState('');
  const [followupQuestion, setFollowupQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  // Editable generated message
  const [editedMessage, setEditedMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Nova mini-chat for message refinement
  const [showNovaChat, setShowNovaChat] = useState(false);
  const [novaInput, setNovaInput] = useState('');
  const [refining, setRefining] = useState(false);

  const messageInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible && mentor) {
      setMainTab('profile');
      setWizStep('purpose');
      setPurpose(null);
      setOtherDetail('');
      setFollowupQuestion('');
      setFollowUpAnswer('');
      // Pre-fill saved message if exists, else empty
      setEditedMessage(mentor.savedMessage ?? '');
      setLoading(false);
      setShowNovaChat(false);
      setNovaInput('');
    }
  }, [visible, mentor?.id]);

  if (!mentor) return null;

  const openLinkedIn = () => {
    Linking.openURL(buildMentorLinkedInSearchUrl(mentor)).catch(() =>
      Alert.alert('Could not open link')
    );
  };

  const handlePurposeNext = async () => {
    if (!purpose) return;
    if (purpose === 'other' && !otherDetail.trim()) {
      Alert.alert('Add a short note', 'Tell Nova what you want to reach out about.');
      return;
    }
    setLoading(true);
    const res = await novaApi.linkedinOutreach({
      phase: 'followup',
      mentorName: mentor.name,
      mentorTitle: mentor.title,
      mentorBio: mentor.bio ?? '',
      userProfileSummary: chatSummary,
      portraitBullets,
      purpose,
      purposeDetail: purpose === 'other' ? otherDetail.trim() : undefined,
    });
    setFollowupQuestion(res.question ?? '');
    setWizStep('followup');
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!purpose) return;
    setLoading(true);
    const res = await novaApi.linkedinOutreach({
      phase: 'generate',
      mentorName: mentor.name,
      mentorTitle: mentor.title,
      mentorBio: mentor.bio ?? '',
      userProfileSummary: chatSummary,
      portraitBullets,
      purpose,
      purposeDetail: purpose === 'other' ? otherDetail.trim() : undefined,
      followUpAnswer: followUpAnswer.trim(),
    });
    setEditedMessage(res.message ?? '');
    setWizStep('result');
    setLoading(false);
  };

  const handleCopy = async () => {
    await setStringAsync(editedMessage);
    Alert.alert('Copied', 'Message is on your clipboard.');
  };

  const handleSaveEdit = () => {
    onSaveMessage(mentor.id, editedMessage);
    Alert.alert('Saved', 'Your message has been saved to this mentor.');
  };

  const handleNovaRefine = async () => {
    if (!novaInput.trim() || refining) return;
    const request = novaInput.trim();
    setNovaInput('');
    setRefining(true);
    const refined = await novaApi.refineMessage({
      currentMessage: editedMessage,
      userRequest: request,
      mentorName: mentor.name,
      mentorTitle: mentor.title,
      mentorBio: mentor.bio ?? '',
      portraitBullets,
    });
    setEditedMessage(refined);
    setRefining(false);
    setShowNovaChat(false);
  };

  const showMessageTab = !isContacted;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={{
            backgroundColor: Colors.white,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            paddingTop: 12,
            paddingHorizontal: 18,
            paddingBottom: insets.bottom + 16,
            maxHeight: '92%',
          }}
        >
          {/* Header row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.dark, flex: 1 }} numberOfLines={1}>
              {mentor.name}
            </Text>
            {/* Grey checkmark save — only shown on result step */}
            {wizStep === 'result' && mainTab === 'message' && (
              <TouchableOpacity onPress={handleSaveEdit} hitSlop={12} style={{ marginRight: 12 }}>
                <Text style={{ fontSize: 20, color: Colors.muted }}>{'\u2713'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text style={{ fontSize: 22, color: Colors.muted }}>{'\u2715'}</Text>
            </TouchableOpacity>
          </View>

          {showMessageTab && (
            <View style={{ flexDirection: 'row', marginBottom: 14, gap: 8 }}>
              {(['profile', 'message'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setMainTab(tab)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: mainTab === tab ? Colors.orange : Colors.cream,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontWeight: '700', color: mainTab === tab ? Colors.white : Colors.dark }}>
                    {tab === 'profile' ? 'profile' : 'generate a message'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Profile tab */}
            {(mainTab === 'profile' || isContacted) && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, color: Colors.orange, fontWeight: '700', marginBottom: 6 }}>
                  {mentor.title}
                </Text>
                {mentor.bio ? (
                  <Text style={{ fontSize: 14, color: Colors.dark, lineHeight: 21, marginBottom: 12 }}>
                    {mentor.bio}
                  </Text>
                ) : null}
                {mentor.expertise.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {mentor.expertise.map((tag) => (
                      <View
                        key={tag}
                        style={{
                          backgroundColor: Colors.cream,
                          borderRadius: 999,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderWidth: 1,
                          borderColor: Colors.border,
                        }}
                      >
                        <Text style={{ fontSize: 11, color: Colors.muted, fontWeight: '600' }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <TouchableOpacity
                  onPress={openLinkedIn}
                  style={{ backgroundColor: Colors.dark, borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}
                >
                  <Text style={{ color: Colors.white, fontWeight: '800' }}>open LinkedIn search {'\u2192'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Message tab */}
            {showMessageTab && mainTab === 'message' && (
              <View style={{ paddingBottom: 24 }}>
                {/* Step 1: purpose */}
                {wizStep === 'purpose' && (
                  <>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 10 }}>
                      {"what's this message for?"}
                    </Text>
                    {(['job', 'chat', 'other'] as const).map((p) => (
                      <TouchableOpacity
                        key={p}
                        onPress={() => setPurpose(p)}
                        style={{
                          paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 8,
                          borderWidth: 2,
                          borderColor: purpose === p ? Colors.orange : Colors.border,
                          backgroundColor: purpose === p ? Colors.orangeLight : Colors.white,
                        }}
                      >
                        <Text style={{ fontWeight: '700', color: Colors.dark }}>
                          {p === 'job' ? 'a. inquire about a job' : p === 'chat' ? 'b. arrange a chat' : 'c. others'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {purpose === 'other' && (
                      <TextInput
                        value={otherDetail}
                        onChangeText={setOtherDetail}
                        placeholder="describe your goal in a sentence..."
                        placeholderTextColor={Colors.muted}
                        multiline
                        style={{
                          borderWidth: 1, borderColor: Colors.border, borderRadius: 12,
                          padding: 12, minHeight: 72, fontSize: 14, color: Colors.dark,
                          marginBottom: 12, marginTop: 4,
                        }}
                      />
                    )}
                    <TouchableOpacity
                      onPress={handlePurposeNext}
                      disabled={loading}
                      style={{
                        backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 14,
                        alignItems: 'center', opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? <ActivityIndicator color={Colors.white} /> : (
                        <Text style={{ color: Colors.white, fontWeight: '800' }}>continue {'\u2192'}</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}

                {/* Step 2: follow-up question */}
                {wizStep === 'followup' && (
                  <>
                    <Text style={{ fontSize: 14, color: Colors.dark, lineHeight: 21, marginBottom: 12 }}>
                      {followupQuestion}
                    </Text>
                    <TextInput
                      value={followUpAnswer}
                      onChangeText={setFollowUpAnswer}
                      placeholder="your answer..."
                      placeholderTextColor={Colors.muted}
                      multiline
                      style={{
                        borderWidth: 1, borderColor: Colors.border, borderRadius: 12,
                        padding: 12, minHeight: 88, fontSize: 14, color: Colors.dark, marginBottom: 12,
                      }}
                    />
                    <TouchableOpacity
                      onPress={handleGenerate}
                      disabled={loading}
                      style={{
                        backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 14,
                        alignItems: 'center', opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? <ActivityIndicator color={Colors.white} /> : (
                        <Text style={{ color: Colors.white, fontWeight: '800' }}>generate message {'\u2192'}</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setWizStep('purpose')} style={{ marginTop: 12, alignItems: 'center' }}>
                      <Text style={{ color: Colors.muted, fontSize: 13 }}>{'\u2190'} back</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Step 3: result — editable message */}
                {wizStep === 'result' && (
                  <>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.muted, marginBottom: 6 }}>
                      your draft — edit directly below
                    </Text>
                    <TextInput
                      ref={messageInputRef}
                      value={editedMessage}
                      onChangeText={setEditedMessage}
                      multiline
                      style={{
                        backgroundColor: Colors.cream,
                        borderRadius: 14,
                        padding: 14,
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: Colors.border,
                        fontSize: 14,
                        color: Colors.dark,
                        lineHeight: 22,
                        minHeight: 110,
                        textAlignVertical: 'top',
                      }}
                    />

                    {/* Nova mini-chat for editing */}
                    {showNovaChat ? (
                      <View style={{
                        backgroundColor: Colors.cream,
                        borderRadius: 14,
                        padding: 12,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: Colors.border,
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <View style={{
                            width: 24, height: 24, borderRadius: 12,
                            backgroundColor: Colors.orangeLight,
                            alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Text style={{ fontSize: 11 }}>{'\u2726'}</Text>
                          </View>
                          <Text style={{ fontSize: 12, color: Colors.muted, fontStyle: 'italic' }}>
                            tell Nova how to edit the message
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                          <TextInput
                            value={novaInput}
                            onChangeText={setNovaInput}
                            placeholder={'e.g. "make it shorter" or "sound more casual"'}
                            placeholderTextColor={Colors.muted}
                            multiline
                            style={{
                              flex: 1,
                              borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
                              padding: 10, fontSize: 13, color: Colors.dark,
                              minHeight: 44, textAlignVertical: 'top',
                              backgroundColor: Colors.white,
                            }}
                          />
                          <TouchableOpacity
                            onPress={handleNovaRefine}
                            disabled={refining || !novaInput.trim()}
                            style={{
                              width: 36, height: 36, borderRadius: 18,
                              backgroundColor: novaInput.trim() && !refining ? Colors.orange : Colors.orangeLight,
                              alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            {refining
                              ? <ActivityIndicator size="small" color={Colors.white} />
                              : <Text style={{ fontSize: 15, color: Colors.white }}>{'\u2192'}</Text>
                            }
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => setShowNovaChat(false)} style={{ marginTop: 8, alignItems: 'center' }}>
                          <Text style={{ fontSize: 12, color: Colors.muted }}>cancel</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      /* Nova edit-the-message hint */
                      <TouchableOpacity
                        onPress={() => setShowNovaChat(true)}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}
                      >
                        <View style={{
                          width: 26, height: 26, borderRadius: 13,
                          backgroundColor: Colors.orangeLight,
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Text style={{ fontSize: 11 }}>{'\u2726'}</Text>
                        </View>
                        <Text style={{ fontSize: 12, color: Colors.muted, fontStyle: 'italic' }}>
                          edit the message
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Copy + Contact buttons */}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        onPress={handleCopy}
                        style={{ flex: 1, backgroundColor: Colors.dark, borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}
                      >
                        <Text style={{ color: Colors.white, fontWeight: '800' }}>copy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={openLinkedIn}
                        style={{ flex: 1, backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}
                      >
                        <Text style={{ color: Colors.white, fontWeight: '800' }}>contact now</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => { setWizStep('purpose'); setPurpose(null); setEditedMessage(''); }}
                      style={{ marginTop: 14, alignItems: 'center' }}
                    >
                      <Text style={{ color: Colors.muted, fontSize: 13 }}>start over</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
