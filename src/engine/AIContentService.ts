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

export interface AIDiagnosisResult {
  diagnosis: string;
  targetSkill: import('../types/learner').ReadingSkill;
  targetMisconception: import('../types/learner').MisconceptionId;
  confidence: number;
  recommendedIntervention: import('../types/game').InteractionArchetype;
  recommendedWorld: 'lost_observatory' | 'arctic_station' | 'triton_deep_sea' | 'orbital_habitat';
  recommendedDifficulty: ReadingDifficulty;
  ambiguity: 'low' | 'moderate' | 'high';
  supportLevel: 0 | 1 | 2 | 3;
  documentTypes: string[];
  primaryActionPattern: import('../types/director').PrimaryPlayerActionPattern;
  reason: string;
}

/**
 * Perform structured AI Diagnosis call using Gemini.
 * Prompted with learner skill vector, misconception probabilities, action order, document behavior.
 * Returns structured JSON validated against registered game domains.
 */
export async function requestAIDiagnosis(
  profile: import('../types/learner').LearnerProfile,
  currentWorldId: string
): Promise<AIDiagnosisResult | null> {
  if (!isAIAvailable()) return null;

  TelemetryService.record('AI_DIAGNOSIS_STARTED', currentWorldId, {
    skills: profile.skills,
    errorPatterns: profile.errorPatterns,
  });

  const prompt = `You are the AI Experience Director for Text Physics, an adaptive reading adventure game.
Analyze the following learner cognitive profile, behavioral evidence log, and past experience memory:

LEARNER SKILL VECTOR:
${JSON.stringify(profile.skills, null, 2)}

LEARNER MISCONCEPTION PROBABILITIES (0.0 to 1.0):
${JSON.stringify(profile.misconceptions || {}, null, 2)}

RECENT BEHAVIORAL LOG:
- Documents Opened: ${JSON.stringify(profile.behavioralLog?.documentsOpened || [])}
- Reading Order: ${JSON.stringify(profile.behavioralLog?.readingOrder || [])}
- Actions Attempted: ${JSON.stringify(profile.behavioralLog?.actionsAttempted || [])}
- Repeated Guesses: ${profile.behavioralLog?.repeatedGuesses || 0}
- Lucky Answer History: ${JSON.stringify(profile.behavioralLog?.luckyAnswerCounts || {})}

EXPERIENCE MEMORY:
- Worlds Experienced: ${JSON.stringify(profile.experienceMemory?.worldsExperienced || [])}
- Archetypes Experienced: ${JSON.stringify(profile.experienceMemory?.archetypesExperienced || [])}

AVAILABLE DOMAINS (Strict Guardrail: you MUST only choose from these registered options):
- Worlds: ["lost_observatory", "arctic_station", "triton_deep_sea", "orbital_habitat"]
- Gameplay Archetypes: ["INVESTIGATION", "MECHANISM", "TIMELINE", "RESOURCE", "SORT", "CALIBRATE", "SYNTHESIS", "EVIDENCE", "ROUTE"]
- Primary Action Patterns: ["EVALUATE_AND_INSPECT", "ARRANGE_AND_OPERATE", "ALLOCATE_UNDER_EXCLUSION", "DEDUCE_STATE_AND_COMMIT", "FORENSIC_RETRIEVAL"]
- Document Types: ["field_journal", "maintenance_manual", "emergency_log", "witness_transcript", "scientific_report", "radio_transcript"]
- Target Skills: ["literalRetrieval", "sequencing", "causeEffect", "negativeConstraint", "multiCondition", "inference", "synthesis", "transfer"]
- Target Misconceptions: ["temporal_reversal", "causal_inversion", "ignored_negation", "missed_prerequisite", "superficial_keyword_matching", "premature_commitment", "insufficient_evidence", "overgeneralization", "sequence_causation_confusion", "transfer_failure"]

CRITICAL PEDAGOGICAL RULES:
1. If the learner exhibits sequence_causation_confusion or causal_inversion:
   - Prescribe world: "arctic_station" or "triton_deep_sea"
   - Archetype: "INVESTIGATION" or "EVIDENCE"
   - Action Pattern: "EVALUATE_AND_INSPECT"
   - Ambiguity: "high"
2. If the learner exhibits temporal_reversal or sequencing weakness:
   - Prescribe world: "lost_observatory"
   - Archetype: "TIMELINE" or "MECHANISM"
   - Action Pattern: "ARRANGE_AND_OPERATE"
   - Ambiguity: "low"
3. If the learner exhibits ignored_negation:
   - Prescribe world: "lost_observatory" or "arctic_station"
   - Archetype: "RESOURCE" or "ROUTE"
   - Action Pattern: "ALLOCATE_UNDER_EXCLUSION"
4. Avoid immediate repetition of the same archetype or world unless pedagogical necessity demands it.

Output strictly valid JSON with this exact schema:
{
  "diagnosis": "string",
  "targetSkill": "string",
  "targetMisconception": "string",
  "confidence": 0.85,
  "recommendedIntervention": "string",
  "recommendedWorld": "string",
  "recommendedDifficulty": "beginner" | "intermediate" | "advanced",
  "ambiguity": "low" | "moderate" | "high",
  "supportLevel": 0 | 1 | 2 | 3,
  "documentTypes": ["string", "string"],
  "primaryActionPattern": "string",
  "reason": "string"
}`;

  try {
    const result = (await callGemini(prompt)) as any;
    if (
      result &&
      result.diagnosis &&
      result.targetSkill &&
      result.recommendedIntervention &&
      result.recommendedWorld
    ) {
      TelemetryService.record('AI_DIAGNOSIS_COMPLETED', currentWorldId, {
        diagnosis: result.diagnosis,
        targetSkill: result.targetSkill,
        world: result.recommendedWorld,
        archetype: result.recommendedIntervention,
      });
      return {
        diagnosis: String(result.diagnosis),
        targetSkill: result.targetSkill,
        targetMisconception: result.targetMisconception || 'sequence_causation_confusion',
        confidence: Number(result.confidence) || 0.75,
        recommendedIntervention: result.recommendedIntervention,
        recommendedWorld: result.recommendedWorld,
        recommendedDifficulty: result.recommendedDifficulty || profile.readingDifficulty,
        ambiguity: result.ambiguity || 'moderate',
        supportLevel: (result.supportLevel ?? 1) as 0 | 1 | 2 | 3,
        documentTypes: Array.isArray(result.documentTypes) ? result.documentTypes : ['emergency_log', 'scientific_report'],
        primaryActionPattern: result.primaryActionPattern || 'EVALUATE_AND_INSPECT',
        reason: String(result.reason || ''),
      };
    }
  } catch (err) {
    console.warn('[AIContentService] AI Diagnosis call failed, using fallback:', err);
  }

  return null;
}

