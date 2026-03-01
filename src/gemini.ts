import { GoogleGenerativeAI } from "@google/generative-ai";
import { BRAND } from "./brand.js";
import type { CarouselStyle } from "./styles.js";

export interface CardContent {
  title: string;
  body: string;
  footnote?: string;
  sharePrompt?: string;
}

export async function generateCardContent(
  topic: string,
  cardCount: number,
  style: CarouselStyle
): Promise<CardContent[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") {
    throw new Error(
      "GEMINI_API_KEY not set. Add it to your .env file."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = style.promptTemplate(topic, cardCount, BRAND.url);

  let result;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction: { role: "model", parts: [{ text: BRAND.systemPrompt }] },
      });
      break;
    } catch (err: any) {
      if (err.status === 503 && attempt < 2) {
        const delay = (attempt + 1) * 2000;
        console.log(`Gemini 503 — retrying in ${delay / 1000}s (attempt ${attempt + 2}/3)...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }

  if (!result) {
    throw new Error("Gemini failed after 3 attempts");
  }

  const text = result.response.text().trim();

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*\n?/m, "").replace(/\n?```\s*$/m, "");

  const cards: CardContent[] = JSON.parse(cleaned);

  if (!Array.isArray(cards) || cards.length < cardCount) {
    throw new Error(
      `Expected ${cardCount} cards from Gemini, got ${Array.isArray(cards) ? cards.length : "non-array"}`
    );
  }

  return cards.slice(0, cardCount);
}
