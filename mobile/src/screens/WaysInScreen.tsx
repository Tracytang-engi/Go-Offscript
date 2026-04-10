import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { NovaBubble } from '../components/nova/NovaBubble';
import { OpportunityCard } from '../components/ui/OpportunityCard';
import { MentorCard } from '../components/ui/MentorCard';
import { ProgressDots } from '../components/ui/ProgressDots';
import { Colors } from '../constants/colors';
import { useOnboardingStore } from '../lib/store/onboarding.store';
import { opportunityApi, searchOpportunities, mentorApi } from '../lib/api/onboarding.api';
import type { FilterType, Opportunity, Mentor } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WaysIn'>;
};

// mentors1 = first version of mentor feature (name may change later)
type ExtendedFilter = FilterType | 'mentors1';

const FILTERS: { key: ExtendedFilter; label: string }[] = [
  { key: 'all', label: 'all' },
  { key: 'opps', label: '🎯 opps' },
  { key: 'coaching', label: '💬 coaching' },
  { key: 'meet', label: '📍 meet' },
  { key: 'mentors1', label: '🤝 mentors' },
];

const FILTER_TYPES: Record<string, string[]> = {
  all: ['INTERNSHIP', 'FELLOWSHIP', 'SHORT_PROJECT', 'COACHING', 'MEETUP'],
  opps: ['INTERNSHIP', 'FELLOWSHIP', 'SHORT_PROJECT'],
  coaching: ['COACHING'],
  meet: ['MEETUP'],
};

export const WaysInScreen = ({ navigation: _navigation }: Props) => {
  const { opportunities, opportunityFilter, setOpportunities, setOpportunityFilter } = useOnboardingStore();

  const [allOpps, setAllOpps] = useState<Opportunity[]>(opportunities);
  const [mentors, setMentors] = useState<Mentor[]>([]);

  const [oppsLoading, setOppsLoading] = useState(opportunities.length === 0);
  const [mentorsLoading, setMentorsLoading] = useState(false);
  const [oppsIsReal, setOppsIsReal] = useState(false);
  const [mentorsIsReal, setMentorsIsReal] = useState(false);

  const [activeFilter, setActiveFilter] = useState<ExtendedFilter>(
    (opportunityFilter as ExtendedFilter) ?? 'all'
  );

  // Load opportunities on mount
  useEffect(() => {
    const load = async () => {
      setOppsLoading(true);
      const result = await searchOpportunities();
      setAllOpps(result.opportunities);
      setOpportunities(result.opportunities);
      setOppsIsReal(result.isReal);
      setOppsLoading(false);
    };
    load();
  }, []);

  // Load mentors when mentors1 tab is first selected
  const handleFilter = (f: ExtendedFilter) => {
    setActiveFilter(f);
    if (f !== 'mentors1') {
      setOpportunityFilter(f as string);
    }
    if (f === 'mentors1' && mentors.length === 0) {
      setMentorsLoading(true);
      mentorApi.search().then((result) => {
        setMentors(result.mentors);
        setMentorsIsReal(result.isReal);
        setMentorsLoading(false);
      });
    }
  };

  const filteredOpps = allOpps.filter((o) => {
    const types = FILTER_TYPES[activeFilter] ?? FILTER_TYPES.all;
    return types.includes(o.type);
  });

  const isMentorTab = activeFilter === 'mentors1';
  const isLoading = isMentorTab ? mentorsLoading : oppsLoading;
  const isReal = isMentorTab ? mentorsIsReal : oppsIsReal;

  const novaMessage = isMentorTab
    ? "i found people who've actually walked this path 👀 these aren't random — they match your direction. reach out and say something real 💬"
    : isReal
    ? "okay bestie — here's what's actually open right now for your path 🍫✨ these are real, live opportunities — tap to apply"
    : "okay bestie — here's how you actually get there 🍫✨ tap to filter what you need right now";

  return (
    <Screen>
      <NovaBubble
        message={novaMessage}
        subtitle={isReal ? 'live search ✦' : 'online'}
      />

      {/* Real data badge */}
      {isReal && (
        <View style={{
          backgroundColor: isMentorTab ? '#EEF2FF' : '#D1FAE5',
          borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
          marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6,
        }}>
          <Text style={{ fontSize: 12 }}>✦</Text>
          <Text style={{
            fontSize: 12, fontWeight: '600',
            color: isMentorTab ? '#4338CA' : '#065F46',
          }}>
            {isMentorTab
              ? 'nova searched LinkedIn for real mentors who match your path'
              : 'nova searched the web for real, current opportunities for you'}
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

      {/* Content */}
      {isLoading ? (
        <View style={{ alignItems: 'center', paddingTop: 40 }}>
          <ActivityIndicator color={Colors.orange} size="large" />
          <Text style={{ fontSize: 14, color: Colors.muted, marginTop: 16, textAlign: 'center' }}>
            {isMentorTab
              ? 'nova is finding mentors on LinkedIn...'
              : 'nova is searching for real opportunities...'}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.muted, marginTop: 4 }}>
            {isMentorTab
              ? 'looking for people who\'ve walked your path'
              : 'pulling live results across the web'}
          </Text>
        </View>
      ) : isMentorTab ? (
        // ── Mentor cards ──
        mentors.length === 0 ? (
          <Text style={{ color: Colors.muted, textAlign: 'center', marginTop: 40 }}>
            couldn't find mentors — try again later
          </Text>
        ) : (
          <View>
            {mentors.map((m) => (
              <MentorCard key={m.id} mentor={m} />
            ))}
          </View>
        )
      ) : (
        // ── Opportunity cards ──
        filteredOpps.length === 0 ? (
          <Text style={{ color: Colors.muted, textAlign: 'center', marginTop: 40 }}>
            no opportunities found for this filter
          </Text>
        ) : (
          <View>
            {filteredOpps.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </View>
        )
      )}

      <ProgressDots current={5} />
    </Screen>
  );
};
