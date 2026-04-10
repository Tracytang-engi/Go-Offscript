import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { NovaBubble } from '../components/nova/NovaBubble';
import { OpportunityCard } from '../components/ui/OpportunityCard';
import { ProgressDots } from '../components/ui/ProgressDots';
import { Colors } from '../constants/colors';
import { useOnboardingStore } from '../lib/store/onboarding.store';
import { opportunityApi, searchOpportunities } from '../lib/api/onboarding.api';
import type { FilterType, Opportunity } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WaysIn'>;
};

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'all' },
  { key: 'opps', label: '🎯 opps' },
  { key: 'coaching', label: '💬 coaching' },
  { key: 'meet', label: '📍 meet' },
];

const FILTER_TYPES: Record<FilterType, string[]> = {
  all: ['INTERNSHIP', 'FELLOWSHIP', 'SHORT_PROJECT', 'COACHING', 'MEETUP'],
  opps: ['INTERNSHIP', 'FELLOWSHIP', 'SHORT_PROJECT'],
  coaching: ['COACHING'],
  meet: ['MEETUP'],
};

export const WaysInScreen = ({ navigation: _navigation }: Props) => {
  const { opportunities, opportunityFilter, setOpportunities, setOpportunityFilter } = useOnboardingStore();

  const [allOpps, setAllOpps] = useState<Opportunity[]>(opportunities);
  const [loading, setLoading] = useState(opportunities.length === 0);
  const [isReal, setIsReal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>(opportunityFilter as FilterType);

  // On mount: call Perplexity search for real opportunities
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await searchOpportunities();
      setAllOpps(result.opportunities);
      setOpportunities(result.opportunities);
      setIsReal(result.isReal);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = allOpps.filter((o) => {
    const types = FILTER_TYPES[activeFilter];
    return types.includes(o.type);
  });

  const handleFilter = (f: FilterType) => {
    setActiveFilter(f);
    setOpportunityFilter(f);
  };

  const novaMessage = isReal
    ? "okay bestie — here's what's actually open right now for your path 🍫✨ these are real, live opportunities — tap to apply"
    : "okay bestie — here's how you actually get there 🍫✨ tap to filter what you need right now";

  return (
    <Screen>
      <NovaBubble message={novaMessage} subtitle={isReal ? 'live search ✦' : 'online'} />

      {/* Real data indicator */}
      {isReal && (
        <View style={{
          backgroundColor: '#D1FAE5', borderRadius: 10,
          paddingHorizontal: 12, paddingVertical: 6,
          marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6,
        }}>
          <Text style={{ fontSize: 12 }}>✦</Text>
          <Text style={{ fontSize: 12, color: '#065F46', fontWeight: '600' }}>
            nova searched the web for real, current opportunities for you
          </Text>
        </View>
      )}

      {/* Filter chips */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => handleFilter(f.key)}
            style={{
              backgroundColor: activeFilter === f.key ? Colors.orange : Colors.white,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: activeFilter === f.key ? Colors.orange : Colors.border,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Text style={{
              color: activeFilter === f.key ? Colors.white : Colors.dark,
              fontSize: 14, fontWeight: '600',
            }}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Opportunities list */}
      {loading ? (
        <View style={{ alignItems: 'center', paddingTop: 40 }}>
          <ActivityIndicator color={Colors.orange} size="large" />
          <Text style={{ fontSize: 14, color: Colors.muted, marginTop: 16, textAlign: 'center' }}>
            nova is searching for real opportunities...
          </Text>
          <Text style={{ fontSize: 12, color: Colors.muted, marginTop: 4 }}>
            pulling live results across the web
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <Text style={{ color: Colors.muted, textAlign: 'center', marginTop: 40 }}>
          no opportunities found for this filter
        </Text>
      ) : (
        <View>
          {filtered.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </View>
      )}

      <ProgressDots current={5} />
    </Screen>
  );
};
