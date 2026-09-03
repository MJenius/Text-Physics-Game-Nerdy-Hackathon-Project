import type {
  Audience,
  ReadingDifficulty,
  DifficultyConstraints,
  ChallengeSchema,
  GeneratedPassage,
  ValidationResult,
} from '../types/learner';

// ============================================================================
// DIFFICULTY ENGINE (Phase 2)
// Pure functions: constraint lookup, prompt building, passage validation.
// ============================================================================

/**
 * Returns concrete prose constraints for a given audience × difficulty combination.
 */
export function getDifficultyConstraints(
  audience: Audience,
  difficulty: ReadingDifficulty
): DifficultyConstraints {
  const matrix: Record<Audience, Record<ReadingDifficulty, DifficultyConstraints>> = {
    kids: {
      beginner: {
        avgSentenceLength: [6, 10],
        vocabularyLevel: 'basic',
        clauseComplexity: 'simple',
        temporalExplicitness: 'explicit',
        maxParagraphs: 3,
        audienceTone: 'Write for a young child (ages 7-10). Use a friendly, encouraging narrator voice. Keep sentences very short and concrete. Use simple words.',
      },
      intermediate: {
        avgSentenceLength: [8, 14],
        vocabularyLevel: 'basic',
        clauseComplexity: 'simple',
        temporalExplicitness: 'explicit',
        maxParagraphs: 4,
        audienceTone: 'Write for an older child (ages 9-12). Sentences can be a bit longer. Keep vocabulary accessible but slightly richer.',
      },
      advanced: {
        avgSentenceLength: [10, 16],
        vocabularyLevel: 'moderate',
        clauseComplexity: 'compound',
        temporalExplicitness: 'moderate',
        maxParagraphs: 4,
        audienceTone: 'Write for a confident young reader (ages 10-13). Use moderate vocabulary. Allow compound sentences but keep ideas clear.',
      },
    },
    teens: {
      beginner: {
        avgSentenceLength: [8, 14],
        vocabularyLevel: 'moderate',
        clauseComplexity: 'simple',
        temporalExplicitness: 'explicit',
        maxParagraphs: 4,
        audienceTone: 'Write for a teen reader who is building reading confidence. Keep sentences manageable. Use explicit sequence markers (first, then, next).',
      },
      intermediate: {
        avgSentenceLength: [10, 18],
        vocabularyLevel: 'moderate',
        clauseComplexity: 'compound',
        temporalExplicitness: 'moderate',
        maxParagraphs: 5,
        audienceTone: 'Write for a typical teenage reader. Use moderate vocabulary and some compound sentences. Allow some inference.',
      },
      advanced: {
        avgSentenceLength: [12, 22],
        vocabularyLevel: 'rich',
        clauseComplexity: 'complex',
        temporalExplicitness: 'implicit',
        maxParagraphs: 5,
        audienceTone: 'Write for an advanced teen reader. Use richer vocabulary, complex sentence structures, and more implicit relationships.',
      },
    },
    adults: {
      beginner: {
        avgSentenceLength: [10, 16],
        vocabularyLevel: 'moderate',
        clauseComplexity: 'compound',
        temporalExplicitness: 'explicit',
        maxParagraphs: 4,
        audienceTone: 'Write for an adult English learner. Use clear, natural adult language but keep sentence structures manageable. Explicit connectors.',
      },
      intermediate: {
        avgSentenceLength: [12, 22],
        vocabularyLevel: 'rich',
        clauseComplexity: 'compound',
        temporalExplicitness: 'moderate',
        maxParagraphs: 5,
        audienceTone: 'Write for an adult reader. Use natural, rich vocabulary. Allow moderate sentence complexity. Some implicit relationships.',
      },
      advanced: {
        avgSentenceLength: [14, 28],
        vocabularyLevel: 'rich',
        clauseComplexity: 'complex',
        temporalExplicitness: 'implicit',
        maxParagraphs: 6,
        audienceTone: 'Write for a fluent adult reader. Use sophisticated vocabulary, complex syntax, nuanced descriptions, and implicit causal/temporal relationships.',
      },
    },
  };

  return matrix[audience][difficulty];
}

/**
 * Builds a structured LLM prompt that generates a passage for a challenge schema
 * while obeying difficulty constraints.
 */
