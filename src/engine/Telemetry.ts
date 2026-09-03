export type TelemetryEventType =
  | 'SESSION_START'
  | 'PASSAGE_VIEW'
  | 'ACTION_ATTEMPTED'
  | 'ACTION_EVALUATED'
  | 'CHALLENGE_RESET'
  | 'REREAD_TRIGGERED'
  | 'CHALLENGE_COMPLETE'
  | 'WORLD_COMPLETE'
  // Phase 2 events
  | 'PROFILE_SELECTED'
  | 'READING_LEVEL_SELECTED'
  | 'PASSAGE_GENERATION_STARTED'
  | 'PASSAGE_GENERATION_SUCCESS'
  | 'PASSAGE_GENERATION_FALLBACK'
  | 'HINT_SHOWN'
  | 'HINT_USED'
  | 'SKILL_UPDATED'
  | 'DIFFICULTY_ADJUSTED'
  // Phase 3 events
  | 'PHYSICAL_CONSEQUENCE_TRIGGERED'
  | 'EVIDENCE_REQUESTED'
  | 'EVIDENCE_EVALUATED'
  | 'DIRECTOR_DIAGNOSIS_EMITTED'
  | 'TRANSFER_CHALLENGE_LOADED'
  | 'NOTEBOOK_OPENED'
  | 'REREAD_RECORDED'
  | 'MEANINGFUL_DECISION_COMMITTED'
  | 'SCENE_TRANSITIONED'
  | 'HERO_TRANSFER_SCENARIO_LOADED'
  | 'SCENE_COMPLETE';

export interface TelemetryEvent {
  type: TelemetryEventType;
  timestamp: number;
  challengeId: string;
  data?: Record<string, unknown>;
}

export interface SessionSummary {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalDurationMs: number;
  totalAttempts: number;
  failedAttempts: number;
  rereadCount: number;
  completedChallengesCount: number;
}

const STORAGE_KEY = 'text_physics_telemetry_events';

export class TelemetryService {
  private static events: TelemetryEvent[] = [];
  private static sessionId: string = `session_${Date.now()}`;

  static init() {
    this.record('SESSION_START', 'challenge_1', {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      sessionId: this.sessionId
    });
  }

  static record(type: TelemetryEventType, challengeId: string, data?: Record<string, unknown>) {
    const event: TelemetryEvent = {
      type,
      timestamp: Date.now(),
      challengeId,
      data: { ...data, sessionId: this.sessionId }
    };
    this.events.push(event);

    // Save safely to LocalStorage without breaking gameplay if storage fails
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
      }
    } catch {
      // Ignore quota/access errors
    }
  }

  static getEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  static getSummary(completedChallenges: number, totalAttempts: number, failedAttempts: number, rereads: number, startTime: number): SessionSummary {
    const now = Date.now();
    return {
      sessionId: this.sessionId,
      startTime,
      endTime: now,
      totalDurationMs: now - startTime,
      totalAttempts,
      failedAttempts,
      rereadCount: rereads,
      completedChallengesCount: completedChallenges
    };
  }
}
