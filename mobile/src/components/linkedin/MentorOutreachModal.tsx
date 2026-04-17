import React, { useEffect, useState } from 'react';
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
  isContacted: boolean;
  onClose: () => void;
}

export const MentorOutreachModal = ({
  visible,
  mentor,
  chatSummary,
  isContacted,
  onClose,
}: Props) => {
  const insets = useSafeAreaInsets();
  const [mainTab, setMainTab] = useState<'profile' | 'message'>('profile');
  const [wizStep, setWizStep] = useState<WizardStep>('purpose');
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [otherDetail, setOtherDetail] = useState('');
  const [followupQuestion, setFollowupQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [generated, setGenerated] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && mentor) {
      setMainTab('profile');
      setWizStep('purpose');
      setPurpose(null);
      setOtherDetail('');
      setFollowupQuestion('');
      setFollowUpAnswer('');
      setGenerated('');
      setLoading(false);
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
      purpose,
      purposeDetail: purpose === 'other' ? otherDetail.trim() : undefined,
      followUpAnswer: followUpAnswer.trim(),
    });
    setGenerated(res.message ?? '');
    setWizStep('result');
    setLoading(false);
  };

  const handleCopy = async () => {
    await setStringAsync(generated);
    Alert.alert('Copied', 'Message is on your clipboard.');
  };

  const showMessageTab = !isContacted;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
        <View
          style={{
            backgroundColor: Colors.white,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            paddingTop: 12,
            paddingHorizontal: 18,
            paddingBottom: insets.bottom + 16,
            maxHeight: '88%',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.dark }} numberOfLines={1}>
              {mentor.name}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text style={{ fontSize: 22, color: Colors.muted }}>✕</Text>
            </TouchableOpacity>
          </View>

          {showMessageTab && (
            <View style={{ flexDirection: 'row', marginBottom: 14, gap: 8 }}>
              <TouchableOpacity
                onPress={() => setMainTab('profile')}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: mainTab === 'profile' ? Colors.orange : Colors.cream,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontWeight: '700', color: mainTab === 'profile' ? Colors.white : Colors.dark }}>
                  profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMainTab('message')}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: mainTab === 'message' ? Colors.orange : Colors.cream,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontWeight: '700', color: mainTab === 'message' ? Colors.white : Colors.dark }}>
                  generate a message
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                  style={{
                    backgroundColor: Colors.dark,
                    borderRadius: 14,
                    paddingVertical: 13,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: Colors.white, fontWeight: '800' }}>open LinkedIn search →</Text>
                </TouchableOpacity>
              </View>
            )}

            {showMessageTab && mainTab === 'message' && (
              <View style={{ paddingBottom: 24 }}>
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
                          paddingVertical: 12,
                          paddingHorizontal: 14,
                          borderRadius: 12,
                          marginBottom: 8,
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
                          borderWidth: 1,
                          borderColor: Colors.border,
                          borderRadius: 12,
                          padding: 12,
                          minHeight: 72,
                          fontSize: 14,
                          color: Colors.dark,
                          marginBottom: 12,
                          marginTop: 4,
                        }}
                      />
                    )}
                    <TouchableOpacity
                      onPress={handlePurposeNext}
                      disabled={loading}
                      style={{
                        backgroundColor: Colors.orange,
                        borderRadius: 14,
                        paddingVertical: 14,
                        alignItems: 'center',
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? (
                        <ActivityIndicator color={Colors.white} />
                      ) : (
                        <Text style={{ color: Colors.white, fontWeight: '800' }}>continue →</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}

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
                        borderWidth: 1,
                        borderColor: Colors.border,
                        borderRadius: 12,
                        padding: 12,
                        minHeight: 88,
                        fontSize: 14,
                        color: Colors.dark,
                        marginBottom: 12,
                      }}
                    />
                    <TouchableOpacity
                      onPress={handleGenerate}
                      disabled={loading}
                      style={{
                        backgroundColor: Colors.orange,
                        borderRadius: 14,
                        paddingVertical: 14,
                        alignItems: 'center',
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? (
                        <ActivityIndicator color={Colors.white} />
                      ) : (
                        <Text style={{ color: Colors.white, fontWeight: '800' }}>generate message →</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setWizStep('purpose')} style={{ marginTop: 12, alignItems: 'center' }}>
                      <Text style={{ color: Colors.muted, fontSize: 13 }}>← back</Text>
                    </TouchableOpacity>
                  </>
                )}

                {wizStep === 'result' && (
                  <>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.muted, marginBottom: 8 }}>
                      your draft (40–80 words)
                    </Text>
                    <View
                      style={{
                        backgroundColor: Colors.cream,
                        borderRadius: 14,
                        padding: 14,
                        marginBottom: 14,
                        borderWidth: 1,
                        borderColor: Colors.border,
                      }}
                    >
                      <Text style={{ fontSize: 14, color: Colors.dark, lineHeight: 22 }}>{generated}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        onPress={handleCopy}
                        style={{
                          flex: 1,
                          backgroundColor: Colors.dark,
                          borderRadius: 14,
                          paddingVertical: 13,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: Colors.white, fontWeight: '800' }}>copy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={openLinkedIn}
                        style={{
                          flex: 1,
                          backgroundColor: Colors.orange,
                          borderRadius: 14,
                          paddingVertical: 13,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: Colors.white, fontWeight: '800' }}>contact now</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setWizStep('purpose');
                        setPurpose(null);
                        setGenerated('');
                      }}
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
      </View>
    </Modal>
  );
};
