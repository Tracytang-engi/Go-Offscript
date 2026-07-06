import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import type { CareerPath } from '../../types';

interface Props {
  visible: boolean;
  careerPath: CareerPath | null;
  likedPaths: string[];
  onClose: () => void;
  onReplan: () => void;
}

export const MyPathModal = ({
  visible,
  careerPath,
  likedPaths,
  onClose,
  onReplan,
}: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
        <View
          style={{
            backgroundColor: Colors.cream,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '90%',
            paddingTop: 8,
          }}
        >
          {/* Drag handle */}
          <View style={{ alignItems: 'center', paddingBottom: 12 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border }} />
          </View>

          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.dark }}>
              🗺️ my path
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text style={{ fontSize: 22, color: Colors.muted }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 100,
            }}
          >
            {!careerPath ? (
              <Text style={{ color: Colors.muted, textAlign: 'center', marginTop: 40, fontStyle: 'italic' }}>
                no path generated yet — complete the onboarding to see your paths here
              </Text>
            ) : (
              <>
                {/* Nova explanation */}
                <View style={{
                  backgroundColor: Colors.white,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                  borderLeftWidth: 3,
                  borderLeftColor: Colors.orange,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <View style={{
                      width: 26, height: 26, borderRadius: 13,
                      backgroundColor: Colors.orangeLight,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 12 }}>✦</Text>
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.orange }}>
                      Nova's read on you
                    </Text>
                  </View>
                  <Text style={{ fontSize: 14, color: Colors.dark, lineHeight: 21 }}>
                    {careerPath.explanation}
                  </Text>
                </View>

                {/* Path cards */}
                {careerPath.pathScores.map((score, idx) => {
                  const isLiked = likedPaths.includes(score.pathTitle);
                  const isSkipped = !isLiked;

                  return (
                    <View
                      key={score.id}
                      style={{
                        backgroundColor: Colors.white,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 14,
                        borderWidth: isLiked ? 2 : 1,
                        borderColor: isLiked ? Colors.orange : Colors.border,
                        opacity: isSkipped ? 0.65 : 1,
                      }}
                    >
                      {/* Title row */}
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                        gap: 8,
                      }}>
                        <Text style={{
                          flex: 1,
                          fontSize: 16,
                          fontWeight: '800',
                          color: Colors.dark,
                          lineHeight: 22,
                        }}>
                          {score.pathTitle}
                        </Text>

                        {/* Liked / skipped badge */}
                        <View style={{
                          backgroundColor: isLiked ? Colors.orange : Colors.border,
                          borderRadius: 999,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          flexShrink: 0,
                        }}>
                          <Text style={{
                            fontSize: 11,
                            fontWeight: '700',
                            color: isLiked ? Colors.white : Colors.muted,
                          }}>
                            {isLiked ? '✓ liked' : '✕ skipped'}
                          </Text>
                        </View>
                      </View>

                      {/* Match score */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.orange }}>
                          {score.matchScore}%
                        </Text>
                        <Text style={{ fontSize: 12, color: Colors.muted }}>match</Text>
                        {score.label && (
                          <View style={{
                            backgroundColor: Colors.orangeLight,
                            borderRadius: 999,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                          }}>
                            <Text style={{ fontSize: 11, color: Colors.orange, fontWeight: '600' }}>
                              {score.label}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Description */}
                      {score.description && (
                        <Text style={{
                          fontSize: 13,
                          color: Colors.dark,
                          lineHeight: 19,
                          marginBottom: 12,
                        }}>
                          {score.description}
                        </Text>
                      )}

                      {/* Skills you have */}
                      {score.skillsAlreadyHave && score.skillsAlreadyHave.length > 0 && (
                        <View style={{ marginBottom: 10 }}>
                          <Text style={{ fontSize: 11, color: Colors.muted, fontWeight: '700', marginBottom: 6 }}>
                            SKILLS YOU HAVE
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            {score.skillsAlreadyHave.map((s) => (
                              <View key={s} style={{
                                backgroundColor: '#D1FAE5',
                                borderRadius: 999,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                              }}>
                                <Text style={{ fontSize: 11, color: '#065F46', fontWeight: '600' }}>
                                  ✓ {s}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Skills gap */}
                      {score.skillsGap && score.skillsGap.length > 0 && (
                        <View>
                          <Text style={{ fontSize: 11, color: Colors.muted, fontWeight: '700', marginBottom: 6 }}>
                            SKILLS TO BUILD
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            {score.skillsGap.map((s) => (
                              <View key={s} style={{
                                backgroundColor: Colors.orangeLight,
                                borderRadius: 999,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                              }}>
                                <Text style={{ fontSize: 11, color: Colors.orange, fontWeight: '600' }}>
                                  + {s}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}

                {/* Tension note */}
                {careerPath.tensionNote && (
                  <View style={{
                    backgroundColor: Colors.amber,
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 8,
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#92400E', marginBottom: 4 }}>
                      ⚡ tension to navigate
                    </Text>
                    <Text style={{ fontSize: 13, color: '#78350F', lineHeight: 19 }}>
                      {careerPath.tensionNote}
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Floating Re-plan button */}
          <View style={{
            position: 'absolute',
            bottom: insets.bottom + 20,
            left: 20,
            right: 20,
          }}>
            <TouchableOpacity
              onPress={onReplan}
              style={{
                backgroundColor: Colors.orange,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                shadowColor: Colors.orange,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.white, letterSpacing: 0.3 }}>
                re-plan my path →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
