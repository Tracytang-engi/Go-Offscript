import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface GhostButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const GhostButton = ({ label, onPress, style }: GhostButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[{ paddingVertical: 16, alignItems: 'center' }, style]}
  >
    <Text style={{ color: Colors.muted, fontSize: 15 }}>{label}</Text>
  </TouchableOpacity>
);
