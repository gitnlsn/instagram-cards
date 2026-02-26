import type { SKRSContext2D } from "@napi-rs/canvas";
import { BRAND } from "../brand.js";
import type { CardContent } from "../gemini.js";

const PAD_X = 72;
const PAD_Y = 100;
const CONTENT_WIDTH = BRAND.card.width - PAD_X * 2; // 936

/** Simple word-wrap: returns lines that fit within maxWidth. */
function wrapText(
  ctx: SKRSContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Draw a rounded rectangle (fill). */
function fillRoundRect(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

export function drawCard(
  ctx: SKRSContext2D,
  card: CardContent,
  index: number,
  total: number
): void {
  const { width, height } = BRAND.card;
  const isLast = index === total - 1;
  const centerX = width / 2;

  // Background — light cream
  ctx.fillStyle = BRAND.colors.lightBg;
  ctx.fillRect(0, 0, width, height);

  // --- Brand handle at top (centered, small, spaced letters) ---
  const handleY = 60;
  ctx.font = "400 20px Inter";
  ctx.fillStyle = BRAND.colors.textBody;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.letterSpacing = "4px";
  ctx.fillText("voiledrift", centerX, handleY);
  ctx.letterSpacing = "0px";

  // --- Content area ---
  const contentTop = handleY + 60;
  const contentBottom = height - PAD_Y;
  const contentHeight = contentBottom - contentTop;

  // Pre-calculate all element heights
  const titleFontSize = 48;
  const titleLineHeight = titleFontSize * 1.2;
  const titleMarginBottom = 0; // divider provides spacing

  const dividerMarginTop = 36;
  const dividerH = 3;
  const dividerMarginBottom = 36;

  const bodyFontSize = 26;
  const bodyLineHeight = bodyFontSize * 1.6;

  // Measure title lines
  ctx.font = `800 ${titleFontSize}px Inter`;
  const titleLines = wrapText(ctx, card.title, CONTENT_WIDTH);

  // Measure body lines
  ctx.font = `400 ${bodyFontSize}px Inter`;
  const bodyMaxWidth = Math.min(880, CONTENT_WIDTH);
  const bodyLines = wrapText(ctx, card.body, bodyMaxWidth);

  // CTA height (last card only)
  const ctaH = isLast ? 28 + 24 * 2 : 0;
  const ctaMarginTop = isLast ? 40 : 0;

  // URL height (last card only)
  const urlH = isLast ? 22 : 0;
  const urlMarginTop = isLast ? 20 : 0;

  // Footnote
  const footnoteH = card.footnote ? 20 : 0;
  const footnoteMarginTop = card.footnote ? 32 : 0;

  // Total content height
  const totalContentH =
    titleLines.length * titleLineHeight + titleMarginBottom +
    dividerMarginTop + dividerH + dividerMarginBottom +
    bodyLines.length * bodyLineHeight +
    ctaMarginTop + ctaH +
    urlMarginTop + urlH +
    footnoteMarginTop + footnoteH;

  let y: number;
  y = contentTop + Math.max(0, (contentHeight - totalContentH) / 2);

  // --- Title (centered) ---
  ctx.font = `800 ${titleFontSize}px Inter`;
  ctx.fillStyle = BRAND.colors.textDark;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (const line of titleLines) {
    ctx.fillText(line, centerX, y);
    y += titleLineHeight;
  }

  // --- Divider line (centered, short) ---
  y += dividerMarginTop;
  const dividerWidth = 140;
  ctx.fillStyle = BRAND.colors.textDark;
  ctx.fillRect(centerX - dividerWidth / 2, y, dividerWidth, dividerH);
  y += dividerH + dividerMarginBottom;

  // --- Body (centered) ---
  ctx.font = `400 ${bodyFontSize}px Inter`;
  ctx.fillStyle = BRAND.colors.textBody;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (const line of bodyLines) {
    ctx.fillText(line, centerX, y);
    y += bodyLineHeight;
  }

  // --- CTA (last card, centered) ---
  if (isLast) {
    y += ctaMarginTop;
    const ctaText = "Try Voile Drift →";
    ctx.font = "700 28px Inter";
    const ctaTextWidth = ctx.measureText(ctaText).width;
    const ctaPadX = 48;
    const ctaPadY = 24;
    const ctaW = ctaTextWidth + ctaPadX * 2;
    const ctaTotalH = 28 + ctaPadY * 2;
    const ctaX = centerX - ctaW / 2;

    ctx.fillStyle = BRAND.colors.primary;
    fillRoundRect(ctx, ctaX, y, ctaW, ctaTotalH, 16);

    ctx.fillStyle = BRAND.colors.white;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ctaText, centerX, y + ctaTotalH / 2);

    y += ctaTotalH + urlMarginTop;

    // URL below CTA (centered)
    ctx.font = "400 22px Inter";
    ctx.fillStyle = BRAND.colors.textBody;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(BRAND.url, centerX, y);
  }

  // --- Footnote ---
  if (card.footnote) {
    const footnoteY = contentBottom - footnoteH;
    ctx.font = "400 20px Inter";
    ctx.fillStyle = BRAND.colors.textBody;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(card.footnote.toUpperCase(), centerX, footnoteY);
  }
}
