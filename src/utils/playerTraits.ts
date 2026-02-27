
const personalityTerms = {
  0: "unpredictable",
  3: "poor",
  6: "decent",
  9: "pleasant",
  12: "excellent",
  15: "divine"
};

const experienceTerms = {
  0: "inexperienced",
  3: "poor",
  6: "decent",
  9: "experienced",
  12: "powerful",
  15: "divine"
};

const leadershipTerms = {
  0: "wretched",
  3: "poor",
  6: "decent",
  9: "strong",
  12: "excellent",
  15: "divine"
};

const loyaltyTerms = {
  0: "disloyal",
  3: "questionable",
  6: "loyal",
  9: "faithful",
  12: "dedicated",
  15: "divine"
};

const getTerm = (value: number, terms: Record<number, string>): string => {
  const levels = Object.keys(terms).map(Number);
  const level = levels.find((l, i) => value >= l && (i === levels.length - 1 || value < levels[i + 1])) || 0;
  return terms[level];
};

export const generatePersonalityDescription = (
  personality: number,
  experience: number,
  leadership: number,
  loyalty: number
): string => {
  const personalityTerm = getTerm(personality, personalityTerms);
  const experienceTerm = getTerm(experience, experienceTerms);
  const leadershipTerm = getTerm(leadership, leadershipTerms);
  const loyaltyTerm = getTerm(loyalty, loyaltyTerms);

  return `A ${personalityTerm} player with ${experienceTerm} experience. Shows ${leadershipTerm} leadership qualities and ${loyaltyTerm} commitment to the team.`;
};

// Add additional utility functions for player trait descriptions
export const getPersonalityTerm = (value: number): string => {
  return getTerm(value, personalityTerms);
};

export const getExperienceTerm = (value: number): string => {
  return getTerm(value, experienceTerms);
};

export const getLeadershipTerm = (value: number): string => {
  return getTerm(value, leadershipTerms);
};

export const getLoyaltyTerm = (value: number): string => {
  return getTerm(value, loyaltyTerms);
};
