import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert, Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Colors } from '../constants/colors';
import { useAuthStore } from '../lib/store/auth.store';
import { useOnboardingStore } from '../lib/store/onboarding.store';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

interface SettingRowProps {
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightLabel?: string;
  danger?: boolean;
}

const SettingRow = ({ label, subtitle, onPress, rightLabel, danger }: SettingRowProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={onPress ? 0.6 : 1}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: Colors.white,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    }}
  >
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color: danger ? '#EF4444' : Colors.dark }}>
        {label}
      </Text>
      {subtitle ? (
        <Text style={{ fontSize: 12, color: Colors.muted, marginTop: 2 }}>{subtitle}</Text>
      ) : null}
    </View>
    {rightLabel ? (
      <Text style={{ fontSize: 13, color: Colors.muted }}>{rightLabel}</Text>
    ) : (
      onPress ? <Text style={{ fontSize: 16, color: Colors.muted }}>›</Text> : null
    )}
  </TouchableOpacity>
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={{
    fontSize: 11,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  }}>
    {title}
  </Text>
);

export const SettingsScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { clearAuth, user } = useAuthStore();
  const { reset } = useOnboardingStore();

  const comingSoon = (feature: string) =>
    Alert.alert('Coming Soon', `${feature} is being built for you.`);

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await clearAuth();
          reset();
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => comingSoon('Account deletion'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.cream }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 22, color: Colors.muted }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.dark }}>settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Account section */}
        <SectionHeader title="Account" />
        <View style={{ borderRadius: 14, overflow: 'hidden', marginHorizontal: 20 }}>
          <SettingRow
            label="email"
            subtitle={user?.email ?? '—'}
            rightLabel=""
          />
          <SettingRow
            label="change password"
            onPress={() => comingSoon('Password change')}
          />
          <SettingRow
            label="log out"
            onPress={handleLogout}
          />
          <SettingRow
            label="delete account"
            danger
            onPress={handleDeleteAccount}
          />
        </View>

        {/* Appearance section */}
        <SectionHeader title="Appearance" />
        <View style={{ borderRadius: 14, overflow: 'hidden', marginHorizontal: 20 }}>
          <SettingRow
            label="dark mode"
            subtitle="coming soon"
            onPress={() => comingSoon('Dark mode')}
          />
          <SettingRow
            label="font size"
            subtitle="coming soon"
            onPress={() => comingSoon('Font size')}
          />
        </View>

        {/* Notifications section */}
        <SectionHeader title="Notifications" />
        <View style={{ borderRadius: 14, overflow: 'hidden', marginHorizontal: 20 }}>
          <SettingRow
            label="push notifications"
            subtitle="coming soon"
            onPress={() => comingSoon('Notifications')}
          />
          <SettingRow
            label="email digest"
            subtitle="coming soon"
            onPress={() => comingSoon('Email digest')}
          />
        </View>

        {/* Privacy section */}
        <SectionHeader title="Privacy" />
        <View style={{ borderRadius: 14, overflow: 'hidden', marginHorizontal: 20 }}>
          <SettingRow
            label="data sharing"
            subtitle="allow Nova to improve using your data — coming soon"
            onPress={() => comingSoon('Privacy settings')}
          />
          <SettingRow
            label="download my data"
            subtitle="coming soon"
            onPress={() => comingSoon('Data download')}
          />
        </View>

        {/* About section */}
        <SectionHeader title="About" />
        <View style={{ borderRadius: 14, overflow: 'hidden', marginHorizontal: 20 }}>
          <SettingRow
            label="version"
            rightLabel="1.0.0"
          />
          <SettingRow
            label="terms & conditions"
            onPress={() => comingSoon('Terms & Conditions')}
          />
          <SettingRow
            label="privacy policy"
            onPress={() => comingSoon('Privacy Policy')}
          />
          <SettingRow
            label="contact us"
            subtitle="hello@gooffscript.com"
            onPress={() => comingSoon('Contact')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