export function buildGenerationPrompt(
  schema: ChallengeSchema,
  constraints: DifficultyConstraints,
  _audience: Audience
): string {
  return `You are a reading-game content writer. Generate a short passage for an interactive puzzle game.

CONTEXT: The game "Text Physics: The Lost Observatory" has players read passages to understand rules of a physical world, then interact with that world. The passage must encode ALL the factual rules the player needs.

AUDIENCE & TONE:
${constraints.audienceTone}

DIFFICULTY CONSTRAINTS:
- Average sentence length: ${constraints.avgSentenceLength[0]}–${constraints.avgSentenceLength[1]} words
- Vocabulary level: ${constraints.vocabularyLevel}
- Clause complexity: ${constraints.clauseComplexity}
- Temporal/causal explicitness: ${constraints.temporalExplicitness}
- Maximum paragraphs: ${constraints.maxParagraphs}

REQUIRED ENTITIES (must appear by name in the passage):
${schema.requiredEntities.map((e) => `- ${e}`).join('\n')}

REQUIRED FACTUAL RELATIONSHIPS (each must be clearly stated):
${schema.requiredRelationships.map((r) => `- ${r}`).join('\n')}

${schema.requiredSequenceWords ? `REQUIRED SEQUENCE/TEMPORAL WORDS (use at least some of these):
${schema.requiredSequenceWords.map((w) => `- ${w}`).join('\n')}` : ''}

READING SKILL BEING TESTED: ${schema.skill}

RULES:
1. Do NOT invent any mechanics, entities, or rules beyond what is listed above.
2. Every required relationship must be clearly expressed in the text.
3. Keep the passage within ${constraints.maxParagraphs} paragraphs.
4. Match the audience tone exactly.
5. The passage should feel like a journal entry, field note, or instructional plaque found in an old observatory.

Respond ONLY with valid JSON in this exact format:
{
  "title": "A short heading for this journal entry",
  "source": "A brief italic attribution (e.g., 'Found etched on the chamber wall:')",
  "paragraphs": ["paragraph 1", "paragraph 2", ...],
  "targetVocabulary": ["key term 1", "key term 2", ...]
}

Do not include any text outside the JSON object.`;
}

/**
 * Builds a prompt to adapt an existing passage to new difficulty constraints.
 */
export function buildAdaptationPrompt(
  originalParagraphs: string[],
  constraints: DifficultyConstraints,
  requiredEntities: string[],
  requiredRelationships: string[]
): string {
  return `Rewrite the following passage for a reading puzzle game, adapting it to match new difficulty constraints.

ORIGINAL PASSAGE:
${originalParagraphs.map((p, i) => `[${i + 1}] ${p}`).join('\n')}

NEW DIFFICULTY CONSTRAINTS:
- Average sentence length: ${constraints.avgSentenceLength[0]}–${constraints.avgSentenceLength[1]} words
- Vocabulary level: ${constraints.vocabularyLevel}
- Clause complexity: ${constraints.clauseComplexity}
- Temporal/causal explicitness: ${constraints.temporalExplicitness}
- Maximum paragraphs: ${constraints.maxParagraphs}

AUDIENCE & TONE:
${constraints.audienceTone}

CRITICAL: You MUST preserve all of these factual relationships exactly:
${requiredRelationships.map((r) => `- ${r}`).join('\n')}

CRITICAL: These entity names MUST appear in the text:
${requiredEntities.map((e) => `- ${e}`).join('\n')}

RULES:
1. Do NOT change any game mechanics or rules. Only change the language.
2. Do NOT add new rules, entities, or conditions that weren't in the original.
3. Every required relationship must remain clearly stated.
4. Adapt vocabulary, sentence length, and complexity to match the constraints.

Respond ONLY with valid JSON in this exact format:
{
  "title": "A short heading for this journal entry",
  "source": "A brief italic attribution",
  "paragraphs": ["paragraph 1", "paragraph 2", ...],
  "targetVocabulary": ["key term 1", "key term 2", ...]
}

Do not include any text outside the JSON object.`;
}

/**
 * Validates a generated passage against the challenge schema.
 * Conservative: fails on any missing entity or relationship.
 */
export function validatePassage(
  passage: GeneratedPassage,
  schema: ChallengeSchema
): ValidationResult {
  const errors: string[] = [];
  const fullText = passage.paragraphs.join(' ').toLowerCase();

  // Check required entities appear in text
  for (const entity of schema.requiredEntities) {
    if (!fullText.includes(entity.toLowerCase())) {
      errors.push(`Missing required entity: "${entity}"`);
    }
  }

  // Check required relationships have keyword presence
  // Conservative: check that key nouns from each relationship appear
  for (const rel of schema.requiredRelationships) {
    const keywords = rel
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3) // only meaningful words
      .filter((w) => !['must', 'will', 'that', 'this', 'have', 'been', 'with', 'from', 'into', 'only', 'when', 'before', 'after'].includes(w));

    const keywordCount = keywords.filter((kw) => fullText.includes(kw)).length;
    const matchRatio = keywords.length > 0 ? keywordCount / keywords.length : 1;

    if (matchRatio < 0.5) {
      errors.push(`Relationship may be missing: "${rel}" (only ${Math.round(matchRatio * 100)}% keyword match)`);
    }
  }

  // Check paragraph count
  if (passage.paragraphs.length === 0) {
    errors.push('Passage has no paragraphs');
  }

  // Check for empty paragraphs
  if (passage.paragraphs.some((p) => !p || p.trim().length === 0)) {
    errors.push('Passage contains empty paragraphs');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
