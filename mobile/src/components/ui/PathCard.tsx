import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';
import type { PathScore } from '../../types';

interface PathCardProps {
  score: PathScore;
}

export const PathCard = ({ score }: PathCardProps) => (
  <View
    style={{
      backgroundColor: Colors.white,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 2,
    }}
  >
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.dark, flex: 1, marginRight: 8 }}>
        {score.pathTitle}
      </Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.orange }}>
        {score.matchScore}%
      </Text>
    </View>

    {/* Progress bar */}
    <View
      style={{
        height: 6,
        backgroundColor: Colors.orangeLight,
        borderRadius: 999,
        marginTop: 10,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          height: 6,
          width: `${score.matchScore}%`,
          backgroundColor: Colors.orange,
          borderRadius: 999,
        }}
      />
    </View>

    {score.label ? (
      <View style={{ alignSelf: 'flex-start' }}>
        <View
          style={{
            backgroundColor: score.rank === 1 ? Colors.orange : Colors.cream,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderWidth: score.rank === 1 ? 0 : 1,
            borderColor: Colors.border,
          }}
        >
          <Text
            style={{
              color: score.rank === 1 ? Colors.white : Colors.muted,
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            {score.label}
          </Text>
        </View>
      </View>
    ) : null}
  </View>
);
