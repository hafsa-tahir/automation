import { invokeJson } from "./llm.js";

export const THEMES = [
  "friendship and kindness in a magical forest",
  "a child's first day facing a new fear, told gently",
  "an animal who is different from the others and finds where they belong",
  "sibling teamwork solving a small mystery",
  "curiosity about nature and the changing seasons",
  "honesty after making a small mistake",
  "a bedtime adventure with a comforting return home",
  "courage helping a friend in a bind",
  "sharing and generosity at a birthday or celebration",
  "a child inventing something clever to solve a problem",
];

const AGE_GROUPS = ["4-6 years", "6-8 years"];
const VISUAL_STYLES = ["Children's Storybook", "Watercolor", "Soft Digital Illustration", "Cute Fantasy"];

function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86_400_000);
}

function pick(list, offset) {
  return list[((offset % list.length) + list.length) % list.length];
}

function fallbackIdeas(count) {
  const seed = dayOfYear();
  return Array.from({ length: count }, (_, i) => {
    const theme = pick(THEMES, seed + i);
    return {
      storyIdea: `A short children's story about ${theme}.`,
      ageGroup: pick(AGE_GROUPS, seed + i),
      moral: "Custom",
      visualStyle: pick(VISUAL_STYLES, seed + i),
      pageCount: 8,
    };
  });
}

export async function brainstormIdeas(count) {
  try {
    const seed = dayOfYear();
    const themesToday = Array.from({ length: count }, (_, i) => pick(THEMES, seed + i));
    const result = await invokeJson({
      system: "You are a children's book acquisitions editor brainstorming fresh, specific, and wholesome story ideas for illustrated storybooks. JSON shape: { \"ideas\": [ { \"storyIdea\": string, \"ageGroup\": string, \"moral\": string, \"visualStyle\": string, \"pageCount\": number } ] }. ageGroup must be one of: \"2-4 years\", \"4-6 years\", \"6-8 years\", \"8-10 years\". visualStyle must be one of: \"Children's Storybook\", \"Watercolor\", \"Cartoon\", \"3D Animated\", \"Soft Digital Illustration\", \"Cute Fantasy\". pageCount should be 6, 8, or 10.",
      user: `Generate ${count} distinct, concrete story ideas (one or two sentences each, with a specific character and situation, not generic) inspired loosely by these themes: ${themesToday.join(" | ")}.`,
    });
    const ideas = result.ideas || [];
    if (ideas.length !== count) throw new Error("Brainstorm returned the wrong number of ideas.");
    return ideas;
  } catch (error) {
    console.warn(`[ideas] Brainstorm failed (${error.message}), using fallback ideas instead.`);
    return fallbackIdeas(count);
  }
}
