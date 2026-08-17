import React, { useEffect, useRef, useState } from 'react';
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
  TextInput,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../lib/useTheme';
import { useAuthStore } from '../lib/store/auth.store';
import { useOnboardingStore } from '../lib/store/onboarding.store';
import type { Opportunity, Mentor } from '../types';
import { MentorOutreachModal } from '../components/linkedin/MentorOutreachModal';
import type { PathScore } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

const QUICK_BUTTONS = [
  { label: 'Profile', emoji: 'ðŸ‘¤' },
  { label: 'My Path', emoji: 'ðŸ—ºï¸�' },
  { label: 'LinkedIn\nOutreach', emoji: 'ðŸ”—' },
];

const TYPE_EMOJI: Record<string, string> = {
  INTERNSHIP: 'ðŸ’¼',
  FELLOWSHIP: 'ðŸŒ±',
  SHORT_PROJECT: 'ðŸ› ',
  COACHING: 'ðŸ’¬',
  MEETUP: 'ðŸ“�',
};

// â”€â”€â”€ Swipeable row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Left-swipe reveals a yellow â˜… â€” tapping it unsaves and closes the row.
interface SwipeableRowProps {
  onUnsave: () => void;
  children: React.ReactNode;
}

const SwipeableRow = ({ onUnsave, children }: SwipeableRowProps) => {
  const ref = useRef<Swipeable>(null);

  const renderRightActions = () => (
    <TouchableOpacity
      onPress={() => {
        ref.current?.close();
        onUnsave();
      }}
      style={{
        width: 64,
        marginBottom: 8,
        borderRadius: 14,
        backgroundColor: '#FBBF24',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 22 }}>â˜…</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable ref={ref} renderRightActions={renderRightActions} friction={2} rightThreshold={40}>
      {children}
    </Swipeable>
  );
};