/**
 * Generate a multi-document scenario specification based on diagnosis.
 */
export async function generateMultiDocumentScenarioSpec(
  diagnosis: AIDiagnosisResult
): Promise<import('../types/scenario').AIScenarioSpecification | null> {
  if (!isAIAvailable()) return null;

  TelemetryService.record('SCENARIO_GENERATION_STARTED', diagnosis.recommendedWorld, {
    targetSkill: diagnosis.targetSkill,
    archetype: diagnosis.recommendedIntervention,
  });

  const prompt = `You are the AI Scenario Architect for Text Physics.
Generate a structured multi-document scenario specification for:
- World: "${diagnosis.recommendedWorld}"
- Archetype: "${diagnosis.recommendedIntervention}"
- Target Skill: "${diagnosis.targetSkill}"
- Target Misconception: "${diagnosis.targetMisconception}"
- Difficulty: "${diagnosis.recommendedDifficulty}"
- Ambiguity: "${diagnosis.ambiguity}"

REQUIREMENTS:
1. Every document must have a distinct INFORMATION ROLE:
   - "event_timing": establishes chronology
   - "physical_mechanism": establishes physical operating laws
   - "misleading_correlation": introduces a plausible false hypothesis
   - "confirmatory_evidence": confirms ground truth or refutes false hypothesis
2. Include an UNDERLYING KNOWLEDGE GRAPH with facts and relations (BEFORE, CAUSED, DID_NOT_CAUSE, DEPENDS_ON, EXCLUDES).
3. Do NOT include solution spoilers or answers in instructions.
4. Output strictly valid JSON matching this schema:
{
  "world": "${diagnosis.recommendedWorld}",
  "archetype": "${diagnosis.recommendedIntervention}",
  "targetSkill": "${diagnosis.targetSkill}",
  "targetMisconception": "${diagnosis.targetMisconception}",
  "difficulty": "${diagnosis.recommendedDifficulty}",
  "ambiguity": "${diagnosis.ambiguity}",
  "centralMystery": "string",
  "documents": [
    {
      "id": "string",
      "title": "string",
      "type": "string",
      "source": "string",
      "role": "event_timing" | "physical_mechanism" | "misleading_correlation" | "confirmatory_evidence",
      "paragraphs": ["string"],
      "keyClues": ["string"],
      "factsCovered": ["fact_1"]
    }
  ],
  "requiredFacts": [
    { "id": "fact_1", "statement": "string", "sourceDocumentId": "string" }
  ],
  "requiredRelations": [
    { "id": "rel_1", "subjectFactId": "fact_1", "relation": "CAUSED", "objectFactId": "fact_2", "description": "string" }
  ],
  "plausibleFalseHypothesis": "string",
  "requiredInference": "string",
  "supportStrategy": "string",
  "failureConsequences": ["string"],
  "successConsequences": ["string"],
  "topologyId": "TOP-2",
  "evidenceSnippet": "string"
}`;

  try {
    const res = (await callGemini(prompt)) as any;
    if (res && res.world && Array.isArray(res.documents)) {
      TelemetryService.record('SCENARIO_GENERATION_COMPLETED', diagnosis.recommendedWorld, {
        documentCount: res.documents.length,
      });
      return res as import('../types/scenario').AIScenarioSpecification;
    }
  } catch (err) {
    console.warn('[AIContentService] AI Multi-document scenario generation failed:', err);
  }

  return null;
}
