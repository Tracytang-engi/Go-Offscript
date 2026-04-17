import type { Mentor } from '../types';

/** Parse "Role @ Company" title from backend */
export const companyFromMentorTitle = (title: string): string => {
  const idx = title.lastIndexOf(' @ ');
  if (idx === -1) return '';
  return title.slice(idx + 4).trim();
};

export const buildMentorLinkedInSearchUrl = (mentor: Mentor): string => {
  if (mentor.linkedinUrl) return mentor.linkedinUrl;
  const company = companyFromMentorTitle(mentor.title);
  const keywords = [mentor.name, company].filter(Boolean).join(' ');
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keywords)}`;
};