// â”€â”€â”€ Main screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const DashboardScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    opportunities,
    savedOpportunityIds,
    completedOpportunityIds,
    markOppComplete,
    unmarkOppComplete,
    toggleSavedOpp,
    savedMentors,
    contactedMentorIds,
    toggleMentorContacted,
    chatSummary,
    careerPath,
    likedPaths,
    skills,
    setSkills,
    profileName,
    profileAge,
    profileRegion,
    profileSchool,
    cvFileName,
    setProfile,
  } = useOnboardingStore();

  const { colors, fs } = useTheme();

  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [linkedInOpen, setLinkedInOpen] = useState(false);
  const [mentorModalVisible, setMentorModalVisible] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [myPathVisible, setMyPathVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);

  // Local draft for profile editing â€” synced from store when modal opens
  const [draftName, setDraftName] = useState('');
  const [draftAge, setDraftAge] = useState('');
  const [draftRegion, setDraftRegion] = useState('');
  const [draftSchool, setDraftSchool] = useState('');

  // Skills editing state
  const [skillsEditing, setSkillsEditing] = useState(false);
  const [draftSkillsText, setDraftSkillsText] = useState('');

  // My Path modal: which skipped path row is expanded
  const [expandedSkippedId, setExpandedSkippedId] = useState<string | null>(null);

  useEffect(() => {
    if (profileVisible) {
      setDraftName(profileName || user?.name || '');
      setDraftAge(profileAge);
      setDraftRegion(profileRegion);
      setDraftSchool(profileSchool);
      setSkillsEditing(false);
      setDraftSkillsText(skills.join(', '));
    }
  }, [profileVisible]);

  const toContactMentors = savedMentors.filter((m) => !contactedMentorIds.includes(m.id));
  const contactedMentors = savedMentors.filter((m) => contactedMentorIds.includes(m.id));

  const handleMentorContactToggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    toggleMentorContacted(id);
  };

  const openMentorModal = (m: Mentor) => {
    setSelectedMentor(m);
    setMentorModalVisible(true);
  };

  const savedOpps = opportunities.filter((o) => savedOpportunityIds.includes(o.id));
  const pendingOpps = savedOpps.filter((o) => !completedOpportunityIds.includes(o.id));
  const completedOpps = savedOpps.filter((o) => completedOpportunityIds.includes(o.id));

  const handleToggleComplete = (id: string, isCompleted: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (isCompleted) {
      unmarkOppComplete(id);   // move back to Pending
    } else {
      markOppComplete(id);     // move to Completed
    }
  };

  const handleUnsave = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    toggleSavedOpp(id);        // removes from savedOpportunityIds â†’ row disappears
  };

  const handleApply = (url?: string | null) => {
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert('Could not open link'));
    } else {
      Alert.alert('No link available', 'This opportunity has no direct application link.');
    }
  };

  // â”€â”€ Row component (shared by Pending and Completed) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const AppRow = ({ opp, isCompleted }: { opp: Opportunity; isCompleted: boolean }) => (
    <SwipeableRow onUnsave={() => handleUnsave(opp.id)}>
      <View
        style={{
          backgroundColor: colors.white,
          borderRadius: 14,
          paddingVertical: 14,
          paddingHorizontal: 16,
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          opacity: isCompleted ? 0.72 : 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 1,
        }}
      >
        {/* Title + org (tappable â†’ detail modal) */}
        <TouchableOpacity onPress={() => setSelectedOpp(opp)} style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.dark }}>
            {TYPE_EMOJI[opp.type] ?? 'ðŸ“‹'} {opp.title}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
            {opp.organization}
          </Text>
        </TouchableOpacity>

        {/* Checkbox â€” toggles between pending and completed */}
        <TouchableOpacity
          onPress={() => handleToggleComplete(opp.id, isCompleted)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            backgroundColor: isCompleted ? '#22C55E' : 'transparent',
            borderWidth: isCompleted ? 0 : 2,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 12,
          }}
        >
          {isCompleted && (
            <Text style={{ fontSize: 13, color: '#fff', fontWeight: '800' }}>âœ“</Text>
          )}
        </TouchableOpacity>
      </View>
    </SwipeableRow>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingTop: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.dark }}>
            hey {user?.name?.split(' ')[0] ?? 'you'} âœ¦
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>
            here's your career dashboard
          </Text>
        </View>

        {/* 3 Quick Buttons */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          {QUICK_BUTTONS.map((btn, idx) => {
            const isLinkedIn = idx === 2;
            return (
              <TouchableOpacity
                key={btn.label}
                onPress={() => {
                  if (isLinkedIn) {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setLinkedInOpen((o) => !o);
                  } else if (idx === 0) {
                    setProfileVisible(true);
                  } else if (idx === 1) {
                    setMyPathVisible(true);
                  } else {
                    Alert.alert('Coming soon', "we're building this for you âœ¨");
                  }
                }}
                style={{
                  flex: 1,
                  backgroundColor: colors.white,
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
                  borderWidth: isLinkedIn && linkedInOpen ? 2.5 : 0,
                  borderColor: isLinkedIn && linkedInOpen ? colors.orange : 'transparent',
                }}
              >
                <Text style={{ fontSize: 24 }}>{btn.emoji}</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.dark, textAlign: 'center' }}>
                  {btn.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* LinkedIn Outreach â€” saved mentors from Ways In */}
        {linkedInOpen && (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 14, lineHeight: 19 }}>
              starred mentors from Ways In â€” tap a card for details. gray box = to contact, green âœ“ = contacted.
            </Text>

            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.dark, marginBottom: 10 }}>
              to contact
            </Text>
            {toContactMentors.length === 0 ? (
              <Text style={{ fontSize: 13, color: colors.muted, fontStyle: 'italic', marginBottom: 20 }}>
                no mentors here yet â€” save some from Ways In (Mentors tab) â˜…
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
                style={{ marginBottom: 22 }}
              >
                {toContactMentors.map((m) => (
                    <View
                      key={m.id}
                      style={{
                        width: 228,
                        backgroundColor: colors.white,
                        borderRadius: 14,
                        padding: 12,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.06,
                        shadowRadius: 3,
                        elevation: 2,
                      }}
                    >
                      <TouchableOpacity onPress={() => openMentorModal(m)} style={{ flex: 1, paddingRight: 6 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.dark }} numberOfLines={2}>
                          {m.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 17 }} numberOfLines={4}>
                          {m.bio || m.title}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleMentorContactToggle(m.id)}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 5,
                          borderWidth: 2,
                          borderColor: colors.border,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 2,
                        }}
                      />
                    </View>
                ))}
              </ScrollView>
            )}

            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.dark, marginBottom: 10 }}>
              contacted
            </Text>
            {contactedMentors.length === 0 ? (
              <Text style={{ fontSize: 13, color: colors.muted, fontStyle: 'italic' }}>
                when you tick the box, mentors move here
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
              >
                {contactedMentors.map((m) => (
                    <View
                      key={m.id}
                      style={{
                        width: 228,
                        backgroundColor: colors.white,
                        borderRadius: 14,
                        padding: 12,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        opacity: 0.88,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 3,
                        elevation: 1,
                      }}
                    >
                      <TouchableOpacity onPress={() => openMentorModal(m)} style={{ flex: 1, paddingRight: 6 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.dark }} numberOfLines={2}>
                          {m.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 17 }} numberOfLines={4}>
                          {m.bio || m.title}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleMentorContactToggle(m.id)}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 5,
                          backgroundColor: '#22C55E',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 2,
                        }}
                      >
                        <Text style={{ fontSize: 11, color: '#fff', fontWeight: '900' }}>âœ“</Text>
                      </TouchableOpacity>
                    </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Horizontal Saved List */}
        {savedOpps.length > 0 && (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.dark, marginBottom: 12 }}>
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
                    backgroundColor: colors.white,
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
                    {TYPE_EMOJI[item.type] ?? 'ðŸ“‹'}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={{ fontSize: 13, fontWeight: '700', color: colors.dark, marginBottom: 4 }}
                  >
                    {item.title}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 11, color: colors.muted }}>
                    {item.organization}
                  </Text>
                  {completedOpportunityIds.includes(item.id) && (
                    <Text style={{ fontSize: 12, color: '#22C55E', marginTop: 4, fontWeight: '700' }}>
                      âœ“ applied
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Pending Applications */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.dark, marginBottom: 12 }}>
            Pending Applications
          </Text>
          {pendingOpps.length === 0 ? (
            <Text style={{ fontSize: 13, color: colors.muted, fontStyle: 'italic' }}>
              {savedOpps.length === 0
                ? 'save opportunities from Ways In to track them here â˜…'
                : 'all done â€” everything moved to completed!'}
            </Text>
          ) : (
            pendingOpps.map((opp) => (
              <AppRow key={opp.id} opp={opp} isCompleted={false} />
            ))
          )}
        </View>

        {/* Completed Applications */}
        {completedOpps.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.dark, marginBottom: 12 }}>
              Completed Applications
            </Text>
            {completedOpps.map((opp) => (
              <AppRow key={opp.id} opp={opp} isCompleted={true} />
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
            backgroundColor: colors.orange,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.orange,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 22 }}>âœ¦</Text>
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
              backgroundColor: colors.white,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: insets.bottom + 24,
              maxHeight: '75%',
            }}
          >
            <TouchableOpacity
              onPress={() => setSelectedOpp(null)}
              style={{ position: 'absolute', top: 16, right: 20, zIndex: 10 }}
            >
              <Text style={{ fontSize: 20, color: colors.muted }}>âœ•</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedOpp && (
                <>
                  <Text style={{ fontSize: 22, marginBottom: 4 }}>
                    {TYPE_EMOJI[selectedOpp.type] ?? 'ðŸ“‹'}
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: colors.dark, marginBottom: 4 }}>
                    {selectedOpp.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.orange, fontWeight: '700', marginBottom: 12 }}>
                    {selectedOpp.organization}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.dark, lineHeight: 21, marginBottom: 16 }}>
                    {selectedOpp.description}
                  </Text>

                  {selectedOpp.deadline && (
                    <View style={{
                      backgroundColor: colors.cream,
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      marginBottom: 12,
                    }}>
                      <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '600' }}>
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
                            backgroundColor: colors.orangeLight,
                            borderRadius: 999,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                          }}
                        >
                          <Text style={{ fontSize: 12, color: colors.orange, fontWeight: '600' }}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => handleApply(selectedOpp.url)}
                    style={{
                      backgroundColor: colors.orange,
                      borderRadius: 14,
                      paddingVertical: 14,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '800', color: colors.white }}>
                      apply â†’
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <MentorOutreachModal
        visible={mentorModalVisible}
        mentor={selectedMentor}
        chatSummary={chatSummary}
        isContacted={!!selectedMentor && contactedMentorIds.includes(selectedMentor.id)}
        onClose={() => {
          setMentorModalVisible(false);
          setSelectedMentor(null);
        }}
      />

      {/* â”€â”€ Profile Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal
        visible={profileVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProfileVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{
            backgroundColor: colors.cream,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '88%',
          }}>
            {/* Handle */}
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            </View>

            {/* Header */}
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between',
              alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12,
            }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.dark }}>
                your profile ðŸ‘¤
              </Text>
              <TouchableOpacity onPress={() => setProfileVisible(false)} hitSlop={12}>
                <Text style={{ fontSize: 22, color: colors.muted }}>âœ•</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 100 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* â”€â”€ Token / Payment row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.white,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>tokens</Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: colors.dark, marginTop: 2 }}>0</Text>
                </View>
                <TouchableOpacity
                  onPress={() => Alert.alert('Top-up', 'Payment feature coming soon!')}
                  style={{
                    backgroundColor: colors.orange,
                    borderRadius: 10,
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '800', color: colors.white }}>top up â†’</Text>
                </TouchableOpacity>
              </View>

              {/* â”€â”€ Editable fields â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              {([
                { label: 'name', value: draftName, onChange: setDraftName, placeholder: 'your name', keyboardType: 'default' },
                { label: 'age', value: draftAge, onChange: setDraftAge, placeholder: 'e.g. 22', keyboardType: 'numeric' },
                { label: 'region', value: draftRegion, onChange: setDraftRegion, placeholder: 'e.g. London, UK', keyboardType: 'default' },
                { label: 'school', value: draftSchool, onChange: setDraftSchool, placeholder: 'e.g. UCL', keyboardType: 'default' },
              ] as const).map((field) => (
                <View key={field.label} style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    {field.label}
                  </Text>
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.border}
                    keyboardType={field.keyboardType as any}
                    style={{
                      backgroundColor: colors.white,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 13,
                      fontSize: 15,
                      fontWeight: '600',
                      color: colors.dark,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  />
                </View>
              ))}

              {/* â”€â”€ CV row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  cv
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setProfile({ name: draftName, age: draftAge, region: draftRegion, school: draftSchool });
                    setProfileVisible(false);
                    navigation.navigate('Upload');
                  }}
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontSize: 14, color: cvFileName ? colors.dark : colors.muted, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                    {cvFileName ?? 'no CV uploaded'}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.orange, fontWeight: '700', marginLeft: 8 }}>
                    {cvFileName ? 're-upload â†’' : 'upload â†’'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* â”€â”€ Skills tags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  extracted skills
                </Text>
                {skills.length > 0 ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {skills.map((s) => (
                      <View key={s} style={{
                        backgroundColor: colors.orangeLight,
                        borderRadius: 999,
                        paddingHorizontal: 12,
                        paddingVertical: 5,
                      }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.orange }}>{s}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 10 }}>
                    no skills extracted yet â€” upload a CV first
                  </Text>
                )}

                {skillsEditing ? (
                  <View>
                    <TextInput
                      value={draftSkillsText}
                      onChangeText={setDraftSkillsText}
                      placeholder="e.g. Python, Data Analysis, Communication"
                      placeholderTextColor={colors.border}
                      multiline
                      style={{
                        backgroundColor: colors.white,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        fontSize: 14,
                        color: colors.dark,
                        borderWidth: 1,
                        borderColor: colors.orange,
                        marginBottom: 8,
                        minHeight: 72,
                        textAlignVertical: 'top',
                      }}
                    />
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => {
                          const updated = draftSkillsText
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean);
                          setSkills(updated);
                          setSkillsEditing(false);
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: colors.orange,
                          borderRadius: 10,
                          paddingVertical: 10,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.white }}>save skills</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setSkillsEditing(false)}
                        style={{
                          paddingHorizontal: 16,
                          borderRadius: 10,
                          paddingVertical: 10,
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.muted }}>cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setDraftSkillsText(skills.join(', '));
                      setSkillsEditing(true);
                    }}
                    style={{
                      backgroundColor: colors.orange,
                      borderRadius: 10,
                      paddingVertical: 10,
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                      paddingHorizontal: 16,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '800', color: colors.white }}>update skills â†’</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* â”€â”€ Settings row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  settings
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setProfileVisible(false);
                    navigation.navigate('Settings');
                  }}
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontSize: 14, color: colors.dark, fontWeight: '600' }}>
                    app settings
                  </Text>
                  <Text style={{ fontSize: 16, color: colors.muted }}>â€º</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Save button */}
            <View style={{
              position: 'absolute',
              bottom: insets.bottom + 20,
              left: 20,
              right: 20,
            }}>
              <TouchableOpacity
                onPress={() => {
                  setProfile({ name: draftName, age: draftAge, region: draftRegion, school: draftSchool });
                  setProfileVisible(false);
                }}
                style={{
                  backgroundColor: colors.orange,
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                  shadowColor: colors.orange,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.white }}>
                  save â†’
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* â”€â”€ My Path Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal
        visible={myPathVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setMyPathVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View
            style={{
              backgroundColor: colors.cream,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '88%',
            }}
          >
            {/* Handle */}
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            </View>

            {/* Header */}
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between',
              alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12,
            }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.dark }}>
                your paths âœ¦
              </Text>
              <TouchableOpacity onPress={() => setMyPathVisible(false)} hitSlop={12}>
                <Text style={{ fontSize: 22, color: colors.muted }}>âœ•</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 100 }}
            >
              {!careerPath ? (
                <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                  <Text style={{ fontSize: 32, marginBottom: 12 }}>ðŸ—ºï¸�</Text>
                  <Text style={{ fontSize: 15, color: colors.muted, textAlign: 'center' }}>
                    no paths yet â€” complete the onboarding flow first
                  </Text>
                </View>
              ) : (() => {
                const likedScores = careerPath.pathScores.filter((s: PathScore) => likedPaths.includes(s.pathTitle));
                const skippedScores = careerPath.pathScores.filter((s: PathScore) => !likedPaths.includes(s.pathTitle));

                const renderPathCard = (score: PathScore) => {
                  const matchColor =
                    score.matchScore >= 80 ? '#22C55E'
                    : score.matchScore >= 60 ? colors.orange
                    : colors.muted;

                  return (
                    <View
                      key={score.id}
                      style={{
                        backgroundColor: colors.white,
                        borderRadius: 18,
                        padding: 18,
                        marginBottom: 14,
                        borderWidth: 2,
                        borderColor: colors.orange,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 6,
                        elevation: 3,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.dark, flex: 1, marginRight: 8 }}>
                          {score.pathTitle}
                        </Text>
                        <View style={{ backgroundColor: matchColor + '20', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                          <Text style={{ fontSize: 12, fontWeight: '800', color: matchColor }}>
                            {score.matchScore}% match
                          </Text>
                        </View>
                      </View>

                      {/* Description */}
                      {score.description ? (
                        <Text style={{ fontSize: 13, color: colors.dark, lineHeight: 20, marginBottom: 12 }}>
                          {score.description}
                        </Text>
                      ) : null}

                      {/* Skills already have */}
                      {score.skillsAlreadyHave && score.skillsAlreadyHave.length > 0 && (
                        <View style={{ marginBottom: 10 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#22C55E', marginBottom: 5 }}>
                            skills you already have
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            {score.skillsAlreadyHave.map((s) => (
                              <View key={s} style={{
                                backgroundColor: '#D1FAE5', borderRadius: 999,
                                paddingHorizontal: 10, paddingVertical: 3,
                              }}>
                                <Text style={{ fontSize: 11, color: '#065F46', fontWeight: '600' }}>{s}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Skills gap */}
                      {score.skillsGap && score.skillsGap.length > 0 && (
                        <View style={{ marginBottom: 12 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.orange, marginBottom: 5 }}>
                            skills to develop
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            {score.skillsGap.map((s) => (
                              <View key={s} style={{
                                backgroundColor: colors.orangeLight, borderRadius: 999,
                                paddingHorizontal: 10, paddingVertical: 3,
                              }}>
                                <Text style={{ fontSize: 11, color: colors.orange, fontWeight: '600' }}>{s}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Close the gap button */}
                      <TouchableOpacity
                        onPress={() => {
                          setMyPathVisible(false);
                          navigation.navigate('WaysIn', { targetCareer: score.pathTitle });
                        }}
                        style={{
                          backgroundColor: colors.orange,
                          borderRadius: 12,
                          paddingVertical: 10,
                          alignItems: 'center',
                          marginTop: 4,
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.white }}>
                          close the gap â†’
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                };

                return (
                  <>
                    {likedScores.length > 0
                      ? likedScores.map(renderPathCard)
                      : (
                        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                          <Text style={{ fontSize: 14, color: colors.muted, textAlign: 'center' }}>
                            you haven't liked any paths yet
                          </Text>
                        </View>
                      )
                    }

                    {skippedScores.length > 0 && (
                      <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 10 }}>
                          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                          <Text style={{ fontSize: 10, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.9, marginHorizontal: 12 }}>
                            skipped paths
                          </Text>
                          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                        </View>

                        {skippedScores.map((score: PathScore) => {
                          const isExpanded = expandedSkippedId === score.id;
                          const matchColor =
                            score.matchScore >= 80 ? '#22C55E'
                            : score.matchScore >= 60 ? colors.orange
                            : colors.muted;
                          return (
                            <View key={score.id} style={{ marginBottom: 10 }}>
                              <TouchableOpacity
                                onPress={() => setExpandedSkippedId(isExpanded ? null : score.id)}
                                style={{
                                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                  backgroundColor: colors.white, borderRadius: 12,
                                  paddingHorizontal: 14, paddingVertical: 12,
                                  borderWidth: 1, borderColor: colors.border, opacity: 0.65,
                                }}
                              >
                                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.dark, flex: 1, marginRight: 8 }} numberOfLines={1}>
                                  {score.pathTitle}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                  <View style={{ backgroundColor: matchColor + '20', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                                    <Text style={{ fontSize: 11, fontWeight: '800', color: matchColor }}>{score.matchScore}%</Text>
                                  </View>
                                  <Text style={{ fontSize: 14, color: colors.muted }}>{isExpanded ? '▲' : '▼'}</Text>
                                </View>
                              </TouchableOpacity>

                              {isExpanded && (
                                <View style={{
                                  backgroundColor: colors.white, borderRadius: 12,
                                  padding: 14, borderWidth: 1, borderColor: colors.border,
                                  borderTopWidth: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0,
                                  marginTop: -4, opacity: 0.8,
                                }}>
                                  {score.description ? (
                                    <Text style={{ fontSize: 13, color: colors.dark, lineHeight: 19, marginBottom: 10 }}>{score.description}</Text>
                                  ) : null}
                                  {score.skillsAlreadyHave && score.skillsAlreadyHave.length > 0 && (
                                    <View style={{ marginBottom: 8 }}>
                                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#22C55E', marginBottom: 4 }}>skills you already have</Text>
                                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                                        {score.skillsAlreadyHave.map((s: string) => (
                                          <View key={s} style={{ backgroundColor: '#D1FAE5', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                                            <Text style={{ fontSize: 10, color: '#065F46', fontWeight: '600' }}>{s}</Text>
                                          </View>
                                        ))}
                                      </View>
                                    </View>
                                  )}
                                  {score.skillsGap && score.skillsGap.length > 0 && (
                                    <View style={{ marginBottom: 10 }}>
                                      <Text style={{ fontSize: 10, fontWeight: '700', color: colors.orange, marginBottom: 4 }}>skills to develop</Text>
                                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                                        {score.skillsGap.map((s: string) => (
                                          <View key={s} style={{ backgroundColor: colors.orangeLight, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                                            <Text style={{ fontSize: 10, color: colors.orange, fontWeight: '600' }}>{s}</Text>
                                          </View>
                                        ))}
                                      </View>
                                    </View>
                                  )}
                                  <TouchableOpacity
                                    onPress={() => { setMyPathVisible(false); navigation.navigate('WaysIn', { targetCareer: score.pathTitle }); }}
                                    style={{ backgroundColor: colors.border, borderRadius: 10, paddingVertical: 8, alignItems: 'center' }}
                                  >
                                    <Text style={{ fontSize: 12, fontWeight: '800', color: colors.muted }}>close the gap</Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </>
                    )}
                  </>
                );
              })()}
            </ScrollView>

            {/* Floating Nova "explore more paths" FAB */}
            <View style={{
              position: 'absolute',
              bottom: insets.bottom + 20,
              alignSelf: 'center',
              alignItems: 'center',
            }}>
              <TouchableOpacity
                onPress={() => {
                  setMyPathVisible(false);
                  navigation.navigate('RePathChat');
                }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: colors.orange,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: colors.orange,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Text style={{ fontSize: 26 }}>âœ¦</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 11, color: colors.muted, marginTop: 6, fontWeight: '500' }}>
                explore more paths
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
