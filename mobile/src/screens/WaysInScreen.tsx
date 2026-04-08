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
import { opportunityApi } from '../lib/api/onboarding.api';
import type { FilterType } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WaysIn'>;
};

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'all' },
  { key: 'opps', label: '🎯 opps' },
  { key: 'coaching', label: '💬 coaching' },
  { key: 'meet', label: '📍 meet' },
];

export const WaysInScreen = ({ navigation: _navigation }: Props) => {
  const { opportunities, opportunityFilter, setOpportunities, setOpportunityFilter } =
    useOnboardingStore();
  const [loading, setLoading] = useState(opportunities.length === 0);

  const FALLBACK_OPPS = [
    { id: '1', title: 'Goldman Sachs Summer Analyst', organization: 'Goldman Sachs', description: 'Client-facing finance from day one.', type: 'INTERNSHIP' as const, deadline: 'closes May', isOpen: true, tags: ['finance', 'investment banking'], peerCount: 4 },
    { id: '2', title: 'Wellcome Trust Fellowship', organization: 'Wellcome Trust', description: 'Funded research. No experience needed. Stipend + costs.', type: 'FELLOWSHIP' as const, deadline: 'open now', isOpen: true, tags: ['research', 'fellowship'], peerCount: 3 },
    { id: '3', title: 'Freelance Creative Project', organization: 'Self-directed', description: 'Build your creative portfolio with short freelance work.', type: 'SHORT_PROJECT' as const, deadline: 'anytime', isOpen: true, tags: ['creative', 'freelance'], peerCount: 7 },
    { id: '4', title: '1:1 Career Coaching Session', organization: 'Go Off Script Coaches', description: 'A focused session with a coach in your target industry.', type: 'COACHING' as const, deadline: 'open now', isOpen: true, tags: ['coaching'], peerCount: 12 },
    { id: '5', title: 'Creative Careers Meetup', organization: 'Creative Mornings', description: 'Monthly community meetup for people building creative careers.', type: 'MEETUP' as const, deadline: 'monthly', isOpen: true, tags: ['community', 'networking'], peerCount: 20 },
  ];

  const fetchOpps = async (filter: string) => {
    setLoading(true);
    try {
      const result = await opportunityApi.getAll(filter);
      setOpportunities(result.opportunities.length > 0 ? result.opportunities : FALLBACK_OPPS);
    } catch {
      setOpportunities(FALLBACK_OPPS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpps(opportunityFilter);
  }, []);

  const handleFilter = (filter: FilterType) => {
    setOpportunityFilter(filter);
    fetchOpps(filter);
  };

  return (
    <Screen>
      <NovaBubble
        message="okay bestie — here's how you actually get there 🍫✨ tap to filter what you need right now"
        subtitle="online"
      />

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 20 }}
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => handleFilter(f.key)}
            style={{
              backgroundColor: opportunityFilter === f.key ? Colors.orange : Colors.white,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: opportunityFilter === f.key ? Colors.orange : Colors.border,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                color: opportunityFilter === f.key ? Colors.white : Colors.dark,
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Opportunities list */}
      {loading ? (
        <ActivityIndicator color={Colors.orange} style={{ marginTop: 40 }} />
      ) : opportunities.length === 0 ? (
        <Text style={{ color: Colors.muted, textAlign: 'center', marginTop: 40 }}>
          no opportunities found for this filter
        </Text>
      ) : (
        <View>
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </View>
      )}

      <ProgressDots current={5} />
    </Screen>
  );
};
