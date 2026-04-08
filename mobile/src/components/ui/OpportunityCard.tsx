import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';
import type { Opportunity, OpportunityType } from '../../types';

const TYPE_LABEL: Record<OpportunityType, string> = {
  INTERNSHIP: 'INTERNSHIP',
  FELLOWSHIP: 'FELLOWSHIP',
  SHORT_PROJECT: 'SHORT PROJECT',
  COACHING: 'COACHING',
  MEETUP: 'MEETUP',
};

const getDeadlineBadgeStyle = (deadline?: string) => {
  if (!deadline) return { bg: Colors.cream, text: Colors.muted };
  const d = deadline.toLowerCase();
  if (d.includes('open')) return { bg: Colors.greenBadge, text: '#065F46' };
  if (d.includes('close') || d.includes('may') || d.includes('june'))
    return { bg: Colors.salmon, text: '#9B2335' };
  return { bg: Colors.cream, text: Colors.muted };
};

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export const OpportunityCard = ({ opportunity }: OpportunityCardProps) => {
  const badgeStyle = getDeadlineBadgeStyle(opportunity.deadline);

  return (
    <View
      style={{
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.orange, letterSpacing: 0.5 }}>
          {TYPE_LABEL[opportunity.type]}
        </Text>
        {opportunity.deadline ? (
          <View
            style={{
              backgroundColor: badgeStyle.bg,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: badgeStyle.text }}>
              {opportunity.deadline}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 4 }}>
        {opportunity.title}
      </Text>
      <Text style={{ fontSize: 13, color: Colors.muted, marginBottom: 10, lineHeight: 18 }}>
        {opportunity.description}
      </Text>

      {/* Tags */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {opportunity.tags.slice(0, 2).map((tag) => (
          <View
            key={tag}
            style={{
              backgroundColor: Colors.orangeLight,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 12, color: Colors.orange }}>🎯 {tag}</Text>
          </View>
        ))}
      </View>

      {/* Social proof */}
      {opportunity.peerCount > 0 ? (
        <Text style={{ fontSize: 12, color: Colors.muted }}>
          <Text style={{ color: Colors.orange }}>→ </Text>
          {opportunity.peerCount} people like you came through this
        </Text>
      ) : null}
    </View>
  );
};
