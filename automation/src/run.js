import { ENV } from "./env.js";
import { brainstormIdeas } from "./ideas.js";
import { generateStoryPlan, generateCharacterBible, generateStoryPages, createIllustrationPrompt } from "./storyPipeline.js";
import { generateBatch } from "./imageGen.js";
import { uploadToR2 } from "./storage.js";
import { composeStorybookPdf } from "./pdf.js";
import { publishToGumroad } from "./gumroad.js";
import { buildPackageDescription, buildPackageTags } from "./publishingPackage.js";

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || "book";
}

async function generateOneBook(idea, index, dateFolder) {
  const label = `book ${index + 1} ("${idea.storyIdea.slice(0, 40)}...")`;
  console.log(`\n=== Starting ${label} ===`);

  const book = {
    storyIdea: idea.storyIdea,
    ageGroup: idea.ageGroup,
    moral: idea.moral,
    language: "English",
    pageCount: idea.pageCount || 8,
    visualStyle: idea.visualStyle,
  };

  const plan = await generateStoryPlan(book);
  console.log(`[${label}] Story plan ready: "${plan.title}"`);

  const characters = await generateCharacterBible(book, plan);
  console.log(`[${label}] Character bible ready: ${characters.map(c => c.name).join(", ")}`);

  const pages = await generateStoryPages(book, plan, characters);
  console.log(`[${label}] Manuscript ready: ${pages.length} pages`);

  const slug = slugify(plan.title);
  const folder = `storybooks/${dateFolder}/${slug}`;

  const coverPrompt = createIllustrationPrompt({
    visualPrompt: `A joyful, inviting cover scene introducing ${characters.map(c => c.name).join(" and ")} and the story's setting.`,
    visualStyle: book.visualStyle,
    characters,
    isCover: true,
  });
  const coverResult = await generateBatch([{ prompt: coverPrompt, visualStyle: book.visualStyle, label: `${label} cover` }], 1);
  const coverBuffer = coverResult[0]?.buffer || null;
  if (coverBuffer) await uploadToR2(`${folder}/cover.jpg`, coverBuffer, "image/jpeg");

  const pageJobs = pages.map(page => ({
    prompt: createIllustrationPrompt({ visualPrompt: page.visualPrompt, visualStyle: book.visualStyle, characters }),
    visualStyle: book.visualStyle,
    label: `${label} page ${page.pageNumber}`,
  }));
  const pageResults = await generateBatch(pageJobs, 2);

  let failedPages = 0;
  const pdfPages = [];
  for (let i = 0; i < pages.length; i += 1) {
    const image = pageResults[i];
    if (image) {
      await uploadToR2(`${folder}/page-${String(pages[i].pageNumber).padStart(2, "0")}.jpg`, image.buffer, image.contentType);
    } else {
      failedPages += 1;
    }
    pdfPages.push({ pageNumber: pages[i].pageNumber, storyText: pages[i].storyText, imageBuffer: image?.buffer || null });
  }
  if (failedPages) console.warn(`[${label}] ${failedPages} of ${pages.length} illustrations failed after all retries.`);

  const pdfBuffer = await composeStorybookPdf({ title: plan.title, moral: plan.moral, authorName: ENV.authorName, pages: pdfPages, coverBuffer });
  const pdfUrl = await uploadToR2(`${folder}/${slug}.pdf`, pdfBuffer, "application/pdf");
  console.log(`[${label}] PDF assembled and stored: ${pdfUrl}`);

  const description = buildPackageDescription({
    title: plan.title, authorName: ENV.authorName, ageGroup: book.ageGroup, genre: "storybook",
    tone: "warm", moral: plan.moral, language: book.language, pageCount: book.pageCount, theme: plan.theme,
  });
  const tags = buildPackageTags({ genre: "storybook", ageGroup: book.ageGroup, language: book.language }).split(", ");

  const publishResult = await publishToGumroad({ title: plan.title, description, priceCents: ENV.gumroadDefaultPriceCents, tags, pdfBuffer, filename: `${slug}.pdf` });
  console.log(`[${label}] Publish status: ${publishResult.status}${publishResult.note ? " - " + publishResult.note : ""}`);

  return { title: plan.title, slug, pdfUrl, failedPages, publish: publishResult };
}

async function main() {
  const dateFolder = new Date().toISOString().slice(0, 10);
  const ideas = await brainstormIdeas(ENV.booksPerDay);
  console.log(`Generating ${ideas.length} book(s) for ${dateFolder}...`);

  const results = [];
  for (let i = 0; i < ideas.length; i += 1) {
    try {
      const result = await generateOneBook(ideas[i], i, dateFolder);
      results.push({ ok: true, ...result });
    } catch (error) {
      console.error(`Book ${i + 1} failed entirely: ${error.message}`);
      results.push({ ok: false, idea: ideas[i].storyIdea, error: error.message });
    }
  }

  console.log("\n=== Daily run summary ===");
  for (const result of results) {
    if (result.ok) {
      console.log(`✓ "${result.title}" -> ${result.pdfUrl} (${result.publish.status}${result.failedPages ? `, ${result.failedPages} illustration(s) failed` : ""})`);
    } else {
      console.log(`✗ Failed: "${result.idea}" - ${result.error}`);
    }
  }

  const failedBooks = results.filter(r => !r.ok).length;
  if (failedBooks === results.length && results.length > 0) {
    console.error("Every book in this run failed.");
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error("Fatal error in automation run:", error);
  process.exitCode = 1;
});
