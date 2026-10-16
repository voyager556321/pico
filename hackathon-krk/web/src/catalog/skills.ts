export const SKILLS = [
  { id: 1, label: "Code review" },
  { id: 2, label: "Debugging" },
  { id: 3, label: "QA" },
  { id: 4, label: "Design" },
] as const;

export type SkillId = (typeof SKILLS)[number]["id"];
