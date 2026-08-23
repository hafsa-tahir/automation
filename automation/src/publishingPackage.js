export function buildPackageDescription(book) {
  const themeLine = book.theme || book.moral || "A gentle read-aloud adventure with a hopeful ending.";
  return [
    `${book.title} is a ${book.pageCount}-page illustrated storybook for ${book.ageGroup}.`,
    `Written in ${book.language} with a ${book.tone.toLowerCase()} tone, it is designed for cozy read-aloud moments and independent young readers.`,
    themeLine,
    `Includes a printable landscape PDF edition by ${book.authorName}.`,
  ].join("\n\n");
}

export function buildPackageTags(book) {
  return ["children's storybook", "printable PDF", book.genre, book.ageGroup, book.language]
    .map(tag => tag.trim())
    .filter(Boolean)
    .join(", ");
}
