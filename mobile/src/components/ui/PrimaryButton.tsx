import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const PrimaryButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
}: PrimaryButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.85}
    style={[
      {
        backgroundColor: disabled ? Colors.orangeMuted : Colors.orange,
        borderRadius: 999,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
      },
      style,
    ]}
  >
    {loading ? (
      <ActivityIndicator color={Colors.white} />
    ) : (
      <Text style={{ color: Colors.white, fontSize: 16, fontWeight: '600' }}>{label}</Text>
    )}
  </TouchableOpacity>
);
