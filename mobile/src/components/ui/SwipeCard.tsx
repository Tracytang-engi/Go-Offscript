import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Colors } from '../../constants/colors';
import type { PathScore } from '../../types';

const WIN_W = Dimensions.get('window').width;

interface SwipeCardProps {
  score: PathScore;
  cardIndex: number;
  totalCards: number;
  /** all decisions so dots can reflect per-card status */
  decisions: Record<number, 'like' | 'skip'>;
  /** padding at bottom of scroll so content isn't hidden by the fixed bar */
  bottomPadding: number;
}

export const SwipeCard = ({
  score, cardIndex, totalCards, decisions, bottomPadding,
}: SwipeCardProps) => {
  const decision = decisions[cardIndex];

  const matchColor =
    score.matchScore >= 80 ? Colors.orange :
    score.matchScore >= 60 ? Colors.orangeMuted : Colors.muted;

  const dotColor = (i: number) => {
    if (i === cardIndex) return Colors.orange;
    if (decisions[i] === 'like') return '#059669';
    if (decisions[i] === 'skip') return '#EF4444';
    return Colors.border;
  };

  return (
    <View style={{ width: WIN_W }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: bottomPadding,
          paddingHorizontal: 20,
        }}
      >
        {/* Card */}
        <View style={{
          backgroundColor: Colors.white,
          borderRadius: 24,
          borderWidth: 2,
          borderColor:
            decision === 'like'  ? '#059669' :
            decision === 'skip'  ? '#EF4444' : 'transparent',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 5,
          flexDirection: 'row',
        }}>

          {/* ── Left: dot indicators ── */}
          <View style={{
            width: 28,
            paddingVertical: 24,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            {Array.from({ length: totalCards }).map((_, i) => (
              <View key={i} style={{
                width: i === cardIndex ? 10 : 7,
                height: i === cardIndex ? 10 : 7,
                borderRadius: 99,
                backgroundColor: dotColor(i),
              }} />
            ))}
          </View>

          {/* ── Right: content ── */}
          <View style={{ flex: 1, paddingTop: 20, paddingBottom: 24, paddingRight: 20 }}>

            {/* Decision badge */}
            {decision && (
              <View style={{
                position: 'absolute', top: 16, right: 0,
                width: 30, height: 30, borderRadius: 15,
                backgroundColor: decision === 'like' ? '#059669' : '#EF4444',
                alignItems: 'center', justifyContent: 'center', zIndex: 5,
              }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>
                  {decision === 'like' ? '✓' : '✕'}
                </Text>
              </View>
            )}

            {/* Match + label */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 12,
              paddingRight: decision ? 36 : 0,
            }}>
              {score.label ? (
                <View style={{
                  backgroundColor: Colors.orangeLight,
                  borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3,
                }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.orange }}>
                    {score.label}
                  </Text>
                </View>
              ) : <View />}

              <View style={{
                backgroundColor: matchColor + '22',
                borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4,
              }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: matchColor }}>
                  {score.matchScore}% match
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text style={{
              fontSize: 21, fontWeight: '800', color: Colors.dark,
              lineHeight: 27, marginBottom: 10,
            }}>
              {score.pathTitle}
            </Text>

            {/* Description — no truncation, card scrolls if needed */}
            {score.description ? (
              <Text style={{
                fontSize: 13, color: Colors.muted, lineHeight: 20, marginBottom: 16,
              }}>
                {score.description}
              </Text>
            ) : null}

            {/* Skills already have */}
            {(score.skillsAlreadyHave ?? []).length > 0 && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{
                  fontSize: 10, fontWeight: '700', color: '#059669',
                  textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
                }}>
                  already have
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
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

            {/* Skills to develop */}
            {(score.skillsGap ?? []).length > 0 && (
              <View>
                <Text style={{
                  fontSize: 10, fontWeight: '700', color: Colors.muted,
                  textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
                }}>
                  to develop
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
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
        </View>
      </ScrollView>
    </View>
  );
};
