import React, { useEffect, useRef, useState } from 'react';
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
import { searchOpportunities, mentorApi } from '../lib/api/onboarding.api';
import type { Opportunity, Mentor } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WaysIn'>;
};

// Content type filter
type ContentType = 'all' | 'jobs' | 'projects' | 'events' | 'mentors';

const CONTENT_FILTERS: { key: ContentType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'projects', label: 'Projects' },
  { key: 'events', label: 'In-person' },
  { key: 'mentors', label: 'Mentors' },
];

const CONTENT_OPP_TYPES: Record<ContentType, string[]> = {
  all: ['INTERNSHIP', 'FELLOWSHIP', 'SHORT_PROJECT', 'COACHING', 'MEETUP'],
  jobs: ['INTERNSHIP', 'FELLOWSHIP'],
  projects: ['SHORT_PROJECT'],
  events: ['MEETUP', 'COACHING'],
  mentors: [],
};

export const WaysInScreen = ({ navigation: _navigation }: Props) => {
  const { likedPaths, setOpportunities } = useOnboardingStore();

  // Layer 1: which career is selected ('' = all)
  const [selectedCareer, setSelectedCareer] = useState<string>('all');
  // Layer 2: content type
  const [contentType, setContentType] = useState<ContentType>('all');

  // Data
  const [allOpps, setAllOpps] = useState<Opportunity[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);

  // Loading per career selection
  const [oppsLoading, setOppsLoading] = useState(true);
  const [mentorsLoading, setMentorsLoading] = useState(false);
  const [oppsIsReal, setOppsIsReal] = useState(false);
  const [mentorsIsReal, setMentorsIsReal] = useState(false);

  // Track which careers we've already fetched mentors for
  const fetchedMentorCareers = useRef<Set<string>>(new Set());

  // Career chips from liked paths
  const careerChips = ['all', ...likedPaths];

  // Fetch opportunities when selectedCareer changes
  const fetchOpps = async (career: string) => {
    setOppsLoading(true);
    const target = career === 'all' ? undefined : career;
    const result = await searchOpportunities(target);
    setAllOpps(result.opportunities);
    setOpportunities(result.opportunities);
    setOppsIsReal(result.isReal);
    setOppsLoading(false);
  };

  // Fetch mentors lazily (only when mentors tab selected, once per career)
  const fetchMentors = async (career: string) => {
    const key = career;
    if (fetchedMentorCareers.current.has(key)) return;
    fetchedMentorCareers.current.add(key);
    setMentorsLoading(true);
    const target = career === 'all' ? undefined : career;
    const result = await mentorApi.search(target);
    setMentors(result.mentors);
    setMentorsIsReal(result.isReal);
    setMentorsLoading(false);
  };

  useEffect(() => { fetchOpps('all'); }, []);

  const handleCareerSelect = (career: string) => {
    setSelectedCareer(career);
    setContentType('all');
    fetchOpps(career);
    fetchedMentorCareers.current.clear(); // reset mentor cache on career change
  };

  const handleContentType = (type: ContentType) => {
    setContentType(type);
    if (type === 'mentors' && !fetchedMentorCareers.current.has(selectedCareer)) {
      fetchMentors(selectedCareer);
    }
  };

  // Filter opps by content type
  const filteredOpps = allOpps.filter((o) => {
    const types = CONTENT_OPP_TYPES[contentType];
    return types.includes(o.type);
  });

  const showMentors = contentType === 'mentors';
  const isLoading = showMentors ? mentorsLoading : oppsLoading;

  const novaMessage = selectedCareer === 'all'
    ? "okay bestie — here's what's out there for your paths 🍫✨ tap a career above to narrow it down"
    : `here's everything i found for **${selectedCareer}** — real, live results 🎯`;

  return (
    <Screen>
      <NovaBubble message={novaMessage} subtitle={oppsIsReal ? 'live search ✦' : 'online'} />

      {/* Layer 1 — Career filter (from liked paths) */}
      {careerChips.length > 1 && (
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10 }}
          contentContainerStyle={{ gap: 8, paddingRight: 8 }}
        >
          {careerChips.map((career) => (
            <TouchableOpacity
              key={career}
              onPress={() => handleCareerSelect(career)}
              style={{
                backgroundColor: selectedCareer === career ? Colors.dark : Colors.white,
                borderRadius: 999, borderWidth: 1,
                borderColor: selectedCareer === career ? Colors.dark : Colors.border,
                paddingHorizontal: 14, paddingVertical: 7,
              }}
            >
              <Text style={{
                color: selectedCareer === career ? Colors.white : Colors.dark,
                fontSize: 13, fontWeight: '600',
              }}>
                {career === 'all' ? 'all paths' : career}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Layer 2 — Content type filter */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
      >
        {CONTENT_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => handleContentType(f.key)}
            style={{
              backgroundColor: contentType === f.key ? Colors.orange : Colors.white,
              borderRadius: 999, borderWidth: 1,
              borderColor: contentType === f.key ? Colors.orange : Colors.border,
              paddingHorizontal: 16, paddingVertical: 8,
            }}
          >
            <Text style={{
              color: contentType === f.key ? Colors.white : Colors.dark,
              fontSize: 14, fontWeight: '600',
            }}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Real data badge */}
      {(showMentors ? mentorsIsReal : oppsIsReal) && (
        <View style={{
          backgroundColor: showMentors ? '#EEF2FF' : '#D1FAE5',
          borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
          marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6,
        }}>
          <Text style={{ fontSize: 12 }}>✦</Text>
          <Text style={{
            fontSize: 12, fontWeight: '600',
            color: showMentors ? '#4338CA' : '#065F46',
          }}>
            {showMentors
              ? 'nova searched LinkedIn for real mentors who match your path'
              : 'nova searched the web for real, current opportunities for you'}
          </Text>
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View style={{ alignItems: 'center', paddingTop: 40 }}>
          <ActivityIndicator color={Colors.orange} size="large" />
          <Text style={{ fontSize: 14, color: Colors.muted, marginTop: 16, textAlign: 'center' }}>
            {showMentors
              ? 'nova is finding mentors on LinkedIn...'
              : 'nova is searching for real opportunities...'}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.muted, marginTop: 4 }}>
            {selectedCareer !== 'all' ? `focused on ${selectedCareer}` : 'pulling live results'}
          </Text>
        </View>
      ) : showMentors ? (
        mentors.length === 0 ? (
          <Text style={{ color: Colors.muted, textAlign: 'center', marginTop: 40 }}>
            couldn't find mentors — try again later
          </Text>
        ) : (
          <View>
            {mentors.map((m) => <MentorCard key={m.id} mentor={m} />)}
          </View>
        )
      ) : filteredOpps.length === 0 ? (
        <Text style={{ color: Colors.muted, textAlign: 'center', marginTop: 40 }}>
          no results for this filter — try a different category
        </Text>
      ) : (
        <View>
          {filteredOpps.map((opp) => <OpportunityCard key={opp.id} opportunity={opp} />)}
        </View>
      )}

      <ProgressDots current={6} />
    </Screen>
  );
};
