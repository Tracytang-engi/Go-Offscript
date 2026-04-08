import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';

const STEP_LABELS = ['welcome', 'upload', 'values', 'your path', 'ways in'];

interface ProgressDotsProps {
  current: number; // 1-indexed
  total?: number;
}

export const ProgressDots = ({ current, total = 5 }: ProgressDotsProps) => (
  <View style={{ alignItems: 'center', paddingVertical: 16 }}>
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i + 1 === current ? 20 : 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: i + 1 === current ? Colors.orange : Colors.border,
          }}
        />
      ))}
    </View>
    <Text style={{ fontSize: 11, color: Colors.muted }}>
      {current} of {total} — {STEP_LABELS[current - 1] ?? ''}
    </Text>
  </View>
);
