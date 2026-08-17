import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert, Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../lib/store/auth.store';
import { useOnboardingStore } from '../lib/store/onboarding.store';
import { useThemeStore } from '../lib/store/theme.store';
import { useTheme } from '../lib/useTheme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export const SettingsScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { clearAuth, user } = useAuthStore();
  const { reset } = useOnboardingStore();
  const { darkMode, fontSize, toggleDarkMode, setFontSize } = useThemeStore();
  const { colors, fs } = useTheme();

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
      'This will permanently delete your account and all data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => comingSoon('Account deletion') },
      ]
    );
  };

  // ── Reusable row components ──────────────────────────────────────────────────

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={{
      fontSize: fs(11),
      fontWeight: '700',
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.9,
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 8,
    }}>
      {title}
    </Text>
  );

  const SettingRow = ({
    label,
    subtitle,
    onPress,
    rightLabel,
    danger,
    switchValue,
    onSwitchChange,
  }: {
    label: string;
    subtitle?: string;
    onPress?: () => void;
    rightLabel?: string;
    danger?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (v: boolean) => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress && !onSwitchChange ? 0.6 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ fontSize: fs(15), fontWeight: '600', color: danger ? '#EF4444' : colors.dark }}>
          {label}
        </Text>
        {subtitle ? (
          <Text style={{ fontSize: fs(12), color: colors.muted, marginTop: 2 }}>{subtitle}</Text>
        ) : null}
      </View>

      {onSwitchChange !== undefined ? (
        <Switch
          value={switchValue ?? false}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.orange }}
          thumbColor="#fff"
        />
      ) : rightLabel ? (
        <Text style={{ fontSize: fs(13), color: colors.muted }}>{rightLabel}</Text>
      ) : onPress ? (
        <Text style={{ fontSize: 16, color: colors.muted }}>›</Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 22, color: colors.muted }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: fs(20), fontWeight: '800', color: colors.dark }}>settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* ── Account ───────────────────────────────────── */}
        <SectionHeader title="Account" />
        <View style={{ borderRadius: 14, overflow: 'hidden', marginHorizontal: 20 }}>
          <SettingRow
            label="email"
            subtitle={user?.email ?? '—'}
          />
          <SettingRow
            label="change password"
            onPress={() => comingSoon('Password change')}
          />
          <SettingRow label="log out" onPress={handleLogout} />
          <SettingRow label="delete account" danger onPress={handleDeleteAccount} />
        </View>

        {/* ── Appearance ────────────────────────────────── */}
        <SectionHeader title="Appearance" />
        <View style={{ borderRadius: 14, overflow: 'hidden', marginHorizontal: 20 }}>
          <SettingRow
            label="dark mode"
            subtitle={darkMode ? 'on' : 'off'}
            switchValue={darkMode}
            onSwitchChange={() => toggleDarkMode()}
          />
          <SettingRow
            label="large text"
            subtitle={fontSize === 'large' ? 'on — text is 15% bigger' : 'off'}
            switchValue={fontSize === 'large'}
            onSwitchChange={(v) => setFontSize(v ? 'large' : 'normal')}
          />
        </View>

        {/* ── Notifications ─────────────────────────────── */}
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

        {/* ── Privacy ───────────────────────────────────── */}
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

        {/* ── About ─────────────────────────────────────── */}
        <SectionHeader title="About" />
        <View style={{ borderRadius: 14, overflow: 'hidden', marginHorizontal: 20 }}>
          <SettingRow label="version" rightLabel="1.0.0" />
          <SettingRow label="terms & conditions" onPress={() => comingSoon('Terms & Conditions')} />
          <SettingRow label="privacy policy" onPress={() => comingSoon('Privacy Policy')} />
          <SettingRow label="contact us" subtitle="hello@gooffscript.com" onPress={() => comingSoon('Contact')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
