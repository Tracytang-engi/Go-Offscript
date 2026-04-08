/**
 * Local mock data used when the backend is unreachable.
 * All functions return the same shape as the real API responses
 * so screens don't need to know which source was used.
 */
import type { User, CareerPath, Opportunity, Value } from '../../types';

export const MOCK_USER: User = {
  id: 'local-user',
  name: 'You',
  email: 'local@gooffscript.app',
  createdAt: new Date().toISOString(),
};

export const MOCK_TOKEN = 'offline-mode-token';

export const MOCK_VALUES: Value[] = [
  { id: 'financial_security', key: 'financial_security', label: 'Financial Security', emoji: '💰' },
  { id: 'creativity', key: 'creativity', label: 'Creativity', emoji: '🎨' },
  { id: 'making_impact', key: 'making_impact', label: 'Making Impact', emoji: '🌱' },
  { id: 'discovery', key: 'discovery', label: 'Discovery', emoji: '🔬' },
  { id: 'community', key: 'community', label: 'Community', emoji: '🍯' },
  { id: 'work_life_balance', key: 'work_life_balance', label: 'Work-Life Balance', emoji: '⚖️' },
  { id: 'building_things', key: 'building_things', label: 'Building Things', emoji: '🚀' },
  { id: 'growth_and_status', key: 'growth_and_status', label: 'Growth & Status', emoji: '📈' },
];

export const MOCK_PATH: CareerPath = {
  id: 'mock-path',
  primaryPath: 'Finance + Creative Direction',
  secondaryPath: 'Creative Industries — Commercial',
  explanation: "okay i see you 👀 creativity AND financial security — your instincts say you want work that pays well AND means something. here's your path — no filter 🎯",
  tensionNote: 'creativity vs financial security creates a fork — creative roles pay less early on, but your background can bridge that gap faster than most',
  nextActions: [
    'Look into creative strategy roles at financial services firms',
    'Build a side portfolio of any visual/creative work you have',
    'Connect with people doing finance + brand work',
  ],
  pathScores: [
    { id: '1', pathTitle: 'Finance + Creative Direction', matchScore: 91, label: 'your sweet spot', rank: 1 },
    { id: '2', pathTitle: 'Creative Industries — Commercial', matchScore: 76, label: 'strong match', rank: 2 },
    { id: '3', pathTitle: 'Architecture & Built Environment', matchScore: 62, label: 'passion signal 🔥', rank: 3 },
  ],
};

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  { id: '1', title: 'Goldman Sachs Summer Analyst', organization: 'Goldman Sachs', description: 'Client-facing finance from day one.', type: 'INTERNSHIP', deadline: 'closes May', isOpen: true, tags: ['finance', 'investment banking'], peerCount: 4 },
  { id: '2', title: 'Wellcome Trust Fellowship', organization: 'Wellcome Trust', description: 'Funded research. No experience needed. Stipend + costs.', type: 'FELLOWSHIP', deadline: 'open now', isOpen: true, tags: ['research', 'fellowship'], peerCount: 3 },
  { id: '3', title: 'Freelance Creative Project', organization: 'Self-directed', description: 'Build your creative portfolio with short freelance work.', type: 'SHORT_PROJECT', deadline: 'anytime', isOpen: true, tags: ['creative', 'freelance'], peerCount: 7 },
  { id: '4', title: '1:1 Career Coaching Session', organization: 'Go Off Script Coaches', description: 'A focused session with a coach in your target industry.', type: 'COACHING', deadline: 'open now', isOpen: true, tags: ['coaching'], peerCount: 12 },
  { id: '5', title: 'Creative Careers Meetup', organization: 'Creative Mornings', description: 'Monthly community meetup for people building creative careers.', type: 'MEETUP', deadline: 'monthly', isOpen: true, tags: ['community', 'networking'], peerCount: 20 },
];
