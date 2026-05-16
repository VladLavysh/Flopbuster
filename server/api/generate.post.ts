import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { reviewText, genre } = await readBody(event);

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
               Convert this review into an epic movie poster concept.`,
    });

    const cleanPrompt = output.imagePrompt.replace(/["'#?&]/g, "").trim();
    const encodedPrompt = encodeURIComponent(
      `${cleanPrompt}, cinematic lighting, movie poster aesthetic, high resolution`,
    );
    const publicImageUrl = `https://image.pollinations.ai/p/${encodedPrompt}?width=800&height=1200&enhanced=true&model=flux`;

    return {
      title: output.title,
      tagline: output.tagline,
      imageUrl: publicImageUrl,
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to summon Hollywood magic. Check your API key.",
    });
  }
});
