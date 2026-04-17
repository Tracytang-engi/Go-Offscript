import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Colors } from '../../constants/colors';
import type { Opportunity, OpportunityType } from '../../types';

const TYPE_LABEL: Record<OpportunityType, string> = {
  INTERNSHIP: 'INTERNSHIP',
  FELLOWSHIP: 'FELLOWSHIP',
  SHORT_PROJECT: 'SHORT PROJECT',
  COACHING: 'COACHING',
  MEETUP: 'MEETUP',
};

const TYPE_EMOJI: Record<OpportunityType, string> = {
  INTERNSHIP: '💼',
  FELLOWSHIP: '🌱',
  SHORT_PROJECT: '🛠',
  COACHING: '💬',
  MEETUP: '📍',
};

const getDeadlineBadgeStyle = (deadline?: string) => {
  if (!deadline) return { bg: Colors.cream, text: Colors.muted };
  const d = deadline.toLowerCase();
  if (d.includes('open') || d.includes('rolling') || d.includes('anytime'))
    return { bg: Colors.greenBadge ?? '#D1FAE5', text: '#065F46' };
  if (d.includes('close') || d.includes('may') || d.includes('june') || d.includes('april'))
    return { bg: '#FEE2E2', text: '#9B2335' };
  return { bg: Colors.cream, text: Colors.muted };
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  saved?: boolean;
  onToggleSave?: () => void;
  onPress?: () => void;
}

export const OpportunityCard = ({ opportunity, saved, onToggleSave, onPress }: OpportunityCardProps) => {
  const badgeStyle = getDeadlineBadgeStyle(opportunity.deadline);
  const hasApplyLink = !!opportunity.url;

  const handleApply = () => {
    if (opportunity.url) {
      Linking.openURL(opportunity.url).catch(() => {});
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
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
        borderWidth: hasApplyLink ? 1 : 0,
        borderColor: hasApplyLink ? Colors.orangeMuted : 'transparent',
      }}
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 14 }}>{TYPE_EMOJI[opportunity.type]}</Text>
          <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.orange, letterSpacing: 0.5 }}>
            {TYPE_LABEL[opportunity.type]}
          </Text>
        </View>
        {opportunity.deadline ? (
          <View style={{ backgroundColor: badgeStyle.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: badgeStyle.text }}>
              {opportunity.deadline}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 2 }}>
        {opportunity.title}
      </Text>
      <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 8, fontWeight: '600' }}>
        {opportunity.organization}
      </Text>
      <Text style={{ fontSize: 13, color: Colors.dark, marginBottom: 10, lineHeight: 19 }}>
        {opportunity.description}
      </Text>

      {/* Tags */}
      {opportunity.tags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {opportunity.tags.slice(0, 3).map((tag) => (
            <View
              key={tag}
              style={{ backgroundColor: Colors.orangeLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}
            >
              <Text style={{ fontSize: 11, color: Colors.orange, fontWeight: '600' }}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer: social proof + apply + star */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {opportunity.peerCount > 0 ? (
          <Text style={{ fontSize: 12, color: Colors.muted }}>
            {opportunity.peerCount} people like you →
          </Text>
        ) : <View />}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {hasApplyLink ? (
            <TouchableOpacity
              onPress={handleApply}
              style={{
                backgroundColor: Colors.orange,
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 7,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.white }}>
                apply →
              </Text>
            </TouchableOpacity>
          ) : null}

          {onToggleSave !== undefined && (
            <TouchableOpacity onPress={onToggleSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ fontSize: 20, color: saved ? '#FBBF24' : '#D1D5DB' }}>
                {saved ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
