import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface SkillChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const SkillChip = ({ label, selected = false, onPress }: SkillChipProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{
      backgroundColor: selected ? Colors.orange : Colors.white,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: selected ? Colors.orange : Colors.border,
      paddingHorizontal: 14,
      paddingVertical: 7,
      margin: 4,
    }}
  >
    <Text
      style={{
        color: selected ? Colors.white : Colors.dark,
        fontSize: 13,
        fontWeight: '500',
      }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);
