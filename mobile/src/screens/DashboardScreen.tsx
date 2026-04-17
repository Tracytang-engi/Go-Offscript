import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Colors } from '../constants/colors';
import { useAuthStore } from '../lib/store/auth.store';
import { useOnboardingStore } from '../lib/store/onboarding.store';
import type { Opportunity } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

const QUICK_BUTTONS = [
  { label: 'Profile', emoji: '👤' },
  { label: 'My Path', emoji: '🗺️' },
  { label: 'LinkedIn\nOutreach', emoji: '🔗' },
];

const TYPE_EMOJI: Record<string, string> = {
  INTERNSHIP: '💼',
  FELLOWSHIP: '🌱',
  SHORT_PROJECT: '🛠',
  COACHING: '💬',
  MEETUP: '📍',
};

export const DashboardScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { opportunities, savedOpportunityIds, completedOpportunityIds, markOppComplete } = useOnboardingStore();

  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  const savedOpps = opportunities.filter((o) => savedOpportunityIds.includes(o.id));
  const pendingOpps = savedOpps.filter((o) => !completedOpportunityIds.includes(o.id));
  const completedOpps = savedOpps.filter((o) => completedOpportunityIds.includes(o.id));

  const handleCheck = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    markOppComplete(id);
  };

  const handleApply = (url?: string | null) => {
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert('Could not open link'));
    } else {
      Alert.alert('No link available', 'This opportunity has no direct application link.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.cream }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingTop: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.dark }}>
            hey {user?.name?.split(' ')[0] ?? 'you'} ✦
          </Text>
          <Text style={{ fontSize: 13, color: Colors.muted, marginTop: 4 }}>
            here's your career dashboard
          </Text>
        </View>

        {/* 3 Quick Buttons */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
          {QUICK_BUTTONS.map((btn) => (
            <TouchableOpacity
              key={btn.label}
              onPress={() => Alert.alert('Coming soon', "we're building this for you ✨")}
              style={{
                flex: 1,
                backgroundColor: Colors.white,
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
                gap: 8,
                aspectRatio: 1,
              }}
            >
              <Text style={{ fontSize: 24 }}>{btn.emoji}</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.dark, textAlign: 'center' }}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Horizontal Saved List */}
        {savedOpps.length > 0 && (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 12 }}>
              saved opportunities
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={savedOpps}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedOpp(item)}
                  style={{
                    backgroundColor: Colors.white,
                    borderRadius: 14,
                    padding: 14,
                    width: 160,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                    elevation: 2,
                    borderWidth: completedOpportunityIds.includes(item.id) ? 1.5 : 0,
                    borderColor: completedOpportunityIds.includes(item.id) ? '#22C55E' : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 20, marginBottom: 6 }}>
                    {TYPE_EMOJI[item.type] ?? '📋'}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={{ fontSize: 13, fontWeight: '700', color: Colors.dark, marginBottom: 4 }}
                  >
                    {item.title}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 11, color: Colors.muted }}>
                    {item.organization}
                  </Text>
                  {completedOpportunityIds.includes(item.id) && (
                    <Text style={{ fontSize: 12, color: '#22C55E', marginTop: 4, fontWeight: '700' }}>
                      ✓ applied
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Pending Applications */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 12 }}>
            Pending Applications
          </Text>
          {pendingOpps.length === 0 ? (
            <Text style={{ fontSize: 13, color: Colors.muted, fontStyle: 'italic' }}>
              {savedOpps.length === 0
                ? 'save opportunities from Ways In to track them here ★'
                : 'all done — everything moved to completed!'}
            </Text>
          ) : (
            pendingOpps.map((opp) => (
              <View
                key={opp.id}
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: 14,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 1,
                }}
              >
                <TouchableOpacity
                  onPress={() => setSelectedOpp(opp)}
                  style={{ flex: 1 }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.dark }}>
                    {TYPE_EMOJI[opp.type] ?? '📋'} {opp.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: Colors.muted, marginTop: 2 }}>
                    {opp.organization}
                  </Text>
                </TouchableOpacity>

                {/* Checkbox */}
                <TouchableOpacity
                  onPress={() => handleCheck(opp.id)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: Colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 12,
                  }}
                >
                  <Text style={{ fontSize: 12, color: Colors.muted }}>□</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Completed Applications */}
        {completedOpps.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 12 }}>
              Completed Applications
            </Text>
            {completedOpps.map((opp) => (
              <View
                key={opp.id}
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: 14,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: 0.75,
                }}
              >
                <TouchableOpacity
                  onPress={() => setSelectedOpp(opp)}
                  style={{ flex: 1 }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.dark }}>
                    {TYPE_EMOJI[opp.type] ?? '📋'} {opp.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: Colors.muted, marginTop: 2 }}>
                    {opp.organization}
                  </Text>
                </TouchableOpacity>

                {/* Green checkmark */}
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    backgroundColor: '#22C55E',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 12,
                  }}
                >
                  <Text style={{ fontSize: 14, color: '#fff', fontWeight: '800' }}>✓</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Nova Chat Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Chat')}
        style={{
          position: 'absolute',
          bottom: insets.bottom + 20,
          alignSelf: 'center',
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 50,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: Colors.orange,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: Colors.orange,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 22 }}>✦</Text>
        </View>
      </TouchableOpacity>

      {/* Opportunity Detail Modal */}
      <Modal
        visible={!!selectedOpp}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedOpp(null)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View
            style={{
              backgroundColor: Colors.white,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: insets.bottom + 24,
              maxHeight: '75%',
            }}
          >
            {/* Close button */}
            <TouchableOpacity
              onPress={() => setSelectedOpp(null)}
              style={{ position: 'absolute', top: 16, right: 20, zIndex: 10 }}
            >
              <Text style={{ fontSize: 20, color: Colors.muted }}>✕</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedOpp && (
                <>
                  <Text style={{ fontSize: 22, marginBottom: 4 }}>
                    {TYPE_EMOJI[selectedOpp.type] ?? '📋'}
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.dark, marginBottom: 4 }}>
                    {selectedOpp.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: Colors.orange, fontWeight: '700', marginBottom: 12 }}>
                    {selectedOpp.organization}
                  </Text>
                  <Text style={{ fontSize: 14, color: Colors.dark, lineHeight: 21, marginBottom: 16 }}>
                    {selectedOpp.description}
                  </Text>

                  {selectedOpp.deadline && (
                    <View style={{
                      backgroundColor: Colors.cream,
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      marginBottom: 12,
                    }}>
                      <Text style={{ fontSize: 12, color: Colors.muted, fontWeight: '600' }}>
                        deadline: {selectedOpp.deadline}
                      </Text>
                    </View>
                  )}

                  {selectedOpp.tags.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                      {selectedOpp.tags.map((tag) => (
                        <View
                          key={tag}
                          style={{
                            backgroundColor: Colors.orangeLight,
                            borderRadius: 999,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                          }}
                        >
                          <Text style={{ fontSize: 12, color: Colors.orange, fontWeight: '600' }}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => handleApply(selectedOpp.url)}
                    style={{
                      backgroundColor: Colors.orange,
                      borderRadius: 14,
                      paddingVertical: 14,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.white }}>
                      apply →
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
