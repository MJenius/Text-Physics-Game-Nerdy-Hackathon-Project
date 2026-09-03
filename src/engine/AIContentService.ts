import type {
  Audience,
  DifficultyConstraints,
  ChallengeSchema,
  GeneratedPassage,
  ReadingDifficulty,
} from '../types/learner';
import type { Passage } from '../types/game';
import {
  buildGenerationPrompt,
  buildAdaptationPrompt,
  validatePassage,
} from './DifficultyEngine';
import { TelemetryService } from './Telemetry';

// ============================================================================
// AI CONTENT SERVICE (Phase 2)
// Abstraction layer over Gemini. All LLM calls go through this service.
// Falls back gracefully when API key is unavailable or calls fail.
// ============================================================================

let apiKey: string | null = null;
let genAI: import('@google/genai').GoogleGenAI | null = null;
/** Fastest production flash model */
const MODEL = 'gemini-2.5-flash-lite';

/** In-memory cache for instant switching between already generated levels */
const passageCache = new Map<string, GeneratedPassage>();

function getCacheKey(challengeId: string, audience: Audience, difficulty: ReadingDifficulty): string {
  return `${challengeId}_${audience}_${difficulty}`;
}

export function getCachedPassage(
  challengeId: string,
  audience: Audience,
  difficulty: ReadingDifficulty
): GeneratedPassage | null {
  return passageCache.get(getCacheKey(challengeId, audience, difficulty)) || null;
}

/** Minimum interval between API calls (ms) */
const RATE_LIMIT_MS = 300;
let lastCallTime = 0;

/**
 * Initialize the service by reading the API key from env.
 * Call once at app startup.
 */
export async function initAIService(): Promise<void> {
  apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
  if (apiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      genAI = new GoogleGenAI({ apiKey: apiKey! });
      console.log('[AIContentService] Gemini initialized with fastest model:', MODEL);
    } catch (err) {
      console.warn('[AIContentService] Failed to load Gemini SDK:', err);
      genAI = null;
    }
  } else {
    console.log('[AIContentService] No API key found — AI features disabled, using fallback passages');
  }
}

/**
 * Returns whether the AI service is ready to make calls.
 */
export function isAIAvailable(): boolean {
  return genAI !== null && apiKey !== null;
}

/**
 * Call the Gemini model with a prompt, expecting JSON output.
 * Returns parsed JSON or null on failure.
 */
async function callGemini(prompt: string): Promise<Record<string, unknown> | null> {
  if (!genAI) return null;

  // Simple rate limiting
  const now = Date.now();
  const wait = RATE_LIMIT_MS - (now - lastCallTime);
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  lastCallTime = Date.now();

  try {
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const text = response.text?.trim();
    if (!text) return null;

    // Parse JSON — strip any markdown fences if present
    const cleaned = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('[AIContentService] Gemini call failed:', err);
    return null;
  }
}

/**
 * Generate a new passage from a challenge schema + difficulty constraints.
 * Returns null on failure (caller should use fallback).
 */
export async function generatePassage(
  schema: ChallengeSchema,
  constraints: DifficultyConstraints,
  audience: Audience,
  difficulty: ReadingDifficulty
): Promise<GeneratedPassage | null> {
  if (!isAIAvailable()) return null;

  TelemetryService.record('PASSAGE_GENERATION_STARTED', schema.challengeId, {
    audience,
    difficulty,
  });

  const prompt = buildGenerationPrompt(schema, constraints, audience);
  const result = await callGemini(prompt);

  if (!result || !Array.isArray(result.paragraphs)) {
    console.warn('[AIContentService] Invalid generation response');
    return null;
  }

  const passage: GeneratedPassage = {
    title: (result.title as string) || 'Field Journal Entry',
    source: (result.source as string) || '',
    paragraphs: result.paragraphs as string[],
    targetVocabulary: (result.targetVocabulary as string[]) || [],
    readingLevel: difficulty,
    audience,
    generatedAt: Date.now(),
    isAIGenerated: true,
  };

  // Validate
  const validation = validatePassage(passage, schema);
  if (validation.valid) {
    passageCache.set(getCacheKey(schema.challengeId, audience, difficulty), passage);
    TelemetryService.record('PASSAGE_GENERATION_SUCCESS', schema.challengeId, {
      audience,
      difficulty,
      paragraphCount: passage.paragraphs.length,
    });
    return passage;
  }

  // Retry once with error feedback
  console.warn('[AIContentService] Validation failed, retrying:', validation.errors);
  const retryPrompt = `${prompt}\n\nYour previous response had these issues:\n${validation.errors.map((e) => `- ${e}`).join('\n')}\n\nPlease fix these issues and try again.`;
  const retryResult = await callGemini(retryPrompt);

  if (!retryResult || !Array.isArray(retryResult.paragraphs)) return null;

  const retryPassage: GeneratedPassage = {
    title: (retryResult.title as string) || 'Field Journal Entry',
    source: (retryResult.source as string) || '',
    paragraphs: retryResult.paragraphs as string[],
    targetVocabulary: (retryResult.targetVocabulary as string[]) || [],
    readingLevel: difficulty,
    audience,
    generatedAt: Date.now(),
    isAIGenerated: true,
  };

  const retryValidation = validatePassage(retryPassage, schema);
  if (retryValidation.valid) {
    passageCache.set(getCacheKey(schema.challengeId, audience, difficulty), retryPassage);
    TelemetryService.record('PASSAGE_GENERATION_SUCCESS', schema.challengeId, {
      audience,
      difficulty,
      wasRetry: true,
    });
    return retryPassage;
  }

  console.warn('[AIContentService] Retry also failed validation:', retryValidation.errors);
  return null;
}

/**
 * Adapt an existing passage to new difficulty constraints.
 * Returns null on failure (caller should use fallback).
 */
export async function adaptPassage(
  originalPassage: Passage,
  schema: ChallengeSchema,
  constraints: DifficultyConstraints,
  audience: Audience,
  difficulty: ReadingDifficulty
): Promise<GeneratedPassage | null> {
  if (!isAIAvailable()) return null;

  TelemetryService.record('PASSAGE_GENERATION_STARTED', schema.challengeId, {
    audience,
    difficulty,
    mode: 'adaptation',
  });

  const prompt = buildAdaptationPrompt(
    originalPassage.paragraphs,
    constraints,
    schema.requiredEntities,
    schema.requiredRelationships
  );

  const result = await callGemini(prompt);

  if (!result || !Array.isArray(result.paragraphs)) return null;

  const passage: GeneratedPassage = {
    title: (result.title as string) || originalPassage.heading,
    source: (result.source as string) || originalPassage.source,
    paragraphs: result.paragraphs as string[],
    targetVocabulary: (result.targetVocabulary as string[]) || [],
    readingLevel: difficulty,
    audience,
    generatedAt: Date.now(),
    isAIGenerated: true,
  };

  const validation = validatePassage(passage, schema);
  if (validation.valid) {
    TelemetryService.record('PASSAGE_GENERATION_SUCCESS', schema.challengeId, {
      audience,
      difficulty,
      mode: 'adaptation',
    });
    return passage;
  }

  console.warn('[AIContentService] Adapted passage failed validation:', validation.errors);
  return null;
}
