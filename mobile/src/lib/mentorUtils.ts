import type { Mentor } from '../types';

/** Parse "Role @ Company" title from backend */
export const companyFromMentorTitle = (title: string): string => {
  const idx = title.lastIndexOf(' @ ');
  if (idx === -1) return '';
  return title.slice(idx + 4).trim();
};

const stripAcademicTitle = (name: string): string =>
  name.replace(/^(Dr\.?\s+|Prof\.?\s+|Professor\s+|Mr\.?\s+|Ms\.?\s+|Mrs\.?\s+)/i, '').trim();

export const buildMentorLinkedInSearchUrl = (mentor: Mentor): string => {
  const cleanName = stripAcademicTitle(mentor.name);
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(cleanName)}`;
};
