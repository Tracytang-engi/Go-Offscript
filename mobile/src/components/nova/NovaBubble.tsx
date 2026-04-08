import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface NovaBubbleProps {
  message: string;
  subtitle?: string;
}

const NovaIcon = () => (
  <View
    style={{
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: Colors.orangeLight,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text style={{ fontSize: 18 }}>✦</Text>
  </View>
);

export const NovaBubble = ({ message, subtitle = 'your career bestie' }: NovaBubbleProps) => (
  <View
    style={{
      backgroundColor: Colors.white,
      borderRadius: 20,
      padding: 16,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 3,
    }}
  >
    {/* Nova header */}
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <NovaIcon />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.dark }}>nova ✨</Text>
          {/* Online dot */}
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: Colors.greenDot,
              marginLeft: 4,
            }}
          />
        </View>
        <Text style={{ fontSize: 11, color: Colors.muted }}>{subtitle}</Text>
      </View>
    </View>

    {/* Message */}
    <Text style={{ fontSize: 15, color: Colors.dark, lineHeight: 22 }}>{message}</Text>

    {/* Nova decoration bottom right */}
    <Text
      style={{
        position: 'absolute',
        bottom: 10,
        right: 14,
        fontSize: 16,
        opacity: 0.3,
      }}
    >
      ✦
    </Text>
  </View>
);
