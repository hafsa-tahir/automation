import { invokeJson } from "./llm.js";

function bookBrief(book) {
  return [
    `Story idea: ${book.storyIdea}`,
    `Audience age group: ${book.ageGroup}`,
    `Moral: ${book.moral || "Choose an age-appropriate positive lesson that fits the idea."}`,
    `Language: ${book.language || "English"}`,
    `Requested story pages: exactly ${book.pageCount}`,
    `Visual style: ${book.visualStyle}`,
    "Book format: a professional landscape children's storybook. Story text is typeset separately by the application, never inside generated artwork.",
  ].join("\n");
}

export async function generateStoryPlan(book) {
  return invokeJson({
    system: "You are a senior children's book editor. Create one concise, age-appropriate story plan with a memorable title, emotional theme, clear moral, and beginning-middle-ending narrative arc. JSON shape: { \"title\": string, \"theme\": string, \"moral\": string, \"narrativeArc\": string }.",
    user: `${bookBrief(book)}\n\nCreate the high-level plan before character design or manuscript writing.`,
  });
}

export async function generateCharacterBible(book, plan) {
  const result = await invokeJson({
    system: "You are a senior children's book editor. Create a permanent, precise character bible for a coherent illustrated storybook. Each recurring character must have stable appearance, clothing, palette, and proportions so every illustration matches. JSON shape: { \"characters\": [ { \"name\": string, \"age\": string, \"species\": string, \"appearance\": string, \"personality\": string, \"clothing\": string, \"colorPalette\": string } ] }. Invent the smallest appropriate cast (usually 1-3 characters).",
    user: `${bookBrief(book)}\n\nApproved story plan:\n${JSON.stringify(plan)}\n\nCreate a complete character bible.`,
  });
  return result.characters || [];
}

export async function generateStoryPages(book, plan, characters) {
  const result = await invokeJson({
    system: "You are a senior children's book writer and art director. Write a fully page-by-page landscape picture-book manuscript. Each page needs read-aloud story text (55-90 words for younger children, 70-120 for older) and a detailed illustration prompt describing the scene, action, emotion, and setting for that page. The illustration prompt must preserve the character bible exactly and must explicitly forbid any text, letters, words, or watermarks appearing in the artwork. JSON shape: { \"pages\": [ { \"pageNumber\": number, \"storyText\": string, \"visualPrompt\": string } ] }.",
    user: `${bookBrief(book)}\n\nApproved story plan:\n${JSON.stringify(plan)}\n\nCharacter bible:\n${JSON.stringify(characters)}\n\nWrite exactly ${book.pageCount} pages, numbered consecutively from 1.`,
    maxTokens: 6000,
  });
  const pages = result.pages || [];
  if (pages.length !== book.pageCount) {
    throw new Error(`Writing service produced ${pages.length} pages instead of the requested ${book.pageCount}.`);
  }
  return pages;
}

function characterBibleText(characters) {
  return characters.map(c => [
    `${c.name} (${c.species || "character"}, ${c.age || "age unspecified"})`,
    `appearance: ${c.appearance}`,
    `clothing: ${c.clothing || "not specified"}`,
    `palette: ${c.colorPalette || "not specified"}`,
    `personality: ${c.personality || "not specified"}`,
  ].join("; ")).join("\n");
}

export function createIllustrationPrompt({ visualPrompt, visualStyle, characters, isCover = false }) {
  return [
    `Create a premium children's storybook illustration in ${visualStyle}.`,
    isCover
      ? "This is horizontal landscape cover artwork, with a strong central subject and clear edge space for separately rendered title and author typography."
      : "This is a horizontal landscape storybook-page illustration designed to work with a separate reading panel.",
    "Recurring character bible (preserve exact identity, clothing, palette, and proportions):",
    characterBibleText(characters),
    "Scene direction:",
    visualPrompt,
    "Do not add any text, typography, captions, logos, watermarks, numbers, letterforms, or speech bubbles. no text, no letters, no words, no watermark.",
  ].join("\n\n");
}
