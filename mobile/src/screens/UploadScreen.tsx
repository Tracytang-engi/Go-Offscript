import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  ScrollView, TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { NovaBubble } from '../components/nova/NovaBubble';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SkillChip } from '../components/ui/SkillChip';
import { ProgressDots } from '../components/ui/ProgressDots';
import { Colors } from '../constants/colors';
import { useOnboardingStore } from '../lib/store/onboarding.store';
import { cvApi, type CvUploadResult } from '../lib/api/cv.api';
import { socialApi, type SocialAnalysis } from '../lib/api/onboarding.api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Upload'>;
};

type PlatformKey = 'TIKTOK' | 'INSTAGRAM' | 'LINKEDIN';

const PLATFORMS: { key: PlatformKey; label: string; emoji: string; hint: string }[] = [
  { key: 'TIKTOK', label: 'TikTok', emoji: '📱', hint: 'e.g. architecture, finance, fashion content...' },
  { key: 'INSTAGRAM', label: 'Instagram', emoji: '📸', hint: 'e.g. design studios, startup founders, travel...' },
  { key: 'LINKEDIN', label: 'LinkedIn', emoji: '💼', hint: 'e.g. VC content, startup jobs, consulting...' },
];

interface PlatformState {
  uploading: boolean;
  done: boolean;
  analysis?: SocialAnalysis;
  imageUri?: string;
}

