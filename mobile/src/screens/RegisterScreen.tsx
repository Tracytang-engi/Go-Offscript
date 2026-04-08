import React, { useState } from 'react';
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
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
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

export const RegisterScreen = ({ navigation }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleRegister = async () => {
    setError(null);
    if (!name.trim()) { setError('enter your name'); return; }
    if (!email.includes('@')) { setError('check your email'); return; }
    if (password.length < 8) { setError('password needs 8+ characters'); return; }
    setLoading(true);
    try {
      const result = await authApi.register({ name: name.trim(), email: email.trim().toLowerCase(), password });
      await setAuth(result.user, result.token);
      navigation.navigate('Upload');
    } catch {
      // authApi never throws — this is a safety net
      navigation.navigate('Upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingTop: 40, paddingBottom: 32 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.dark }}>
            let's get started ✦
          </Text>
          <Text style={{ fontSize: 14, color: Colors.muted, marginTop: 6 }}>
            create your account
          </Text>
        </View>

        <TextInput
          style={inputStyle}
          placeholder="your name"
          placeholderTextColor={Colors.muted}
          value={name}
          onChangeText={setName}
        />
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
          placeholder="password (min 8 characters)"
          placeholderTextColor={Colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? (
          <Text style={{ color: 'red', fontSize: 13, marginBottom: 12 }}>{error}</Text>
        ) : null}

        <PrimaryButton label="create account" onPress={handleRegister} loading={loading} />
        <GhostButton
          label="already have an account? log in"
          onPress={() => navigation.navigate('Login')}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
};
