import { GoogleGenerativeAI } from "@google/generative-ai";
import { BRAND } from "./brand.js";

export interface CardContent {
  title: string;
  body: string;
  footnote?: string;
}

export async function generateCardContent(
  topic: string,
  cardCount: number
): Promise<CardContent[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") {
    throw new Error(
      "GEMINI_API_KEY not set. Add it to your .env file."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `Generate Instagram carousel content for ${cardCount} cards about: "${topic}"

Rules:
- Card 1 is the hook/title card: short, bold headline (max 8 words) + a one-line subtitle
- Cards 2 through ${cardCount - 1} are content cards: each has a title (3-8 words) and body (3-6 sentences, paragraph-style)
- Card ${cardCount} is the CTA card: compelling call to action for Voile Drift (website: ${BRAND.url})
- Each card can optionally have a "footnote" (short extra context, max 8 words)
- Body text should be readable and thoughtful — write proper paragraphs, not bullet points

Return ONLY valid JSON — an array of objects with "title", "body", and optionally "footnote". No markdown fences, no explanation.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: { role: "model", parts: [{ text: BRAND.systemPrompt }] },
  });

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
