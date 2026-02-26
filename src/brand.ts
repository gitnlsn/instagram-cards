export const BRAND = {
  name: "Voile Drift",
  tagline: "Your calendar, supercharged with AI.",
  url: "www.voile-drift.store",
  colors: {
    primary: "#B71C1C",
    white: "#FFFFFF",
    darkBg: "#1a1a1a",
    darkBgLight: "#2a2a2a",
    textMuted: "#aaaaaa",
    lightBg: "#F5F0EB",
    textDark: "#1a1a1a",
    textBody: "#3a3a3a",
  },
  card: {
    width: 1080,
    height: 1080,
  },
  systemPrompt: `You are a marketing copywriter for Voile Drift — a mobile app that connects to Google Calendar and uses Gemini AI to store and retrieve insights over detailed calendar events.

Key product details:
- Users log events with rich detail (notes, reflections, outcomes)
- Gemini AI helps surface patterns, recall past insights, and connect events
- Target audience: productivity-minded professionals, founders, knowledge workers
- Tone: modern, confident, clean, slightly bold — not corporate or generic
- The app helps people remember what matters and learn from their own experience

You write readable and thoughtful Instagram carousel copy.`,
} as const;
