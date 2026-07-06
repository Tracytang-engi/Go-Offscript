import type { Mentor } from '../types';

/** Parse "Role @ Company" title from backend */
export const companyFromMentorTitle = (title: string): string => {
  const idx = title.lastIndexOf(' @ ');
  if (idx === -1) return '';
  return title.slice(idx + 4).trim();
};

export const buildMentorLinkedInSearchUrl = (mentor: Mentor): string => {
  // Name only — adding title/company keywords hurts search accuracy and causes no-match results
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(mentor.name)}`;
};
