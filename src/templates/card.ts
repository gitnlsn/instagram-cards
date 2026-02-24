import type { SKRSContext2D } from "@napi-rs/canvas";
import { BRAND } from "../brand.js";
import type { CardContent } from "../gemini.js";

const PAD_X = 72;
const PAD_Y = 80;
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

/** Draw the dots navigation bar at the bottom. */
function drawDots(
  ctx: SKRSContext2D,
  current: number,
  total: number,
  y: number
) {
  const dotH = 10;
  const activeDotW = 28;
  const inactiveDotW = 10;
  const gap = 8;

  let totalWidth = 0;
  for (let i = 0; i < total; i++) {
    totalWidth += (i === current ? activeDotW : inactiveDotW);
    if (i < total - 1) totalWidth += gap;
  }

  let x = PAD_X;

  for (let i = 0; i < total; i++) {
    const active = i === current;
    const w = active ? activeDotW : inactiveDotW;
    ctx.fillStyle = active ? BRAND.colors.primary : BRAND.colors.darkBgLight;
    fillRoundRect(ctx, x, y, w, dotH, 5);
    x += w + gap;
  }
}

export function drawCard(
  ctx: SKRSContext2D,
  card: CardContent,
  index: number,
  total: number
): void {
  const { width, height } = BRAND.card;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  // Background
  ctx.fillStyle = BRAND.colors.darkBg;
  ctx.fillRect(0, 0, width, height);

  // --- Dots bar at bottom ---
  const dotsBarY = height - 40 - 10; // 40px padding from bottom, 10px dot height
  drawDots(ctx, index, total, dotsBarY);

  // --- Content area ---
  const contentTop = PAD_Y;
  const contentBottom = dotsBarY - 40; // 40px padding above dots bar
  const contentHeight = contentBottom - contentTop;

  // We'll lay out elements top-down and track the Y cursor
  // For first/last cards, we center vertically; for middle cards, start from top

  // Pre-calculate all element heights to allow vertical centering
  const brandBarH = 44;
  const brandMarginBottom = isFirst ? 60 : 48;

  const titleFontSize = isFirst ? 72 : 52;
  const titleLineHeight = titleFontSize * 1.1;
  const titleMarginBottom = isFirst ? 32 : 36;

  const bodyFontSize = isFirst ? 30 : 32;
  const bodyLineHeight = bodyFontSize * 1.5;

  // Measure title lines
  ctx.font = `800 ${titleFontSize}px Inter`;
  const titleLines = wrapText(ctx, card.title, CONTENT_WIDTH);

  // Measure body lines
  ctx.font = `400 ${bodyFontSize}px Inter`;
  const bodyMaxWidth = Math.min(880, CONTENT_WIDTH);
  const bodyLines = wrapText(ctx, card.body, bodyMaxWidth);

  // Divider height (middle cards only)
  const dividerH = !isFirst && !isLast ? 4 : 0;
  const dividerMarginBottom = !isFirst && !isLast ? 36 : 0;

  // CTA height (last card only)
  const ctaH = isLast ? 28 + 24 * 2 : 0; // fontSize + vertical padding
  const ctaMarginTop = isLast ? 40 : 0;

  // Footnote
  const footnoteH = card.footnote ? 20 : 0;
  const footnoteMarginTop = card.footnote ? 32 : 0;

  // Total content height
  const totalContentH =
    brandBarH + brandMarginBottom +
    dividerH + dividerMarginBottom +
    titleLines.length * titleLineHeight + titleMarginBottom +
    bodyLines.length * bodyLineHeight +
    ctaMarginTop + ctaH +
    footnoteMarginTop + footnoteH;

  let y: number;
  y = contentTop + Math.max(0, (contentHeight - totalContentH) / 2);

  // --- Brand bar ---
  // Logo square
  ctx.fillStyle = BRAND.colors.primary;
  fillRoundRect(ctx, PAD_X, y, 44, 44, 10);
  // Logo text "VD"
  ctx.fillStyle = BRAND.colors.white;
  ctx.font = "800 22px Inter";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("VD", PAD_X + 22, y + 22);
  // Brand name
  ctx.fillStyle = BRAND.colors.textMuted;
  ctx.font = "600 24px Inter";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(BRAND.name, PAD_X + 44 + 14, y + 22);

  y += brandBarH + brandMarginBottom;

  // --- Divider (middle cards) ---
  if (!isFirst && !isLast) {
    ctx.fillStyle = BRAND.colors.primary;
    fillRoundRect(ctx, PAD_X, y, 60, 4, 2);
    y += dividerH + dividerMarginBottom;
  }

  // --- Title ---
  ctx.font = `800 ${titleFontSize}px Inter`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  for (let i = 0; i < titleLines.length; i++) {
    const line = titleLines[i];

    if (isFirst && i === titleLines.length - 1) {
      // Highlight last word of last line in primary color
      const words = line.split(" ");
      if (words.length > 1) {
        const lastWord = words.pop()!;
        const prefix = words.join(" ") + " ";
        const prefixWidth = ctx.measureText(prefix).width;

        ctx.fillStyle = BRAND.colors.white;
        ctx.fillText(prefix, PAD_X, y);
        ctx.fillStyle = BRAND.colors.primary;
        ctx.fillText(lastWord, PAD_X + prefixWidth, y);
      } else {
        ctx.fillStyle = BRAND.colors.primary;
        ctx.fillText(line, PAD_X, y);
      }
    } else {
      ctx.fillStyle = BRAND.colors.white;
      ctx.fillText(line, PAD_X, y);
    }
    y += titleLineHeight;
  }
  y += titleMarginBottom;

  // --- Body ---
  ctx.font = `400 ${bodyFontSize}px Inter`;
  ctx.fillStyle = BRAND.colors.textMuted;
  ctx.textBaseline = "top";

  for (const line of bodyLines) {
    ctx.fillText(line, PAD_X, y);
    y += bodyLineHeight;
  }

  // --- CTA (last card) ---
  if (isLast) {
    y += ctaMarginTop;
    const ctaText = "Try Voile Drift →";
    ctx.font = "700 28px Inter";
    const ctaTextWidth = ctx.measureText(ctaText).width;
    const ctaPadX = 48;
    const ctaPadY = 24;
    const ctaW = ctaTextWidth + ctaPadX * 2;
    const ctaTotalH = 28 + ctaPadY * 2;

    ctx.fillStyle = BRAND.colors.primary;
    fillRoundRect(ctx, PAD_X, y, ctaW, ctaTotalH, 16);

    ctx.fillStyle = BRAND.colors.white;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ctaText, PAD_X + ctaW / 2, y + ctaTotalH / 2);
  }

  // --- Footnote ---
  if (card.footnote) {
    // Position footnote near the bottom of content area
    const footnoteY = contentBottom - footnoteH;
    ctx.font = "400 20px Inter";
    ctx.fillStyle = BRAND.colors.textMuted;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(card.footnote.toUpperCase(), PAD_X, footnoteY);
  }
}
