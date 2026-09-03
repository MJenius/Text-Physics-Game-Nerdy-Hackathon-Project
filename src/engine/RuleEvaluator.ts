import type { GameRule, Predicate, WorldState, EvaluationResult } from '../types/game';


export class RuleEvaluator {
  /**
   * Deterministically evaluates a rule against the current world state.
   */
  static evaluate(rule: GameRule, state: WorldState): EvaluationResult {
    for (let i = 0; i < rule.conditions.length; i++) {
      const condition = rule.conditions[i];
      const isSatisfied = this.checkPredicate(condition, state);

      if (!isSatisfied) {
        return {
          passed: false,
          feedback: rule.onFailure.feedbackMessage,
          effects: rule.onFailure.autoReset ? [{ type: 'RESET_CHALLENGE', target: '', value: true }] : [],
          soundEffect: rule.onFailure.soundEffect
        };
      }
    }

    return {
      passed: true,
      feedback: rule.onSuccess.feedbackMessage,
      effects: rule.onSuccess.effects,
      soundEffect: rule.onSuccess.soundEffect
    };
  }

  /**
   * Checks whether an individual predicate holds true in the given world state.
   */
  static checkPredicate(p: Predicate, state: WorldState): boolean {
    switch (p.type) {
      case 'ENTITY_STATE': {
        const entity = state.entities[p.target];
        if (!entity || !p.property) return false;
        return entity.states[p.property] === p.expected;
      }
      case 'INVENTORY_HAS': {
        return state.inventory.includes(p.target);
      }
      case 'FLAG_IS': {
        return state.flags[p.target] === p.expected;
      }
      default:
        return false;
    }
  }

  /**
   * Verifies if all completion conditions for a challenge are satisfied.
   */
  static isChallengeComplete(conditions: Predicate[], state: WorldState): boolean {
    return conditions.every(cond => this.checkPredicate(cond, state));
  }
}
