// src/ai/spam-analyzer.ts
import { classifyPRWithLLM } from './ai-client';

export interface SpamAnalysisResult {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
}

/**
 * Analyze PR content for spam indicators using AI
 */
export async function analyzePRContent(
  title: string,
  body: string | null,
  patch: string | null
): Promise<SpamAnalysisResult> {
  // Basic heuristics (optional pre-filter)
  if (!title.trim() || title.length < 5) {
    return {
      isSpam: true,
      confidence: 0.9,
      reasons: ['PR title is too short or empty'],
    };
  }

  if ((body?.trim().length || 0) < 10 && (!patch || patch.trim().length < 20)) {
    return {
      isSpam: true,
      confidence: 0.85,
      reasons: ['PR has minimal description and no meaningful code changes'],
    };
  }

  // Use LLM for deeper analysis
  const patchPreview = patch ? patch.substring(0, 3000) : null; // limit token usage
  const result = await classifyPRWithLLM(title, body, patchPreview);

  // Apply sensitivity threshold later in handler (e.g., >0.7 = spam)
  return result;
}
