import React, { useRef } from 'react';
import {
  View, Text, Animated, PanResponder, Dimensions,
} from 'react-native';
import { Colors } from '../../constants/colors';
import type { PathScore } from '../../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 90;

interface SwipeCardProps {
  score: PathScore;
  cardIndex: number;       // 0-based index of this card in the stack
  totalCards: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export const SwipeCard = ({ score, cardIndex, totalCards, onSwipeLeft, onSwipeRight }: SwipeCardProps) => {
  const position = useRef(new Animated.ValueXY()).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-6deg', '0deg', '6deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD / 2],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD / 2, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_evt, gestureState) => {
      position.setValue({ x: gestureState.dx, y: gestureState.dy });
    },
    onPanResponderRelease: (_evt, gestureState) => {
      if (gestureState.dx > SWIPE_THRESHOLD) {
        swipeRight();
      } else if (gestureState.dx < -SWIPE_THRESHOLD) {
        swipeLeft();
      } else {
        Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      }
    },
  })).current;

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH * 1.5, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(onSwipeLeft);
  };

  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH * 1.5, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(onSwipeRight);
  };

  const matchColor =
    score.matchScore >= 80 ? Colors.orange :
    score.matchScore >= 60 ? Colors.orangeMuted : Colors.muted;

  return (
    <View style={{ flex: 1 }}>
      {/* Dot indicators — left side */}
      <View style={{
        position: 'absolute', left: -28, top: '40%',
        flexDirection: 'column', gap: 6, alignItems: 'center',
      }}>
        {Array.from({ length: totalCards }).map((_, i) => (
          <View
            key={i}
            style={{
              width: i === cardIndex ? 8 : 6,
              height: i === cardIndex ? 8 : 6,
              borderRadius: 4,
              backgroundColor: i === cardIndex ? Colors.orange : Colors.border,
            }}
          />
        ))}
      </View>

      {/* Swipeable card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
          flex: 1,
        }}
      >
        <View style={{
          backgroundColor: Colors.white,
          borderRadius: 24,
          padding: 24,
          flex: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.10,
          shadowRadius: 12,
          elevation: 6,
        }}>
          {/* Like / Nope overlays */}
          <Animated.View style={{
            position: 'absolute', top: 24, right: 24,
            backgroundColor: Colors.orange,
            borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6,
            opacity: likeOpacity, zIndex: 10,
            transform: [{ rotate: '10deg' }],
          }}>
            <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '800' }}>YES ✓</Text>
          </Animated.View>
          <Animated.View style={{
            position: 'absolute', top: 24, left: 24,
            backgroundColor: '#EF4444',
            borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6,
            opacity: nopeOpacity, zIndex: 10,
            transform: [{ rotate: '-10deg' }],
          }}>
            <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '800' }}>NOPE ✕</Text>
          </Animated.View>

          {/* Match score badge */}
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 16,
          }}>
            {score.label ? (
              <View style={{
                backgroundColor: Colors.orangeLight,
                borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4,
              }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.orange }}>
                  {score.label}
                </Text>
              </View>
            ) : <View />}
            <View style={{
              backgroundColor: matchColor + '20',
              borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6,
            }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: matchColor }}>
                {score.matchScore}% match
              </Text>
            </View>
          </View>

          {/* Job title */}
          <Text style={{
            fontSize: 24, fontWeight: '800', color: Colors.dark,
            lineHeight: 30, marginBottom: 12,
          }}>
            {score.pathTitle}
          </Text>

          {/* Why recommended */}
          {score.description ? (
            <Text style={{
              fontSize: 14, color: Colors.dark, lineHeight: 21,
              marginBottom: 20, opacity: 0.8,
            }}>
              {score.description}
            </Text>
          ) : null}

          {/* Skills already have */}
          {(score.skillsAlreadyHave ?? []).length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#059669', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                skills you already have
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {(score.skillsAlreadyHave ?? []).map((s) => (
                  <View key={s} style={{
                    backgroundColor: '#D1FAE5', borderRadius: 999,
                    paddingHorizontal: 10, paddingVertical: 4,
                  }}>
                    <Text style={{ fontSize: 12, color: '#065F46', fontWeight: '600' }}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Skills gap */}
          {(score.skillsGap ?? []).length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                skills to develop
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {(score.skillsGap ?? []).map((s) => (
                  <View key={s} style={{
                    backgroundColor: Colors.cream, borderRadius: 999,
                    paddingHorizontal: 10, paddingVertical: 4,
                    borderWidth: 1, borderColor: Colors.border,
                  }}>
                    <Text style={{ fontSize: 12, color: Colors.muted, fontWeight: '600' }}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Action buttons */}
      <View style={{
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        gap: 40, marginTop: 20,
      }}>
        {/* Dislike — X */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Animated.View style={{ transform: [{ scale: nopeOpacity.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }] }}>
            <View
              onTouchEnd={swipeLeft}
              style={{
                width: 60, height: 60, borderRadius: 30,
                backgroundColor: '#FEE2E2',
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#EF4444', shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
              }}
            >
              <Text style={{ fontSize: 26, color: '#EF4444' }}>✕</Text>
            </View>
          </Animated.View>
        </View>

        {/* Like — checkmark */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Animated.View style={{ transform: [{ scale: likeOpacity.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }] }}>
            <View
              onTouchEnd={swipeRight}
              style={{
                width: 60, height: 60, borderRadius: 30,
                backgroundColor: '#D1FAE5',
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#059669', shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
              }}
            >
              <Text style={{ fontSize: 26, color: '#059669' }}>✓</Text>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Hint text */}
      <Text style={{
        textAlign: 'center', fontSize: 11, color: Colors.muted,
        marginTop: 8,
      }}>
        swipe right to like · swipe left to skip
      </Text>
    </View>
  );
};
