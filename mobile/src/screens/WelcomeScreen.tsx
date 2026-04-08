import React from 'react';
import { View, Text } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { NovaBubble } from '../components/nova/NovaBubble';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { GhostButton } from '../components/ui/GhostButton';
import { ProgressDots } from '../components/ui/ProgressDots';
import { Colors } from '../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export const WelcomeScreen = ({ navigation }: Props) => (
  <Screen>
    {/* Logo + title */}
    <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 32 }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: Colors.orangeLight,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 36 }}>✦</Text>
      </View>
      <Text style={{ fontSize: 34, fontWeight: '800', color: Colors.dark, letterSpacing: -1 }}>
        go off{' '}
        <Text style={{ color: Colors.orange, fontStyle: 'italic' }}>script</Text>
      </Text>
      <Text style={{ fontSize: 11, letterSpacing: 3, color: Colors.muted, marginTop: 4 }}>
        CAREERS
      </Text>
    </View>

    {/* Nova bubble */}
    <NovaBubble
      message={
        "hey babe 🧡 i'm nova — that friend who's done ALL the career research so you don't have to.\n\nno boring advice. no pressure. just us figuring out your path together 🌟"
      }
    />

    {/* CTA buttons */}
    <View style={{ gap: 4, marginTop: 8 }}>
      <PrimaryButton
        label="hey nova, let's go 👋"
        onPress={() => navigation.navigate('Register')}
      />
      <GhostButton
        label="i already have an account"
        onPress={() => navigation.navigate('Login')}
      />
    </View>

    <ProgressDots current={1} />
  </Screen>
);
