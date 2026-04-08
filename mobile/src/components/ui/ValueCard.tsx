import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

interface ValueCardProps {
  label: string;
  emoji?: string;
  selected?: boolean;
  onPress?: () => void;
}

export const ValueCard = ({ label, emoji, selected = false, onPress }: ValueCardProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{
      flex: 1,
      backgroundColor: selected ? Colors.orange : Colors.white,
      borderRadius: 16,
      margin: 5,
      paddingVertical: 22,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 100,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    }}
  >
    {emoji ? (
      <Text style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</Text>
    ) : null}
    <Text
      style={{
        color: selected ? Colors.white : Colors.dark,
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
      }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);