export const UploadScreen = ({ navigation }: Props) => {
  const { cvId, cvFileName, skills, setSkills, setCv } = useOnboardingStore();

  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const [cvUploadResult, setCvUploadResult] = useState<CvUploadResult | null>(null);

  const [platformStates, setPlatformStates] = useState<Record<PlatformKey, PlatformState>>({
    TIKTOK: { uploading: false, done: false },
    INSTAGRAM: { uploading: false, done: false },
    LINKEDIN: { uploading: false, done: false },
  });

  // Modal for each platform
  const [activeModal, setActiveModal] = useState<PlatformKey | null>(null);
  const [modalDescription, setModalDescription] = useState('');

  // ── CV Upload ────────────────────────────────────────────────────────────────

  const handlePickCv = async () => {
    setCvError(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf',
               'application/msword',
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      setCvUploading(true);

      const form = new FormData();
      form.append('cv', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType ?? 'application/pdf',
      } as unknown as Blob);

      const data = await cvApi.upload(form);
      setCvUploadResult(data);
      setCv(data.cvId, file.name, data.skills);
      if (!data.isReal && data.errorMessage) {
        setCvError(data.errorMessage);
      }
    } catch (e) {
      setCvError('Upload failed — please try again');
      console.error('[CV upload]', e);
    } finally {
      setCvUploading(false);
    }
  };

  // ── Social Screenshot Upload ─────────────────────────────────────────────────

  const openPlatformModal = (platform: PlatformKey) => {
    setModalDescription('');
    setActiveModal(platform);
  };

  const handlePickScreenshot = async (platform: PlatformKey) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Need photo library access to upload a screenshot');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) return;
    setPlatformStates((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], imageUri: result.assets[0].uri },
    }));
  };

  const handleSavePlatform = async (platform: PlatformKey) => {
    const state = platformStates[platform];
    if (!state.imageUri && !modalDescription.trim()) return;

    setPlatformStates((prev) => ({ ...prev, [platform]: { ...prev[platform], uploading: true } }));
    setActiveModal(null);

    try {
      const result = await socialApi.uploadScreenshot(
        platform,
        state.imageUri,
        modalDescription.trim() || undefined
      );
      setPlatformStates((prev) => ({
        ...prev,
        [platform]: {
          uploading: false,
          done: true,
          analysis: result.analysis,
          imageUri: state.imageUri,
        },
      }));
    } catch (e) {
      console.error('[Social upload]', e);
      // Mark done anyway — don't block the user
      setPlatformStates((prev) => ({
        ...prev,
        [platform]: { ...prev[platform], uploading: false, done: true },
      }));
    }
  };

  const canContinue = cvId !== null;
  const anyPlatformDone = Object.values(platformStates).some((s) => s.done);

  return (
    <Screen>
      <NovaBubble
        message="okayy bestie 👀 drop your CV — and share your socials if you want. i can see what you're actually into, not just what looks good on paper"
        subtitle="online"
      />

      {/* ── CV Upload ── */}
      {!cvId ? (
        <TouchableOpacity
          onPress={handlePickCv}
          disabled={cvUploading}
          style={{
            borderWidth: 2,
            borderColor: Colors.orangeMuted,
            borderStyle: 'dashed',
            borderRadius: 16,
            padding: 28,
            alignItems: 'center',
            marginBottom: 20,
            backgroundColor: Colors.white,
          }}
        >
          {cvUploading ? (
            <>
              <ActivityIndicator color={Colors.orange} />
              <Text style={{ color: Colors.muted, marginTop: 8, fontSize: 13 }}>
                uploading + extracting skills...
              </Text>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>📄</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.orange }}>
                drop your CV here
              </Text>
              <Text style={{ fontSize: 12, color: Colors.muted, marginTop: 4 }}>
                PDF or Word — tap to pick from files
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handlePickCv}
          style={{
            backgroundColor: Colors.orangeLight,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 4 }}>✓</Text>
          <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.orange }}>
            CV uploaded – skills extracted
          </Text>
          <Text style={{ fontSize: 12, color: Colors.muted }}>
            {cvFileName} · tap to replace
          </Text>
        </TouchableOpacity>
      )}

      {/* Extracted skills — shown after CV upload */}
      {cvId && (
        <View style={{ marginBottom: 24 }}>
          {skills.length > 0 ? (
            <>
              <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 8 }}>
                skills nova spotted in your CV ✦ tap to remove
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {skills.slice(0, 7).map((skill) => (
                  <SkillChip
                    key={skill}
                    label={skill}
                    selected
                    onPress={() => setSkills(skills.filter((s) => s !== skill))}
                  />
                ))}
              </View>
            </>
          ) : (
            <Text style={{ fontSize: 12, color: Colors.muted, fontStyle: 'italic' }}>
              nova couldn't extract skills — re-upload your CV or we'll infer them in our chat
            </Text>
          )}
        </View>
      )}

      {/* ── Social Signals ── */}
      <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 6 }}>
        share your world 🌍
      </Text>
      <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 14 }}>
        upload a screenshot of your feed or describe what you watch — nova uses this to understand your real interests
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 28 }}>
        {PLATFORMS.map((p) => {
          const state = platformStates[p.key];
          return (
            <TouchableOpacity
              key={p.key}
              onPress={() => openPlatformModal(p.key)}
              disabled={state.uploading}
              style={{
                backgroundColor: state.done ? Colors.orangeLight : Colors.white,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: state.done ? Colors.orange : Colors.border,
                padding: 14,
                marginRight: 12,
                alignItems: 'center',
                minWidth: 100,
              }}
            >
              {state.uploading ? (
                <ActivityIndicator color={Colors.orange} style={{ marginBottom: 4 }} />
              ) : (
                <Text style={{ fontSize: 24, marginBottom: 6 }}>{p.emoji}</Text>
              )}
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.dark }}>
                {p.label}
              </Text>
              <Text style={{ fontSize: 11, color: state.done ? Colors.orange : Colors.muted, marginTop: 2 }}>
                {state.uploading ? 'analysing...' : state.done ? 'done ✓' : 'add signal'}
              </Text>
              {state.done && state.analysis?.topics?.length ? (
                <Text
                  style={{ fontSize: 10, color: Colors.muted, marginTop: 4, textAlign: 'center' }}
                  numberOfLines={2}
                >
                  {state.analysis.topics.slice(0, 3).join(', ')}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {cvError ? (
        <Text style={{ color: 'red', fontSize: 13, marginBottom: 12 }}>{cvError}</Text>
      ) : null}

      <PrimaryButton
        label={anyPlatformDone ? "that's me →" : cvId ? "that's me →" : 'upload your cv first'}
        onPress={() => navigation.navigate('Values')}
        disabled={!canContinue}
      />

      <ProgressDots current={2} />

      {/* ── Platform Modal ── */}
      <Modal visible={activeModal !== null} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View
            style={{
              backgroundColor: Colors.white,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            {activeModal && (
              <>
                <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.dark, marginBottom: 4 }}>
                  {PLATFORMS.find((p) => p.key === activeModal)?.emoji}{' '}
                  {PLATFORMS.find((p) => p.key === activeModal)?.label}
                </Text>
                <Text style={{ fontSize: 13, color: Colors.muted, marginBottom: 20 }}>
                  upload a screenshot of your feed/explore page, or just describe what you're into
                </Text>

                {/* Screenshot picker */}
                <TouchableOpacity
                  onPress={() => handlePickScreenshot(activeModal)}
                  style={{
                    borderWidth: 1.5,
                    borderColor: platformStates[activeModal].imageUri ? Colors.orange : Colors.border,
                    borderStyle: platformStates[activeModal].imageUri ? 'solid' : 'dashed',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    marginBottom: 16,
                    backgroundColor: platformStates[activeModal].imageUri
                      ? Colors.orangeLight
                      : Colors.cream,
                  }}
                >
                  <Text style={{ fontSize: 22, marginBottom: 4 }}>
                    {platformStates[activeModal].imageUri ? '🖼️' : '📷'}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.orange }}>
                    {platformStates[activeModal].imageUri
                      ? 'screenshot selected ✓ (tap to change)'
                      : 'pick a screenshot from your camera roll'}
                  </Text>
                </TouchableOpacity>

                {/* Manual description */}
                <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.dark, marginBottom: 8 }}>
                  or describe what you watch / follow{' '}
                  <Text style={{ color: Colors.muted, fontWeight: '400' }}>(optional)</Text>
                </Text>
                <TextInput
                  value={modalDescription}
                  onChangeText={setModalDescription}
                  placeholder={PLATFORMS.find((p) => p.key === activeModal)?.hint}
                  placeholderTextColor={Colors.muted}
                  multiline
                  numberOfLines={3}
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.border,
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 14,
                    color: Colors.dark,
                    backgroundColor: Colors.cream,
                    marginBottom: 20,
                    minHeight: 80,
                    textAlignVertical: 'top',
                  }}
                />

                <PrimaryButton
                  label="let nova analyse this →"
                  onPress={() => handleSavePlatform(activeModal)}
                  disabled={!platformStates[activeModal].imageUri && !modalDescription.trim()}
                />
                <TouchableOpacity
                  onPress={() => setActiveModal(null)}
                  style={{ marginTop: 12, alignItems: 'center' }}
                >
                  <Text style={{ color: Colors.muted, fontSize: 14 }}>cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
};
