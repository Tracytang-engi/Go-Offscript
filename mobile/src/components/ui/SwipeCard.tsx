import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import type { PathScore } from '../../types';

interface PathCardProps {
  score: PathScore;
  index: number;
  totalCards: number;
  decision: 'like' | 'skip' | undefined;
  onLike: () => void;
  onSkip: () => void;
}

export const SwipeCard = ({ score, index, totalCards, decision, onLike, onSkip }: PathCardProps) => {
  const matchColor =
    score.matchScore >= 80 ? Colors.orange :
    score.matchScore >= 60 ? Colors.orangeMuted : Colors.muted;

  const have = (score.skillsAlreadyHave ?? []).slice(0, 3);
  const gap  = (score.skillsGap ?? []).slice(0, 3);

  return (
    <View style={{ flex: 1 }}>
      {/* ── Dot indicators — left of card ── */}
      <View style={{
        position: 'absolute',
        left: -22,
        top: 0, bottom: 80,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
      }}>
        {Array.from({ length: totalCards }).map((_, i) => (
          <View key={i} style={{
            width: i === index ? 9 : 6,
            height: i === index ? 9 : 6,
            borderRadius: 99,
            backgroundColor: i === index ? Colors.orange : Colors.border,
          }} />
        ))}
      </View>

      {/* ── Card ── */}
      <View style={{
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 20,
        borderWidth: 2,
        borderColor:
          decision === 'like'  ? '#059669' :
          decision === 'skip'  ? '#EF4444' : 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
      }}>
        {/* Decision badge */}
        {decision && (
          <View style={{
            position: 'absolute', top: 16, right: 16, zIndex: 10,
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: decision === 'like' ? '#059669' : '#EF4444',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
              {decision === 'like' ? '✓' : '✕'}
            </Text>
          </View>
        )}

        {/* Top row: label + match */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          {score.label ? (
            <View style={{
              backgroundColor: Colors.orangeLight, borderRadius: 999,
              paddingHorizontal: 10, paddingVertical: 3,
            }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.orange }}>
                {score.label}
              </Text>
            </View>
          ) : <View />}
          <View style={{
            backgroundColor: matchColor + '22', borderRadius: 999,
            paddingHorizontal: 12, paddingVertical: 4,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: matchColor }}>
              {score.matchScore}% match
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={{
          fontSize: 22, fontWeight: '800', color: Colors.dark,
          lineHeight: 28, marginBottom: 8,
        }} numberOfLines={2}>
          {score.pathTitle}
        </Text>

        {/* Description */}
        {score.description ? (
          <Text style={{
            fontSize: 13, color: Colors.muted, lineHeight: 19,
            marginBottom: 16,
          }} numberOfLines={3}>
            {score.description}
          </Text>
        ) : null}

        {/* Skills — two columns */}
        <View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
          {/* Skills I have */}
          {have.length > 0 && (
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 10, fontWeight: '700', color: '#059669',
                textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
              }}>
                already have
              </Text>
              <View style={{ gap: 5 }}>
                {have.map((s) => (
                  <View key={s} style={{
                    backgroundColor: '#D1FAE5', borderRadius: 999,
                    paddingHorizontal: 10, paddingVertical: 4,
                  }}>
                    <Text style={{ fontSize: 11, color: '#065F46', fontWeight: '600' }} numberOfLines={1}>
                      {s}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Skills to develop */}
          {gap.length > 0 && (
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 10, fontWeight: '700', color: Colors.muted,
                textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
              }}>
                to develop
              </Text>
              <View style={{ gap: 5 }}>
                {gap.map((s) => (
                  <View key={s} style={{
                    backgroundColor: Colors.cream, borderRadius: 999,
                    paddingHorizontal: 10, paddingVertical: 4,
                    borderWidth: 1, borderColor: Colors.border,
                  }}>
                    <Text style={{ fontSize: 11, color: Colors.muted, fontWeight: '600' }} numberOfLines={1}>
                      {s}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* ── Action buttons ── */}
      <View style={{
        flexDirection: 'row', justifyContent: 'center',
        alignItems: 'center', gap: 44, marginTop: 14,
      }}>
        {/* Skip */}
        <TouchableOpacity
          onPress={onSkip}
          style={{
            width: 58, height: 58, borderRadius: 29,
            backgroundColor: decision === 'skip' ? '#EF4444' : '#FEE2E2',
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#EF4444', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: decision === 'skip' ? 0.4 : 0.15, shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 22, color: decision === 'skip' ? '#fff' : '#EF4444' }}>✕</Text>
        </TouchableOpacity>

        {/* Like */}
        <TouchableOpacity
          onPress={onLike}
          style={{
            width: 58, height: 58, borderRadius: 29,
            backgroundColor: decision === 'like' ? '#059669' : '#D1FAE5',
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#059669', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: decision === 'like' ? 0.4 : 0.15, shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 22, color: decision === 'like' ? '#fff' : '#059669' }}>✓</Text>
        </TouchableOpacity>
      </View>

      {/* Hint */}
      <Text style={{
        textAlign: 'center', fontSize: 11, color: Colors.border,
        marginTop: 8,
      }}>
        swipe up · tap to choose
      </Text>
    </View>
  );
};
