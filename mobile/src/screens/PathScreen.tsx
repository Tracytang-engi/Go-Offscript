import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { NovaBubble } from '../components/nova/NovaBubble';
import { SwipeCard } from '../components/ui/SwipeCard';
import { ProgressDots } from '../components/ui/ProgressDots';
import { Colors } from '../constants/colors';
import { useOnboardingStore } from '../lib/store/onboarding.store';
import { pathApi } from '../lib/api/onboarding.api';
import type { CareerPath, PathScore } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Path'>;
};

export const PathScreen = ({ navigation }: Props) => {
  const { setCareerPath, setLikedPaths, selectedValues, skills, connectedPlatforms, chatSummary } = useOnboardingStore();

  const [path, setPath] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Swipe state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedTitles, setLikedTitles] = useState<string[]>([]);
  const [allDone, setAllDone] = useState(false);

  const runAnalysis = () => {
    setLoading(true);
    setPath(null);
    setErrorMsg(null);
    setCurrentIndex(0);
    setLikedTitles([]);
    setAllDone(false);

    pathApi.generate({
      skills,
      values: selectedValues,
      socialSignals: connectedPlatforms.map((p) => ({ platform: p })),
      chatSummary: chatSummary || undefined,
    }).then((result) => {
      setPath(result.path);
      setCareerPath(result.path);
      if (!result.isReal && result.errorMessage) setErrorMsg(result.errorMessage);
      setLoading(false);
    });
  };

  useEffect(() => { runAnalysis(); }, []);

  const cards: PathScore[] = path?.pathScores ?? [];

  const handleSwipeRight = (card: PathScore) => {
    const newLiked = [...likedTitles, card.pathTitle];
    setLikedTitles(newLiked);
    advance(newLiked);
  };

  const handleSwipeLeft = () => {
    advance(likedTitles);
  };

  const advance = (liked: string[]) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= cards.length) {
      setLikedPaths(liked);
      setAllDone(true);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
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
            nova is finding your paths...
          </Text>
          <Text style={{
            fontSize: 13, color: Colors.muted,
            marginTop: 8, textAlign: 'center', paddingHorizontal: 40,
          }}>
            pulling together your skills, values and everything you shared
          </Text>
        </View>
      </Screen>
    );
  }

  if (!path) return null;

  // ── All cards done ────────────────────────────────────────────────────────
  if (allDone) {
    const likedCount = likedTitles.length;
    return (
      <Screen>
        <NovaBubble
          message={
            likedCount === 0
              ? "no worries — i'll show you a range of options so you can explore 🌿"
              : `loved your choices! let's find everything you need to break into ${likedTitles.join(' and ')} 🎯`
          }
          subtitle="online"
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>✦</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.dark, textAlign: 'center', marginBottom: 8 }}>
            {likedCount > 0 ? "nice — you've got taste 🧡" : "let's explore together"}
          </Text>
          <Text style={{ fontSize: 14, color: Colors.muted, textAlign: 'center', paddingHorizontal: 32 }}>
            {likedCount > 0
              ? `you liked ${likedCount} path${likedCount > 1 ? 's' : ''} — tap below to see real opportunities and mentors`
              : "let me show you what's out there for your profile"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('WaysIn')}
          style={{
            backgroundColor: Colors.orange,
            borderRadius: 999, paddingVertical: 18,
            alignItems: 'center', marginBottom: 16,
          }}
        >
          <Text style={{ color: Colors.white, fontSize: 16, fontWeight: '700' }}>
            close the gap →
          </Text>
        </TouchableOpacity>
        <ProgressDots current={5} />
      </Screen>
    );
  }

  // ── Swipe cards ───────────────────────────────────────────────────────────
  const currentCard = cards[currentIndex];

  return (
    <Screen scrollable={false}>
      {/* Offline notice */}
      {errorMsg && (
        <View style={{
          backgroundColor: '#FFF3CD', borderRadius: 12,
          padding: 10, marginBottom: 10,
          flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        }}>
          <Text style={{ fontSize: 14 }}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: '#856404', lineHeight: 18 }}>{errorMsg}</Text>
            <TouchableOpacity onPress={runAnalysis} style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 12, color: Colors.orange, fontWeight: '700' }}>try again →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Nova intro bubble */}
      <NovaBubble
        message={path.explanation || "here are some possible paths i found for you based on your skills, values and everything you shared 🎯"}
        subtitle="online"
      />

      {/* Card counter */}
      <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 12, textAlign: 'center' }}>
        path {currentIndex + 1} of {cards.length}
      </Text>

      {/* Swipe card */}
      <View style={{ flex: 1, paddingLeft: 32 }}>
        {currentCard && (
          <SwipeCard
            key={currentCard.id}
            score={currentCard}
            cardIndex={currentIndex}
            totalCards={cards.length}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={() => handleSwipeRight(currentCard)}
          />
        )}
      </View>

      <ProgressDots current={5} />
    </Screen>
  );
};
