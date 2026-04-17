import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, Dimensions, ActivityIndicator,
  TouchableOpacity, Animated, PanResponder,
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

const { height: WIN_H } = Dimensions.get('window');

// Nova covers most of the screen; cards peek from bottom
const PEEK_H = 150;
const NOVA_H  = WIN_H - PEEK_H;

export const PathScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const {
    setCareerPath, setLikedPaths,
    selectedValues, skills, connectedPlatforms, chatSummary,
  } = useOnboardingStore();

  const [path, setPath]         = useState<CareerPath | null>(null);
  const [loading, setLoading]   = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Nova overlay state
  const [novaVisible, setNovaVisible] = useState(true);
  const novaY = useRef(new Animated.Value(0)).current;

  // Which card is in view (updated by FlatList)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Per-card decisions: 'like' | 'skip'
  const [decisions, setDecisions] = useState<Record<number, 'like' | 'skip'>>({});

  const listRef = useRef<FlatList>(null);

  // Bottom bar height: dots (28) + ctg/hint (48) + buttons (64) + gaps (24) + safe (insets.bottom)
  const BOTTOM_BAR_H = 164 + insets.bottom;

  // ── Load paths ──────────────────────────────────────────────────────────────
  const runAnalysis = () => {
    setLoading(true);
    setPath(null);
    setErrorMsg(null);
    setDecisions({});
    setNovaVisible(true);
    setCurrentIndex(0);
    novaY.setValue(0);

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

  // ── Dismiss Nova (upward swipe) ──────────────────────────────────────────────
  const dismissNova = () => {
    Animated.timing(novaY, {
      toValue: -WIN_H,
      duration: 350,
      useNativeDriver: true,
    }).start(() => setNovaVisible(false));
  };

  const novaPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dy) > Math.abs(gs.dx) && gs.dy < 0,
      onPanResponderMove: (_, gs) => {
        if (gs.dy < 0) novaY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy < -60 || gs.vy < -0.5) {
          dismissNova();
        } else {
          Animated.spring(novaY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  // ── Per-card decision ────────────────────────────────────────────────────────
  const handleDecision = (index: number, decision: 'like' | 'skip') => {
    setDecisions((prev) => ({ ...prev, [index]: decision }));
  };

  const anyLiked = Object.values(decisions).includes('like');

  const handleConfirm = () => {
    const likedTitles = cards
      .filter((_, i) => decisions[i] === 'like')
      .map((c) => c.pathTitle);
    setLikedPaths(likedTitles);
    navigation.navigate('WaysIn');
  };

  // Track current card from FlatList scroll
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      const idx = viewableItems[0]?.index;
      if (idx != null) setCurrentIndex(idx);
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={{
        flex: 1, backgroundColor: Colors.cream,
        alignItems: 'center', justifyContent: 'center',
      }}>
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
      </SafeAreaView>
    );
  }

  if (!path) return null;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.cream }}>

      {/* Offline warning */}
      {errorMsg && (
        <View style={{
          backgroundColor: '#FFF3CD',
          paddingHorizontal: 16, paddingVertical: 8,
          flexDirection: 'row', alignItems: 'center', gap: 8,
        }}>
          <Text style={{ fontSize: 11 }}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: '#856404', lineHeight: 16 }}>{errorMsg}</Text>
            <TouchableOpacity onPress={runAnalysis}>
              <Text style={{ fontSize: 11, color: Colors.orange, fontWeight: '700', marginTop: 2 }}>
                try again →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Horizontal card pager (behind Nova, always mounted) ── */}
      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        data={cards}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={{ flex: 1 }}
        renderItem={({ item, index }) => (
          <SwipeCard
            score={item}
            cardIndex={index}
            totalCards={cards.length}
            decisions={decisions}
            bottomPadding={BOTTOM_BAR_H + 16}
          />
        )}
      />

      {/* ── Nova overlay — slides off upward when dismissed ── */}
      {novaVisible && (
        <Animated.View
          {...novaPan.panHandlers}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: NOVA_H,
            backgroundColor: Colors.cream,
            transform: [{ translateY: novaY }],
            zIndex: 20,
            paddingHorizontal: 20,
            paddingTop: insets.top + 12,
            justifyContent: 'center',
          }}
        >
          <NovaBubble
            message={
              path.explanation ||
              "here are some possible paths i found for you, based on your skills, values and everything you shared 🎯"
            }
            subtitle="online"
          />
          <TouchableOpacity
            onPress={dismissNova}
            style={{ marginTop: 24, alignItems: 'center' }}
          >
            <Text style={{ color: Colors.muted, fontSize: 13, letterSpacing: 0.3 }}>
              ↑ swipe up to see your paths
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── Fixed bottom bar: dots + close-the-gap/hint + X/✓ ── */}
      <View style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: Colors.cream,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: 10,
        paddingBottom: insets.bottom + 10,
        paddingHorizontal: 24,
      }}>
        {/* Dots row — reflects per-card status */}
        <View style={{
          flexDirection: 'row', justifyContent: 'center',
          alignItems: 'center', gap: 8, marginBottom: 10,
        }}>
          {cards.map((_, i) => {
            const isDot   = i === currentIndex;
            const isLiked = decisions[i] === 'like';
            const isSkip  = decisions[i] === 'skip';
            return (
              <View key={i} style={{
                width:  isDot ? 10 : 7,
                height: isDot ? 10 : 7,
                borderRadius: 99,
                backgroundColor:
                  isDot   ? Colors.orange :
                  isLiked ? '#059669'     :
                  isSkip  ? '#EF4444'     : Colors.border,
              }} />
            );
          })}
        </View>

        {/* "Close the gap" button OR hint text */}
        {anyLiked ? (
          <TouchableOpacity
            onPress={handleConfirm}
            style={{
              backgroundColor: Colors.orange,
              borderRadius: 999, paddingVertical: 13,
              alignItems: 'center', marginBottom: 10,
            }}
          >
            <Text style={{ color: Colors.white, fontSize: 15, fontWeight: '700' }}>
              close the gap →
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={{
            textAlign: 'center', fontSize: 11, color: Colors.muted,
            marginBottom: 10,
          }}>
            swipe left · right to browse · tap to choose
          </Text>
        )}

        {/* X / ✓ buttons */}
        <View style={{
          flexDirection: 'row', justifyContent: 'center',
          alignItems: 'center', gap: 44,
        }}>
          {/* Skip */}
          <TouchableOpacity
            onPress={() => handleDecision(currentIndex, 'skip')}
            style={{
              width: 60, height: 60, borderRadius: 30,
              backgroundColor: decisions[currentIndex] === 'skip' ? '#EF4444' : '#FEE2E2',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#EF4444',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
            }}
          >
            <Text style={{
              fontSize: 24,
              color: decisions[currentIndex] === 'skip' ? '#fff' : '#EF4444',
            }}>✕</Text>
          </TouchableOpacity>

          {/* Like */}
          <TouchableOpacity
            onPress={() => handleDecision(currentIndex, 'like')}
            style={{
              width: 60, height: 60, borderRadius: 30,
              backgroundColor: decisions[currentIndex] === 'like' ? '#059669' : '#D1FAE5',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#059669',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
            }}
          >
            <Text style={{
              fontSize: 24,
              color: decisions[currentIndex] === 'like' ? '#fff' : '#059669',
            }}>✓</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
};
