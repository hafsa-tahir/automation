import PDFDocument from "pdfkit";

const WIDTH = 792;
const HEIGHT = 612;
const MARGIN = 40;

function streamToBuffer(document) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    document.on("data", chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });
}

function drawImage(document, artwork, x, y, width, height, fallback = "#C6B399") {
  document.rect(x, y, width, height).fill(fallback);
  if (artwork) document.image(artwork, x, y, { cover: [width, height], align: "center", valign: "center" });
}

function drawReadingPanel(document, { storyText, pageNumber, authorName, x, y, width, height }) {
  const pad = Math.min(48, Math.max(24, width * 0.1));
  document.rect(x, y, width, height).fill("#FFF9F1");
  document.moveTo(x, y).lineTo(x, y + height).strokeColor("#D9C7AD").lineWidth(1).stroke();
  document.font("Helvetica").fontSize(8).fillColor("#9A8069").text(authorName.toUpperCase(), x + pad, y + pad, { width: width - pad * 2, characterSpacing: 1.1 });
  document.font("Times-Roman").fontSize(storyText.length > 380 ? 12 : 14).fillColor("#183F39").text(storyText, x + pad, y + pad + 34, { width: width - pad * 2, height: height - pad * 2 - 50, align: "left", lineGap: 3, ellipsis: true });
  document.font("Helvetica").fontSize(9).fillColor("#9A8069").text(String(pageNumber), x + pad, y + height - pad - 4, { width: width - pad * 2, align: "right" });
}

export async function composeStorybookPdf({ title, moral, authorName, pages, coverBuffer }) {
  const author = authorName || "A StoryForge author";
  const document = new PDFDocument({ size: [WIDTH, HEIGHT], margin: 0, info: { Title: title, Author: author } });
  const complete = streamToBuffer(document);

  drawImage(document, coverBuffer, 0, 0, WIDTH, HEIGHT, "#163F3A");
  document.rect(0, 0, WIDTH, HEIGHT).fillOpacity(0.34).fill("#163F3A").fillOpacity(1);
  document.fillColor("#F4D8A9").font("Helvetica").fontSize(10).text("STORYFORGE PRESENTS", MARGIN + 18, 157, { width: WIDTH * 0.42, characterSpacing: 1.4 });
  document.fillColor("#FFF8EA").font("Times-Bold").fontSize(48).text(title, MARGIN + 18, 195, { width: WIDTH * 0.45, lineGap: 2 });
  document.font("Times-Italic").fontSize(18).fillColor("#FFE4B0").text(`by ${author}`, MARGIN + 18, 340, { width: WIDTH * 0.42 });

  document.addPage();
  document.rect(0, 0, WIDTH, HEIGHT).fill("#FFF9F1");
  document.font("Times-Bold").fontSize(40).fillColor("#173F3A").text(title, MARGIN + 60, 220, { width: WIDTH - (MARGIN + 60) * 2, align: "center", lineGap: 4 });
  document.font("Times-Italic").fontSize(16).fillColor("#806A57").text(`by ${author}`, MARGIN, 330, { width: WIDTH - MARGIN * 2, align: "center" });

  for (const page of pages) {
    document.addPage();
    document.rect(0, 0, WIDTH, HEIGHT).fill("#FFF9F1");
    const illustrationWidth = Math.round(WIDTH * 0.5);
    drawImage(document, page.imageBuffer, 0, 0, illustrationWidth, HEIGHT);
    drawReadingPanel(document, { storyText: page.storyText, pageNumber: page.pageNumber, authorName: author, x: illustrationWidth, y: 0, width: WIDTH - illustrationWidth, height: HEIGHT });
  }

  document.addPage();
  document.rect(0, 0, WIDTH, HEIGHT).fill("#F3E4D0");
  document.font("Times-Bold").fontSize(34).fillColor("#173F3A").text("The End", MARGIN, 240, { width: WIDTH - MARGIN * 2, align: "center" });
  document.font("Times-Italic").fontSize(15).fillColor("#806A57").text(moral || "Made with imagination, one page at a time.", MARGIN + 60, 300, { width: WIDTH - (MARGIN + 60) * 2, align: "center", lineGap: 5 });

  document.end();
  return complete;
}
