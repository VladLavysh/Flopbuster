import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { reviewText, genre, currentDateISO } = await readBody(event);

  if (!reviewText) {
    throw createError({
      statusCode: 400,
      statusMessage: "Review text is required",
    });
  }

  const posterReviewSchema = z.object({
    title: z
      .string()
      .describe(
        "A grand, dramatic, uppercase Hollywood movie title based on the review.",
      ),
    tagline: z
      .string()
      .describe(
        "A hilarious, cinematic tagline that reframes the bad review as an epic movie plot.",
      ),
    releaseDate: z
      .string()
      .describe(
        "A fictional theatrical release date in format 'DD MMM YYYY' (example: '31 OCT, 2027').",
      ),
    imagePrompt: z
      .string()
      .describe(
        "A highly detailed, professional image generation prompt for a movie poster. Include lighting, style, and composition. DO NOT include text or titles in the prompt itself.",
      ),
  });

  try {
    const { output } = await generateText({
      model: google("gemini-2.5-flash"),
      output: Output.object({
        schema: posterReviewSchema,
      }),
      prompt: `Analyze this terrible customer review: "${reviewText}".
    The movie genre must be: ${genre}.
    Use this as reference current date: ${currentDateISO || new Date().toISOString()}.
    Convert this review into an epic movie poster concept.
    Return: TITLE, TAGLINE, RELEASE DATE, and IMAGE PROMPT.
    Release date must be fictional and in the future, formatted exactly as 'DD MMM, YYYY'.`,
    });

    output.imagePrompt = output.imagePrompt.replace(/["'#?&]/g, "").trim();

    return {
      statusCode: 200,
      statusMessage: "Success",
      data: output,
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to summon Hollywood magic. Try later.",
    });
  }
});
