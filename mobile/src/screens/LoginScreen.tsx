import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { GhostButton } from '../components/ui/GhostButton';
import { Colors } from '../constants/colors';
import { authApi } from '../lib/api/auth.api';
import { useAuthStore } from '../lib/store/auth.store';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const inputStyle = {
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: 12,
  padding: 14,
  fontSize: 15,
  backgroundColor: Colors.white,
  marginBottom: 12,
  color: Colors.dark,
};

export const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowNetwork, setSlowNetwork] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (slowTimer.current) clearTimeout(slowTimer.current); }, []);

  const handleLogin = async () => {
    setError(null);
    if (!email.includes('@')) { setError('check your email'); return; }
    if (!password) { setError('enter your password'); return; }
    setLoading(true);
    setSlowNetwork(false);
    slowTimer.current = setTimeout(() => setSlowNetwork(true), 8000);
    try {
      const result = await authApi.login({ email: email.trim().toLowerCase(), password });
      await setAuth(result.user, result.token);
      navigation.navigate('Upload');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('network')) {
        setError('the server is waking up — wait a moment and try again');
      } else if (
        msg.toLowerCase().includes('invalid') ||
        msg.toLowerCase().includes('credentials') ||
        msg.toLowerCase().includes('password') ||
        msg.toLowerCase().includes('not found')
      ) {
        setError('wrong email or password');
      } else {
        setError(msg || 'could not connect — please try again');
      }
    } finally {
      setLoading(false);
      setSlowNetwork(false);
      if (slowTimer.current) clearTimeout(slowTimer.current);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingTop: 40, paddingBottom: 32 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.dark }}>
            welcome back ✦
          </Text>
          <Text style={{ fontSize: 14, color: Colors.muted, marginTop: 6 }}>
            good to see you again
          </Text>
        </View>

        <TextInput
          style={inputStyle}
          placeholder="email"
          placeholderTextColor={Colors.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={inputStyle}
          placeholder="password"
          placeholderTextColor={Colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {slowNetwork && loading ? (
          <Text style={{ color: Colors.muted, fontSize: 13, marginBottom: 12 }}>
            waking up the server, this takes ~30s on first connect...
          </Text>
        ) : null}

        {error ? (
          <Text style={{ color: 'red', fontSize: 13, marginBottom: 12 }}>{error}</Text>
        ) : null}

        <PrimaryButton label="log in" onPress={handleLogin} loading={loading} />
        <GhostButton
          label="new here? create account"
          onPress={() => navigation.navigate('Register')}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
};
