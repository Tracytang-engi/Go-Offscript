import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { NovaBubble } from '../components/nova/NovaBubble';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { PathCard } from '../components/ui/PathCard';
import { ProgressDots } from '../components/ui/ProgressDots';
import { Colors } from '../constants/colors';
import { useOnboardingStore } from '../lib/store/onboarding.store';
import { pathApi } from '../lib/api/onboarding.api';
import type { CareerPath } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Path'>;
};

export const PathScreen = ({ navigation }: Props) => {
  const { setCareerPath, selectedValues, skills, connectedPlatforms } = useOnboardingStore();

  const [path, setPath] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReal, setIsReal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runAnalysis = () => {
    setLoading(true);
    setPath(null);
    setErrorMsg(null);

    // Pass Zustand data as supplementary input — backend merges with DB records
    pathApi.generate({
      skills,
      values: selectedValues,
      socialSignals: connectedPlatforms.map((p) => ({ platform: p })),
    }).then((result) => {
      setPath(result.path);
      setIsReal(result.isReal);
      setCareerPath(result.path);
      if (!result.isReal && result.errorMessage) {
        setErrorMsg(result.errorMessage);
      }
      setLoading(false);
    });
  };

  useEffect(() => { runAnalysis(); }, []);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
          <Text style={{ fontSize: 36, marginBottom: 20 }}>✦</Text>
          <ActivityIndicator color={Colors.orange} size="large" />
          <Text style={{
            fontSize: 16, fontWeight: '700', color: Colors.dark,
            marginTop: 24, textAlign: 'center',
          }}>
            nova is reading your profile...
          </Text>
          <Text style={{
            fontSize: 13, color: Colors.muted,
            marginTop: 8, textAlign: 'center', paddingHorizontal: 40,
          }}>
            pulling together your skills, values and interests to find your path
          </Text>
        </View>
      </Screen>
    );
  }

  if (!path) return null;

  const valuesLabel = selectedValues.slice(0, 2).join(' + ');

  return (
    <Screen>
      {/* Nova analysis bubble — real explanation from AI */}
      <NovaBubble
        message={path.explanation}
        subtitle={isReal ? 'online' : 'offline mode'}
      />

      {/* Offline / error notice */}
      {!isReal && (
        <View style={{
          backgroundColor: '#FFF3CD', borderRadius: 12,
          padding: 12, marginBottom: 12,
          flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        }}>
          <Text style={{ fontSize: 15 }}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: '#856404', lineHeight: 18 }}>
              {errorMsg ?? "nova couldn't connect — showing a sample path"}
            </Text>
            <TouchableOpacity onPress={runAnalysis} style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 12, color: Colors.orange, fontWeight: '700' }}>
                try again →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Selected values summary */}
      {valuesLabel ? (
        <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 12 }}>
          based on your values: {valuesLabel}
        </Text>
      ) : null}

      {/* Path cards */}
      <View style={{ marginBottom: 12 }}>
        {path.pathScores.map((score) => (
          <PathCard key={score.id} score={score} />
        ))}
      </View>

      {/* Tension note */}
      {path.tensionNote ? (
        <View style={{
          backgroundColor: Colors.amber,
          borderRadius: 12, padding: 14,
          marginBottom: 20,
          flexDirection: 'row', alignItems: 'flex-start',
        }}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>⚡</Text>
          <Text style={{ fontSize: 13, color: Colors.dark, flex: 1, lineHeight: 18 }}>
            <Text style={{ fontWeight: '700' }}>nova spotted a tension  </Text>
            {path.tensionNote}
          </Text>
        </View>
      ) : null}

      {/* Next actions */}
      {isReal && path.nextActions?.length > 0 && (
        <View style={{
          backgroundColor: Colors.white,
          borderRadius: 12, padding: 14, marginBottom: 20,
          borderWidth: 1, borderColor: Colors.border,
        }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.dark, marginBottom: 8 }}>
            next moves 🎯
          </Text>
          {path.nextActions.map((action, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 6 }}>
              <Text style={{ fontSize: 12, color: Colors.orange, marginRight: 6 }}>→</Text>
              <Text style={{ fontSize: 12, color: Colors.dark, flex: 1, lineHeight: 18 }}>
                {action}
              </Text>
            </View>
          ))}
        </View>
      )}

      <PrimaryButton
        label="show me how →"
        onPress={() => navigation.navigate('WaysIn')}
      />

      <ProgressDots current={4} />
    </Screen>
  );
};
