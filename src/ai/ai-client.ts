// src/ai/ai-client.ts
import { createOpenAI } from 'ai';
import { embed, generateText } from 'ai';

// Initialize OpenAI provider (uses OPENAI_API_KEY from env)
const openai = createOpenAI();

/**
 * Get embedding for a given text (e.g., PR title/body)
 */
export async function getEmbedding(text: string) {
  try {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: text,
    });
    return embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw new Error('Embedding generation failed');
  }
}

/**
 * Use LLM to classify PR content as spam or not
 */
export async function classifyPRWithLLM(
  title: string,
  body: string | null,
  patchPreview: string | null
) {
  const prompt = `
You are a GitHub PR spam detector. Analyze the following pull request and determine if it is low-effort, bot-generated, or suspicious.

Title: "${title}"
Body: ${body || 'No description provided.'}
Code changes (first 2000 chars): ${patchPreview?.substring(0, 2000) || 'No code changes provided.'}

Respond ONLY with a JSON object in this format:
{
  "isSpam": boolean,
  "confidence": number (0.0 to 1.0),
  "reasons": string[]
}
`;

  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'), // or 'gpt-3.5-turbo' for lower cost
      prompt,
    });

    // Parse and validate JSON response
    const result = JSON.parse(text.trim());
    return {
      isSpam: Boolean(result.isSpam),
      confidence: Number(result.confidence) || 0,
      reasons: Array.isArray(result.reasons) ? result.reasons : [],
    };
  } catch (error) {
    console.error('LLM classification failed:', error);
    // Fallback: not spam
    return {
      isSpam: false,
      confidence: 0,
      reasons: [],
    };
  }
}
