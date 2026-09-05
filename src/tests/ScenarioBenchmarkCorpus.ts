import type { AIScenarioSpecification } from '../types/scenario';
import type { Entity, GameRule, Predicate } from '../types/game';

// ============================================================================
// 100-SCENARIO BENCHMARK CORPUS GENERATOR
// 60 Valid Scenarios (4 Worlds, 6 Topologies, 3 Difficulties, diverse archetypes)
// 40 Targeted Corrupted Scenarios covering the 10 failure categories
// ============================================================================

export interface BenchmarkScenarioSample {
  id: string;
  name: string;
  category: 'valid' | 'corrupted';
  corruptionType?:
    | 'dangling_reference'
    | 'contradictory_relation'
    | 'self_referential_relation'
    | 'missing_document_coverage'
    | 'illegal_action'
    | 'unreachable_victory'
    | 'unrecoverable_failure'
    | 'missing_completion_condition'
    | 'reasoning_answer_leakage'
    | 'malformed_schema';
  spec: AIScenarioSpecification;
  entities: Record<string, Entity>;
  rules: GameRule[];
  completionConditions: Predicate[];
}

export function generate100ScenarioBenchmarkCorpus(): BenchmarkScenarioSample[] {
  const samples: BenchmarkScenarioSample[] = [];

  const worlds: Array<'lost_observatory' | 'arctic_station' | 'triton_deep_sea' | 'orbital_habitat'> = [
    'lost_observatory',
    'arctic_station',
    'triton_deep_sea',
    'orbital_habitat',
  ];

  const topologies: Array<import('../types/scenario').TopologyId> = [
    'TOP-1',
    'TOP-2',
    'TOP-3',
    'TOP-4',
    'TOP-5',
    'TOP-6',
  ];

  const difficulties: Array<import('../types/learner').ReadingDifficulty> = [
    'beginner',
    'intermediate',
    'advanced',
  ];

  const archetypes: Array<import('../types/game').InteractionArchetype> = [
    'TIMELINE',
    'INVESTIGATION',
    'RESOURCE',
    'CALIBRATE',
    'SORT',
    'SYNTHESIS',
  ];

  // --------------------------------------------------------------------------
  // 1. GENERATE 60 VALID SCENARIOS
  // --------------------------------------------------------------------------
  for (let i = 0; i < 60; i++) {
    const world = worlds[i % worlds.length];
    const topology = topologies[i % topologies.length];
    const difficulty = difficulties[i % difficulties.length];
    const archetype = archetypes[i % archetypes.length];

    const entityA = `node_${i}_a`;
    const entityB = `node_${i}_b`;

    const entities: Record<string, Entity> = {
      [entityA]: {
        id: entityA,
        name: `Primary Actuator ${i}`,
        locationId: 'vestibule',
        description: `Operational node A for scenario ${i}`,
        states: { isEngaged: false },
        isInteractable: true,
        isInInventory: false,
        allowedActions: ['ACTIVATE', 'INSPECT'],
        icon: 'Zap',
      },
      [entityB]: {
        id: entityB,
        name: `Secondary Reactor ${i}`,
        locationId: 'vestibule',
        description: `Operational node B for scenario ${i}`,
        states: { isRunning: false },
        isInteractable: true,
        isInInventory: false,
        allowedActions: ['ACTIVATE', 'INSPECT'],
        icon: 'Activity',
      },
    };

    const rules: GameRule[] = [
      {
        id: `rule_${i}_step1`,
        challengeId: `sample_${i}`,
        action: 'ACTIVATE',
        targetId: entityA,
        conditions: [
          { type: 'ENTITY_STATE', target: entityA, property: 'isEngaged', expected: false },
        ],
        onSuccess: {
          effects: [
            { type: 'SET_ENTITY_STATE', target: entityA, property: 'isEngaged', value: true },
            { type: 'SET_FLAG', target: `flag_${i}_primed`, value: true },
          ],
          feedbackMessage: `Actuator ${i} primed.`,
          soundEffect: 'latch_click',
        },
        onFailure: {
          feedbackMessage: 'Already primed.',
        },
      },
      {
        id: `rule_${i}_step2`,
        challengeId: `sample_${i}`,
        action: 'ACTIVATE',
        targetId: entityB,
        conditions: [
          { type: 'ENTITY_STATE', target: entityA, property: 'isEngaged', expected: true },
        ],
        onSuccess: {
          effects: [
            { type: 'SET_ENTITY_STATE', target: entityB, property: 'isRunning', value: true },
            { type: 'SET_FLAG', target: `flag_${i}_complete`, value: true },
          ],
          feedbackMessage: `System ${i} restored.`,
          soundEffect: 'latch_click',
        },
        onFailure: {
          feedbackMessage: 'Prerequisite actuator not engaged.',
        },
      },
    ];

    const completionConditions: Predicate[] = [
      { type: 'ENTITY_STATE', target: entityB, property: 'isRunning', expected: true },
    ];

    const spec: AIScenarioSpecification = {
      world,
      archetype,
      targetSkill: topology === 'TOP-1' ? 'sequencing' : topology === 'TOP-3' ? 'negativeConstraint' : 'causeEffect',
      targetMisconception: 'sequence_causation_confusion',
      difficulty,
      ambiguity: 'moderate',
      centralMystery: `How can technical mechanism ${i} in ${world} be safely stabilized?`,
      documents: [
        {
          id: `doc_${i}_timing`,
          title: `Timing & Precedence Log ${i}`,
          type: 'emergency_log',
          source: `Telemetry Sector ${i}`,
          role: 'event_timing',
          paragraphs: [`Actuator ${entityA} must be primed before secondary power is routed to ${entityB}.`],
          keyClues: [`prime ${entityA} first`],
          factsCovered: [`fact_${i}_1`],
        },
        {
          id: `doc_${i}_mech`,
          title: `Operating Directive ${i}`,
          type: 'maintenance_manual',
          source: `Central Manual ${i}`,
          role: 'physical_mechanism',
          paragraphs: [`Operating ${entityB} without first priming ${entityA} causes immediate circuit trip.`],
          keyClues: [`trip hazard without ${entityA}`],
          factsCovered: [`fact_${i}_2`],
        },
      ],
      requiredFacts: [
        {
          id: `fact_${i}_1`,
          statement: `Actuator ${entityA} must be primed first.`,
          sourceDocumentId: `doc_${i}_timing`,
          snippet: `must be primed before secondary power`,
        },
        {
          id: `fact_${i}_2`,
          statement: `Operating ${entityB} requires prior priming of ${entityA}.`,
          sourceDocumentId: `doc_${i}_mech`,
          snippet: `causes immediate circuit trip`,
        },
      ],
      requiredRelations: [
        {
          id: `rel_${i}_causal`,
          subjectFactId: `fact_${i}_1`,
          relation: 'CAUSED',
          objectFactId: `fact_${i}_2`,
          description: `Priming state allows secondary power route.`,
        },
      ],
      plausibleFalseHypothesis: `Powering ${entityB} directly bypasses priming check.`,
      requiredInference: `Deduce prerequisite order from incident timing log.`,
      supportStrategy: 'Review chronological precedence logs.',
      failureConsequences: [`Power surge in sector ${i}.`],
      successConsequences: [`System ${i} synchronized.`],
      topologyId: topology,
      evidenceSnippet: `must be primed before secondary power`,
      evidenceParagraphIndex: 0,
    };

    samples.push({
      id: `valid_scenario_${i + 1}`,
      name: `Valid Scenario #${i + 1} (${world} • ${topology} • ${difficulty})`,
      category: 'valid',
      spec,
      entities,
      rules,
      completionConditions,
    });
  }

  // --------------------------------------------------------------------------
  // 2. GENERATE 40 TARGETED CORRUPTED SCENARIOS (4 of each of 10 categories)
  // --------------------------------------------------------------------------
  const corruptionTypes: BenchmarkScenarioSample['corruptionType'][] = [
    'dangling_reference',
    'contradictory_relation',
    'self_referential_relation',
    'missing_document_coverage',
    'illegal_action',
    'unreachable_victory',
    'unrecoverable_failure',
    'missing_completion_condition',
    'reasoning_answer_leakage',
    'malformed_schema',
  ];

  let corruptCounter = 0;
  for (const cType of corruptionTypes) {
    for (let cIdx = 0; cIdx < 4; cIdx++) {
      corruptCounter++;
      // Clone from a base valid scenario
      const base = samples[corruptCounter % 60];
      const spec: AIScenarioSpecification = JSON.parse(JSON.stringify(base.spec));
      const entities: Record<string, Entity> = JSON.parse(JSON.stringify(base.entities));
      const rules: GameRule[] = JSON.parse(JSON.stringify(base.rules));
      let completionConditions: Predicate[] = JSON.parse(JSON.stringify(base.completionConditions));

      switch (cType) {
        case 'dangling_reference':
          // Reference closure failure: rule condition targets non-existent entity
          rules[0].conditions.push({
            type: 'ENTITY_STATE',
            target: 'dangling_ghost_entity_999',
            property: 'isOnline',
            expected: true,
          });
          break;

        case 'contradictory_relation':
          // Inject contradictory relation (CAUSED vs DID_NOT_CAUSE)
          spec.requiredRelations.push({
            id: `rel_conflict_${corruptCounter}`,
            subjectFactId: spec.requiredFacts[0].id,
            relation: 'DID_NOT_CAUSE',
            objectFactId: spec.requiredFacts[1].id,
            description: 'Contradicts ground truth causal link',
          });
          break;

        case 'self_referential_relation':
          // Self-relation A CAUSED A
          spec.requiredRelations.push({
            id: `rel_self_${corruptCounter}`,
            subjectFactId: spec.requiredFacts[0].id,
            relation: 'CAUSED',
            objectFactId: spec.requiredFacts[0].id,
            description: 'Self-referential loop',
          });
          break;

        case 'missing_document_coverage':
          // Required fact without document coverage
          spec.requiredFacts.push({
            id: `fact_uncovered_${corruptCounter}`,
            statement: 'Isolated orphan fact with no document coverage in specification',
            sourceDocumentId: 'doc_nonexistent_999',
          });
          break;

        case 'illegal_action':
          // Action outside engine vocabulary
          rules[0].action = 'SUMMON_MAGICAL_DRAGON' as any;
          break;

        case 'unreachable_victory':
          // State-space deadlock: completion requires impossible state
          completionConditions = [
            { type: 'ENTITY_STATE', target: Object.keys(entities)[0], property: 'impossible_state', expected: 'NEVER_REACHABLE' },
          ];
          break;

        case 'unrecoverable_failure':
          // Destructive failure effect without autoReset
          rules[0].onFailure = {
            feedbackMessage: 'Permanent terminal lockout without recovery path.',
            effects: [{ type: 'SET_ENTITY_STATE', target: Object.keys(entities)[0], property: 'isEngaged', value: 'PERMANENTLY_DESTROYED' }],
            autoReset: false,
          };
          break;

        case 'missing_completion_condition':
          // Scenario without victory conditions
          completionConditions = [];
          break;

        case 'reasoning_answer_leakage':
          // Direct solution spoiler in reasoning scenario
          spec.documents[0].paragraphs[0] = `The solution is to simply activate the ${Object.keys(entities)[0]} immediately.`;
          break;

        case 'malformed_schema':
          // Missing required field
          (spec as any).world = 'invalid_mythical_world';
          break;
      }

      samples.push({
        id: `corrupted_${cType}_${cIdx + 1}`,
        name: `Corrupted: ${cType} #${cIdx + 1}`,
        category: 'corrupted',
        corruptionType: cType,
        spec,
        entities,
        rules,
        completionConditions,
      });
    }
  }

  return samples;
}
