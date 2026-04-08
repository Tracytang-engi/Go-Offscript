import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { NovaBubble } from '../components/nova/NovaBubble';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { ValueCard } from '../components/ui/ValueCard';
import { ProgressDots } from '../components/ui/ProgressDots';
import { Colors } from '../constants/colors';
import { useOnboardingStore } from '../lib/store/onboarding.store';
import { valuesApi } from '../lib/api/onboarding.api';
import type { Value } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Values'>;
};

export const ValuesScreen = ({ navigation }: Props) => {
  const { selectedValues, toggleValue, connectedPlatforms } = useOnboardingStore();
  const FALLBACK_VALUES: Value[] = [
    { id: 'financial_security', key: 'financial_security', label: 'Financial Security', emoji: '💰' },
    { id: 'creativity', key: 'creativity', label: 'Creativity', emoji: '🎨' },
    { id: 'making_impact', key: 'making_impact', label: 'Making Impact', emoji: '🌱' },
    { id: 'discovery', key: 'discovery', label: 'Discovery', emoji: '🔬' },
    { id: 'community', key: 'community', label: 'Community', emoji: '🍯' },
    { id: 'work_life_balance', key: 'work_life_balance', label: 'Work-Life Balance', emoji: '⚖️' },
    { id: 'building_things', key: 'building_things', label: 'Building Things', emoji: '🚀' },
    { id: 'growth_and_status', key: 'growth_and_status', label: 'Growth & Status', emoji: '📈' },
  ];

  const [values, setValues] = useState<Value[]>(FALLBACK_VALUES);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    valuesApi.getAll()
      .then((data) => { if (data.length > 0) setValues(data); })
      .catch(() => { /* silently use fallback */ });
  }, []);

  const handleContinue = async () => {
    setSaving(true);
    try {
      await valuesApi.save(selectedValues);
    } catch {
      // If save fails Nova will use values from the prompt directly when possible
    }
    navigation.navigate('Path');
    setSaving(false);
  };

  const tiktokConnected = connectedPlatforms.includes('TIKTOK');
  const novaMessage = tiktokConnected
    ? "i had a little peek at your TikTok 👀 you're watching a LOT of interesting content.\n\nbut first — what actually matters to you in a career? be honest 🪄"
    : "okay, let's get to the real stuff 🪄\n\nwhat actually matters to you in a career? pick everything that feels true — no wrong answers here";

  const rows: Value[][] = [];
  for (let i = 0; i < values.length; i += 2) {
    rows.push(values.slice(i, i + 2));
  }

  return (
    <Screen>
      <NovaBubble message={novaMessage} subtitle="online" />

      {loading ? (
        <ActivityIndicator color={Colors.orange} style={{ marginTop: 40 }} />
      ) : (
        <View style={{ marginBottom: 24 }}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={{ flexDirection: 'row' }}>
              {row.map((value) => (
                <ValueCard
                  key={value.id}
                  label={value.label}
                  emoji={value.emoji}
                  selected={selectedValues.includes(value.key)}
                  onPress={() => toggleValue(value.key)}
                />
              ))}
              {row.length === 1 && <View style={{ flex: 1, margin: 5 }} />}
            </View>
          ))}
        </View>
      )}

      <PrimaryButton
        label="that's what i'm about →"
        onPress={handleContinue}
        loading={saving}
        disabled={selectedValues.length === 0}
      />

      <ProgressDots current={3} />
    </Screen>
  );
};
