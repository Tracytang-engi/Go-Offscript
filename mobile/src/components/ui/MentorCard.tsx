import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Colors } from '../../constants/colors';
import type { Mentor } from '../../types';
import { buildMentorLinkedInSearchUrl } from '../../lib/mentorUtils';

interface MentorCardProps {
  mentor: Mentor;
  saved?: boolean;
  onToggleSave?: () => void;
}

export const MentorCard = ({ mentor, saved, onToggleSave }: MentorCardProps) => {
  const initials = mentor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleChat = () => {
    Linking.openURL(buildMentorLinkedInSearchUrl(mentor)).catch(() => {});
  };

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
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        {/* Avatar */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: Colors.orangeLight,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.orange }}>
            {initials}
          </Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.dark }}>
            {mentor.name}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.orange, fontWeight: '600', marginTop: 1 }}>
            {mentor.title}
          </Text>
        </View>

        {/* Star save button */}
        {onToggleSave !== undefined && (
          <TouchableOpacity onPress={onToggleSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ fontSize: 20, color: saved ? '#FBBF24' : '#D1D5DB' }}>
              {saved ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        )}

        {/* LinkedIn badge */}
        <View style={{
          backgroundColor: '#EEF2FF',
          borderRadius: 8,
          paddingHorizontal: 8,
          paddingVertical: 4,
        }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#4338CA' }}>in</Text>
        </View>
      </View>

      {/* Bio */}
      {mentor.bio ? (
        <Text style={{
          fontSize: 13, color: Colors.dark, lineHeight: 19,
          marginTop: 10, marginBottom: 10,
        }}>
          {mentor.bio}
        </Text>
      ) : null}

      {/* Expertise tags */}
      {mentor.expertise.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {mentor.expertise.slice(0, 3).map((tag) => (
            <View
              key={tag}
              style={{
                backgroundColor: Colors.cream,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <Text style={{ fontSize: 11, color: Colors.muted, fontWeight: '600' }}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Chat button */}
      <TouchableOpacity
        onPress={handleChat}
        style={{
          backgroundColor: Colors.orange,
          borderRadius: 999,
          paddingVertical: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.white }}>
          find on LinkedIn →
        </Text>
      </TouchableOpacity>
    </View>
  );
};
