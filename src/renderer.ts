import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { BRAND } from "./brand.js";
import { drawCard } from "./templates/card.js";
import type { CardContent } from "./gemini.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.resolve(__dirname, "../assets/fonts");

// Register fonts once at module load
GlobalFonts.registerFromPath(path.join(FONTS_DIR, "inter-400.ttf"), "Inter");
GlobalFonts.registerFromPath(path.join(FONTS_DIR, "inter-600.ttf"), "Inter");
GlobalFonts.registerFromPath(path.join(FONTS_DIR, "inter-800.ttf"), "Inter");

export async function renderCards(
  cards: CardContent[],
  outputDir: string
): Promise<string[]> {
  await fs.mkdir(outputDir, { recursive: true });

  const outputPaths: string[] = [];

  for (let i = 0; i < cards.length; i++) {
    const canvas = createCanvas(BRAND.card.width, BRAND.card.height);
    const ctx = canvas.getContext("2d");

    drawCard(ctx, cards[i], i, cards.length);

    const png = await canvas.encode("png");

    const filename = `card-${String(i + 1).padStart(2, "0")}.png`;
    const filePath = path.join(outputDir, filename);

    await fs.writeFile(filePath, png);
    outputPaths.push(filePath);
  }

  return outputPaths;
}
