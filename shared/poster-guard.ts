export const TROLL_MESSAGE = "Nice try, script-doctor.";

export const TROLL_POSTER = {
  title: "THE EXPLOIT",
  tagline: "HE WANTED TO BREAK THE SYSTEM. HE ONLY BROKE THE THIRD WALL.",
  releaseDate: "OUT NOW",
  imagePrompt:
    "A dramatic cinematic Hollywood movie poster, a lone hacker sitting in front of a glowing monitor in a dark room, the screen reflecting a smiling digital theater mask, moody green and black color palette, cyber thriller aesthetic, highly detailed, photorealistic, no text, no words, no letters",
} as const;

export const TROLL_IMAGE_URL =
  "https://picsum.photos/seed/clown-poster/800/1200";

const INJECTION_PHRASES: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions?/i,
  /disregard\s+(all\s+)?(previous|prior)/i,
  /your\s+new\s+task\s+is/i,
  /output\s+the\s+following\s+json/i,
  /\bsystem\s*:/i,
  /you\s+are\s+now/i,
  /<\/?user_review>/i,
  /\bjailbreak\b/i,
  /\bdan\s+mode\b/i,
];

const SUSPICIOUS_SYMBOLS = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/;

export function detectInjection(text: string): boolean {
  const review = text.trim();
  if (!review) return false;

  if (INJECTION_PHRASES.some((pattern) => pattern.test(review))) {
    return true;
  }

  if (SUSPICIOUS_SYMBOLS.test(review)) {
    return true;
  }

  if (/\{\s*"/.test(review) || /<\/?[a-z][\s\S]*?>/i.test(review)) {
    return true;
  }

  return false;
}

export function buildPollinationsImageUrl(imagePrompt: string): string {
  const clean = imagePrompt.replace(/["'#?&]/g, "").trim();
  return `https://image.pollinations.ai/p/${encodeURIComponent(clean)}?width=800&height=1200&enhanced=true&model=flux&_ts=${Date.now()}`;
}
