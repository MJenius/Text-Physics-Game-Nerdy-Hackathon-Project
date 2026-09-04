import type { ChallengeSchema, ReadingSkill, Audience } from '../types/learner';

// ============================================================================
// HINT SERVICE (Phase 2)
// Evidence-grounded progressive hints. No LLM needed — all hints are
// pre-authored in the challenge schemas.
// ============================================================================

/**
 * Get a progressive hint for a specific failure condition.
 * Returns the hint text at the given level (0, 1, or 2).
 */
export function getHint(
  schema: ChallengeSchema,
  failureCondition: string,
  hintLevel: number
): string | null {
  const evidence = schema.evidenceSentences.find(
    (e) => e.failureCondition === failureCondition
  );

  if (!evidence) {
    // If no specific failure condition matches, use the first evidence entry
    const fallback = schema.evidenceSentences[0];
    if (!fallback) return null;
    const clampedLevel = Math.min(hintLevel, 2);
    return fallback.hintLevels[clampedLevel];
  }

  const clampedLevel = Math.min(hintLevel, 2);
  return evidence.hintLevels[clampedLevel];
}

/**
 * Get a general hint for the current challenge (not tied to a specific failure).
 * Uses the first evidence mapping in the schema.
 */
export function getGeneralHint(
  schema: ChallengeSchema,
  hintLevel: number
): string | null {
  if (schema.evidenceSentences.length === 0) return null;
  const clampedLevel = Math.min(hintLevel, 2);
  return schema.evidenceSentences[0].hintLevels[clampedLevel];
}

/**
 * Returns a personalized rereading prompt based on the reading skill being tested
 * and the audience level. This replaces the generic "consult the highlighted conditions."
 */
export function getPersonalizedRereadingPrompt(
  skill: ReadingSkill,
  _audience: Audience
): string {
  const prompts: Record<ReadingSkill, string> = {
    literalRetrieval:
      'Look carefully at the specific details in the passage. Each item is described precisely — find the exact match.',
    sequencing:
      'Find the words that tell you what must happen first. Look for "before," "then," or "must."',
    causeEffect:
      'Look for the sentence that explains what causes what. What happens IF something is missing?',
    negativeConstraint:
      'Find the warning in the text. What does it say you must NOT do?',
    multiCondition:
      'The passage lists multiple conditions. Find ALL of them — every one must be satisfied.',
    inference:
      'Connect the clues across documents. What underlying principle is implied even if not stated outright?',
    synthesis:
      'This challenge combines several systems. Check each requirement the passage describes.',
    transfer:
      'Recognize the isomorphic reasoning structure: how does your past experience apply to this new environment?',
  };

  return prompts[skill] || 'Reread the passage carefully and look for the key conditions.';
}

/**
 * Infer a failure condition string from the last failed action.
 * Maps common action patterns to the failure conditions used in challenge schemas.
 */
export function inferFailureCondition(
  challengeId: string,
  actionType: string,
  targetId: string,
  sourceId?: string
): string {
  // Challenge 1
  if (challengeId === 'challenge_1') {
    if (sourceId === 'brass_key' && targetId === 'iron_lock') return 'brass_on_iron';
    if (sourceId === 'oxidized_key' && targetId === 'brass_latch') return 'iron_on_brass';
    if (targetId === 'archive_door') return 'door_locked';
  }

  // Challenge 2
  if (challengeId === 'challenge_2') {
    if (targetId === 'catalog_crank') return 'crank_while_pinned';
  }

  // Challenge 3
  if (challengeId === 'challenge_3') {
    if (targetId === 'boiler_burner') return 'burner_without_water';
  }

  // Challenge 4
  if (challengeId === 'challenge_4') {
    if (targetId === 'master_transformer_switch') return 'both_sources_on';
  }

  // Challenge 5
  if (challengeId === 'challenge_5') {
    if (targetId === 'lens_cradle' && actionType === 'USE_ITEM_ON') return 'dirty_cradle';
  }

  // Challenge 6
  if (challengeId === 'challenge_6') {
    if (targetId === 'master_aperture_lever') return 'lever_conditions_unmet';
  }

  return 'general';
}
