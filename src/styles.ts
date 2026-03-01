export interface CarouselStyle {
  name: string;
  promptTemplate: (topic: string, cardCount: number, url: string) => string;
}

const SHARED_RULES = `
Hook rules (Card 1):
- Curiosity-driven or pain-point headline, max 6 words
- Must create an urge to swipe — use intrigue, surprise, or a bold claim
- Subtitle: one short line that adds context

Content card rules:
- Each card has a title (3-8 words) and body (3-6 sentences, paragraph-style)
- Body text should be readable and thoughtful — proper paragraphs, not bullet points
- Each card can optionally have a "footnote" (short extra context, max 8 words)

CTA card (last card) rules:
- Title: a compelling reason to follow (e.g. "Want more like this?")
- Body: 1-2 sentences encouraging the reader to follow for more content
- Include a "sharePrompt" field with a share call-to-action (e.g. "Share with a friend who struggles with time management")

Return ONLY valid JSON — an array of objects with "title", "body", optionally "footnote", and "sharePrompt" on the last card only. No markdown fences, no explanation.`;

export const STYLES: Record<string, CarouselStyle> = {
  educational: {
    name: "educational",
    promptTemplate: (topic, cardCount, url) => `Generate an educational Instagram carousel (${cardCount} cards) about: "${topic}"

Format: Step-by-step teaching. Each content card builds on the previous one, walking the reader through the topic progressively.

${SHARED_RULES}

Website: ${url}`,
  },

  myths: {
    name: "myths",
    promptTemplate: (topic, cardCount, url) => `Generate a myth-busting Instagram carousel (${cardCount} cards) about: "${topic}"

Format: Each content card starts with "Myth #N: ..." followed by the debunked truth. Challenge common misconceptions.

${SHARED_RULES}

Website: ${url}`,
  },

  tips: {
    name: "tips",
    promptTemplate: (topic, cardCount, url) => `Generate a tips-style Instagram carousel (${cardCount} cards) about: "${topic}"

Format: Numbered tips, concise and actionable. Each content card is one tip with a clear takeaway.

${SHARED_RULES}

Website: ${url}`,
  },

  storytelling: {
    name: "storytelling",
    promptTemplate: (topic, cardCount, url) => `Generate a storytelling Instagram carousel (${cardCount} cards) about: "${topic}"

Format: Narrative arc with a lesson. Start with a relatable scenario, build tension or curiosity, and end with an insight or transformation.

${SHARED_RULES}

Website: ${url}`,
  },
};
