import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, Dimensions, ActivityIndicator,
  TouchableOpacity, NativeScrollEvent, NativeSyntheticEvent, Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { NovaBubble } from '../components/nova/NovaBubble';
import { SwipeCard } from '../components/ui/SwipeCard';
import { Colors } from '../constants/colors';
import { useOnboardingStore } from '../lib/store/onboarding.store';
import { pathApi } from '../lib/api/onboarding.api';
import type { CareerPath, PathScore } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Path'>;
};

const WIN_H = Dimensions.get('window').height;
// Nova section occupies most of the screen; first card peeks ~130px from below
const NOVA_H = Math.floor(WIN_H * 0.74);
const CARD_H = WIN_H;

export const PathScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { setCareerPath, setLikedPaths, selectedValues, skills, connectedPlatforms, chatSummary } = useOnboardingStore();

  const [path, setPath]       = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Per-card decisions (can be re-set before confirm)
  const [decisions, setDecisions] = useState<Record<number, 'like' | 'skip'>>({});
  // Which card section is currently visible (-1 = Nova section)
  const [visibleIndex, setVisibleIndex] = useState(-1);

  // Close-the-gap fade-in
  const ctgOpacity = useRef(new Animated.Value(0)).current;

  const cards: PathScore[] = path?.pathScores ?? [];

  const snapOffsets = [
    0,
    ...cards.map((_, i) => NOVA_H + i * CARD_H),
  ];

  // ── Load paths ────────────────────────────────────────────────────────────
  const runAnalysis = () => {
    setLoading(true);
    setPath(null);
    setErrorMsg(null);
    setDecisions({});
    setVisibleIndex(-1);

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

  // ── Decision handlers ─────────────────────────────────────────────────────
  const handleDecision = (index: number, decision: 'like' | 'skip') => {
    setDecisions((prev) => ({ ...prev, [index]: decision }));
  };

  // ── Show "close the gap" when at least one card is liked ─────────────────
  const anyLiked = Object.values(decisions).includes('like');

  useEffect(() => {
    Animated.timing(ctgOpacity, {
      toValue: anyLiked ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [anyLiked]);

  // ── Confirm ───────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    const likedTitles = cards
      .filter((_, i) => decisions[i] === 'like')
      .map((c) => c.pathTitle);
    setLikedPaths(likedTitles);
    navigation.navigate('WaysIn');
  };

  // ── Scroll tracking for dot indicator ────────────────────────────────────
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y < NOVA_H * 0.5) {
      setVisibleIndex(-1);
    } else {
      const idx = Math.min(
        Math.round((y - NOVA_H) / CARD_H),
        cards.length - 1,
      );
      setVisibleIndex(Math.max(idx, 0));
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 36, marginBottom: 20 }}>✦</Text>
        <ActivityIndicator color={Colors.orange} size="large" />
        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.dark, marginTop: 24, textAlign: 'center' }}>
          nova is finding your paths...
        </Text>
        <Text style={{ fontSize: 13, color: Colors.muted, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
          pulling together your skills, values and everything you shared
        </Text>
      </SafeAreaView>
    );
  }

  if (!path) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.cream }}>
      {/* ── Offline warning ── */}
      {errorMsg && (
        <View style={{
          backgroundColor: '#FFF3CD', paddingHorizontal: 16, paddingVertical: 10,
          flexDirection: 'row', alignItems: 'center', gap: 8,
        }}>
          <Text style={{ fontSize: 12 }}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: '#856404', lineHeight: 16 }}>{errorMsg}</Text>
            <TouchableOpacity onPress={runAnalysis} style={{ marginTop: 2 }}>
              <Text style={{ fontSize: 11, color: Colors.orange, fontWeight: '700' }}>try again →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Vertical scroll with snap ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToOffsets={snapOffsets}
        snapToAlignment="start"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* Nova section — fills ~74% of screen, first card peeks below */}
        <View style={{
          height: NOVA_H,
          paddingHorizontal: 20,
          paddingTop: 20,
          justifyContent: 'center',
        }}>
          <NovaBubble
            message={path.explanation || "here are some possible paths i found for you, based on your skills, values and everything you shared 🎯"}
            subtitle="online"
          />
          <Text style={{
            textAlign: 'center', fontSize: 12, color: Colors.muted,
            marginTop: 24, letterSpacing: 0.3,
          }}>
            scroll down to see your paths ↓
          </Text>
        </View>

        {/* Card sections */}
        {cards.map((card, i) => (
          <View
            key={card.id}
            style={{
              height: CARD_H,
              paddingLeft: 40,  // leave room for left-side dots
              paddingRight: 20,
              paddingTop: 24,
              paddingBottom: 24,
            }}
          >
            <SwipeCard
              score={card}
              index={i}
              totalCards={cards.length}
              decision={decisions[i]}
              onLike={() => handleDecision(i, 'like')}
              onSkip={() => handleDecision(i, 'skip')}
            />
          </View>
        ))}
      </ScrollView>

      {/* ── "Close the gap" floating button ── */}
      <Animated.View
        pointerEvents={anyLiked ? 'auto' : 'none'}
        style={{
          position: 'absolute',
          bottom: insets.bottom + 24,
          left: 24, right: 24,
          opacity: ctgOpacity,
        }}
      >
        <TouchableOpacity
          onPress={handleConfirm}
          style={{
            backgroundColor: Colors.orange,
            borderRadius: 999, paddingVertical: 18,
            alignItems: 'center',
            shadowColor: Colors.orange,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
          }}
        >
          <Text style={{ color: Colors.white, fontSize: 16, fontWeight: '700' }}>
            close the gap →
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};
