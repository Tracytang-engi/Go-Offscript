import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { Colors } from '../constants/colors';
import { authApi } from '../lib/api/auth.api';
import { useAuthStore } from '../lib/store/auth.store';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

export const VerifyEmailScreen = ({ navigation, route }: Props) => {
  const { email } = route.params;
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start 60-second resend cooldown on mount
  useEffect(() => {
    startCooldown();
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = async () => {
    if (otp.trim().length !== 6) {
      setError('enter the 6-digit code from your email');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await authApi.verifyOtp(email, otp.trim());
      await setAuth(result.user, result.token);
      navigation.reset({ index: 0, routes: [{ name: 'Upload' }] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('expired')) {
        setError('code expired — tap resend to get a new one');
      } else if (msg.toLowerCase().includes('invalid')) {
        setError('incorrect code — check your email and try again');
      } else {
        setError(msg || 'could not verify — please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authApi.sendOtp(email);
      startCooldown();
      setError(null);
    } catch {
      setError('could not resend — please try again');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingTop: 40, paddingBottom: 32 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.dark }}>
            check your inbox ✦
          </Text>
          <Text style={{ fontSize: 14, color: Colors.muted, marginTop: 6, lineHeight: 20 }}>
            we sent a 6-digit code to{'\n'}
            <Text style={{ color: Colors.orange, fontWeight: '700' }}>{email}</Text>
          </Text>
        </View>

        <TextInput
          value={otp}
          onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          placeholderTextColor={Colors.border}
          keyboardType="number-pad"
          maxLength={6}
          style={{
            borderWidth: 2,
            borderColor: otp.length === 6 ? Colors.orange : Colors.border,
            borderRadius: 14,
            paddingHorizontal: 20,
            paddingVertical: 18,
            fontSize: 28,
            fontWeight: '800',
            letterSpacing: 10,
            color: Colors.dark,
            backgroundColor: Colors.white,
            textAlign: 'center',
            marginBottom: 16,
          }}
        />

        {error ? (
          <Text style={{ color: 'red', fontSize: 13, marginBottom: 12 }}>{error}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleVerify}
          disabled={loading || otp.trim().length !== 6}
          style={{
            backgroundColor: otp.trim().length === 6 ? Colors.orange : Colors.orangeLight,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.white }}>
              verify →
            </Text>
          )}
        </TouchableOpacity>

        {/* Resend button */}
        <TouchableOpacity
          onPress={handleResend}
          disabled={resendCooldown > 0}
          style={{ alignItems: 'center', paddingVertical: 10 }}
        >
          <Text style={{ fontSize: 13, color: resendCooldown > 0 ? Colors.muted : Colors.orange, fontWeight: '600' }}>
            {resendCooldown > 0
              ? `resend code in ${resendCooldown}s`
              : 'resend code'}
          </Text>
        </TouchableOpacity>

        {/* Back to register */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={{ alignItems: 'center', paddingVertical: 8 }}
        >
          <Text style={{ fontSize: 13, color: Colors.muted }}>
            wrong email? go back
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Screen>
  );
};
