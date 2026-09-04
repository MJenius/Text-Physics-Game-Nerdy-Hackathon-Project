# Text Physics: An AI-directed reading adventure where understanding text changes the world.

> **The AI does not merely generate reading content.**  
> It observes how the learner reasons, identifies misconceptions, chooses the next kind of game, adapts the scenario, and measures transfer.

---

## The Problem

Reading comprehension tools fall into two failure modes:

1. **Quiz engines** — ask a question, grade the answer, move on. They test recall, not reasoning.
2. **AI generators** — produce unlimited content with no structural guarantee. Learners can succeed without understanding.

Neither approach observes *how* a reader reasons. Neither detects lucky guesses. Neither adapts the *kind of game* — only the difficulty slider.

## The Idea

**Text Physics** treats reading comprehension as a physical puzzle. Every paragraph is a technical document embedded in a steampunk/sci-fi world. Every action — opening a valve, activating a pump, routing power — requires the player to read, interpret, and reason about text *before* acting. Wrong reasoning produces observable physical consequences: steam bursts, breaker trips, frozen airlocks.

The game's AI watches the reasoning process, not just the final answer.

---

## The Core Loop

```
READ → INTERPRET → DECIDE → ACT → CONSEQUENCE → DISCOVER → REINTERPRET
```

1. **READ** — Open multi-document dossiers: emergency logs, field journals, maintenance manuals, witness transcripts.
2. **INTERPRET** — Extract temporal sequence, causal mechanisms, safety constraints, and hidden prerequisites.
3. **DECIDE** — Form a hypothesis about the correct action sequence.
4. **ACT** — Interact with a deterministic physics-like world (valves, gears, breakers, reactors).
5. **CONSEQUENCE** — The world responds: steam bursts, mechanism seizures, thermal trips, power overloads.
6. **DISCOVER** — Physical consequences reveal what was misunderstood, prompting document re-examination.
7. **REINTERPRET** — Return to the text with new evidence, forming deeper understanding.

---

## Why AI Matters — And Why AI Does NOT Control the Game

### Architecture: AI Proposes, the Engine Decides

```
┌──────────────────┐     ┌────────────────────┐     ┌─────────────────────┐
│  PLAYER ACTION   │────▸│    TELEMETRY        │────▸│   LEARNER MODEL     │
│  (click, read,   │     │  (document order,   │     │  (8 skills, 10      │
│   interact)      │     │   guess frequency,  │     │   misconceptions,   │
│                  │     │   recovery history)  │     │   7 lucky-answer    │
│                  │     │                      │     │   categories)       │
└──────────────────┘     └────────────────────┘     └─────────┬───────────┘
                                                               │
                         ┌────────────────────┐                ▼
                         │   DETERMINISTIC     │◂──────┌─────────────────────┐
                         │   RUNTIME           │       │   AI DIAGNOSIS      │
                         │   (rule evaluator,  │       │   (Gemini structured │
                         │    physics engine,  │       │    JSON analysis +   │
                         │    state machine)   │       │    fallback)         │
                         └────────────────────┘       └─────────┬───────────┘
                                  ▲                              │
                         ┌────────┴───────────┐                ▼
                         │   SCENARIO          │◂──────┌─────────────────────┐
                         │   COMPILER          │       │   EXPERIENCE        │
                         │   (DAG reachability,│       │   PRESCRIPTION      │
                         │    anti-leakage,    │       │   (world, archetype,│
                         │    recovery check)  │       │    action pattern,  │
                         │                     │       │    scaffolding)     │
                         └─────────────────────┘       └─────────────────────┘
```

**The AI never generates gameplay directly.** It produces a structured prescription — target skill, world, archetype, action pattern, document types, ambiguity level, scaffolding — which the deterministic ScenarioCompiler validates against a 14-point pipeline before the engine executes it.

If the AI returns invalid data, the engine uses a deterministic fallback. The game is always solvable. Zero LLM deadlocks.

---

## Learner Model

The learner model tracks:

| Dimension | Details |
|-----------|---------|
| **8 Reading Skills** | Literal Retrieval, Sequencing, Cause & Effect, Exclusion Logic, Multi-Condition, Inference, Synthesis, Transfer |
| **Skill Confidence** | Evidence-weighted confidence (0.0–1.0) per skill, not just raw scores |
| **10 Misconceptions** | Temporal reversal, causal inversion, ignored negation, missed prerequisite, superficial keyword matching, premature commitment, insufficient evidence, overgeneralization, sequence-causation confusion, transfer failure |
| **Behavioral Log** | Documents opened, reading order, evidence selected, ignored evidence, action ordering, repeated guesses, early commitments, hint requests, recoveries after failure |
| **7 Lucky Answer Categories** | Correct+correct evidence, correct+weak evidence, wrong+partial understanding, wrong+irrelevant reasoning, correct after hint, transfer success, transfer failure |
| **Experience Memory** | Interventions used, archetypes experienced, worlds visited, transfer outcomes |

### Lucky Answer Discrimination

A correct answer doesn't mean the learner understood the text. The engine distinguishes:

- ✅ **Correct answer + correct evidence** → Full skill credit
- ⚠️ **Correct answer + weak evidence** → Minimal skill credit, *reduced* confidence
- ❌ **Wrong answer + irrelevant reasoning** → Skill penalty + confidence penalty
- 🔄 **Correct after hint** → Partial credit only

---

## 12 Gameplay Archetypes & 4 Distinct Worlds

### Archetypes

| Archetype | Action Pattern | Example |
|-----------|---------------|---------|
| NAVIGATION | Spatial orientation | Navigate observatory corridors |
| MECHANISM | Arrange & Operate | Strict chronological gear interlock |
| TIMELINE | Arrange & Operate | Reconstruct event chronology |
| INVESTIGATION | Evaluate & Inspect | Multi-document forensic incident analysis |
| EVIDENCE | Evaluate & Inspect | Cross-reference witness accounts |
| ROUTE | Allocate Under Exclusion | Mutual exclusion path selection |
| RESOURCE | Allocate Under Exclusion | Power budget under safety constraints |
| SORT | Forensic Retrieval | Classify and sequence evidence layers |
| CALIBRATE | Deduce State & Commit | Multi-instrument alignment |
| REPAIR | Deduce State & Commit | Diagnose and fix mechanism |
| DIALOGUE | Forensic Retrieval | Extract clues from character accounts |
| SYNTHESIS | Deduce State & Commit | Integrate multi-source conclusions |

### Worlds

| World | Theme | Primary Skill Focus |
|-------|-------|-------------------|
| **Lost Observatory** | Victorian steampunk astronomical facility | Sequencing, Mechanism |
| **Boreas Arctic Station** | Sub-zero research outpost, frozen systems | Causal reasoning, Investigation |
| **Triton-IV Deep Sea** | Submarine reactor crisis, geothermal vent | Transfer, Causal chains |
| **Aether-9 Orbital** | Zero-gravity orbital habitat | Multi-condition, Synthesis |

---

## Adaptive Example: How Different Learners Get Different Games

### Profile A: Causal Weakness

- **Observed**: Treats temporal precedence as causal evidence. Early commitments. Weak evidence attribution.
- **Director Prescribes**: Arctic Station → EVIDENCE archetype → EVALUATE_AND_INSPECT → High ambiguity → Multi-document investigation dossier

### Profile B: Sequencing Weakness

- **Observed**: Reverses action order. Recovery after failure. Reads documents in wrong order.
- **Director Prescribes**: Lost Observatory → TIMELINE archetype → ARRANGE_AND_OPERATE → Low ambiguity → Strict chronological interlock

### Profile C: Surface Guesser

- **Observed**: 6+ repeated guesses, zero documents opened, 3+ weak-evidence lucky answers.
- **Director Prescribes**: Arctic Core Vault → SORT archetype → FORENSIC_RETRIEVAL → Low ambiguity → Structured document cross-examination

### Profile D: Transfer Ready

- **Observed**: High causal mastery (0.88), strong evidence attribution, diverse world experience.
- **Director Prescribes**: Triton-IV Deep Sea → INVESTIGATION archetype → Hero Transfer scenario → Novel domain crisis triage

> **Key guarantee**: Same reading skill (e.g. causeEffect = 0.28) + different behavioral history = materially different world, archetype, action pattern, document structure, ambiguity level, and scaffolding.

---

## ScenarioCompiler: 14-Point Validation Pipeline

Every scenario — whether hand-authored or AI-generated — passes through a rigorous 14-point validation pipeline:

1. **Schema validation** — Required fields present
2. **World compatibility** — World exists in validated registry
3. **Archetype compatibility** — Archetype exists in validated registry
4. **Entity validation** — All rule targets exist in world entity dictionary
5. **Fact validation** — Required facts are non-empty
6. **Relation validation** — Knowledge graph consistency (no dangling nodes)
7. **Document coverage** — Every fact has a source document snippet
8. **Action legality** — All player actions belong to legal engine vocabulary
9. **State transition simulation** — Valid transition path exists
10. **Reachability DAG search** — Bounded BFS confirms winning path
11. **Failure recovery validation** — No irreversible dead-ends
12. **Evidence alignment** — Target claim has evidence snippet
13. **Answer leakage detection** — Spoiler phrases and imperative leakage rejected
14. **Completion conditions check** — Victory conditions are defined

### Anti-Leakage Examples

Rejected: *"Therefore choose the thermal bypass valve"*, *"Simply activate the pump"*, *"The correct answer is..."*

---

## Hero Cross-World Transfer

When a learner demonstrates mastery in one domain (e.g., causal reasoning at the Observatory), the Director triggers a **Hero Transfer** to an entirely new world (Triton-IV Deep Sea). The learner must apply the same reasoning skill to a novel context with different surface features.

Transfer success and failure are tracked separately from domain-specific skill scores. The Notebook persists cross-world consequence history.

---

## Director Inspector

Press **`~`** at any time to open the Director Inspector — a full developer diagnostic terminal showing:

- **Diagnosis & Cognitive Model** — Skills, misconceptions, confidence, behavioral evidence
- **World State & Flags** — Entity states, inventory, narrative flags
- **Live Telemetry Stream** — Real-time event log
- **Pipeline & Event Timeline** — Complete chain: Player → Telemetry → Learner → AI → Prescription → Compiler → Runtime
- **Simulation & Controls** — One-click synthetic profile activation with prescription comparison table, act jumper, world switcher

---

## Benchmark & Evaluation Results

The project includes a comprehensive benchmark test suite (`AdaptivePipelineBenchmark.test.ts`) that verifies:

| Test | Result |
|------|--------|
| Same skill, different history → ≥5 material differences | ✅ Pass |
| 5 profiles produce ≥4 distinct action patterns | ✅ Pass |
| Behavioral evidence (not just error counts) drives routing | ✅ Pass |
| Surface guesser behavioral override works | ✅ Pass |
| Negation world alternation prevents single-world collapse | ✅ Pass |
| AI prescription fields not collapsed by post-processing | ✅ Pass |
| Compiler validates well-formed scenarios (14+ checks) | ✅ Pass |
| Compiler rejects invalid worlds | ✅ Pass |
| Compiler rejects invalid archetypes | ✅ Pass |
| Compiler rejects scenarios with no completion conditions | ✅ Pass |
| Compiler detects answer leakage | ✅ Pass |
| Batch benchmark metrics (rejection rate, reachability, latency) | ✅ Pass |

**56 tests, 9 test files, 0 failures.**

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run test suite (56 tests)
npm test

# Production build
npm run build
```

### Requirements

- Node.js 18+
- npm 9+
- Optional: Gemini API key in `.env` for live AI diagnosis (falls back deterministically without it)

---

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: Zustand with Immer middleware
- **AI**: Google Gemini (structured JSON diagnosis with deterministic fallback)
- **Testing**: Vitest (56 comprehensive tests)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

---

*Built for the Nerdy AI Hackathon. Text Physics demonstrates that AI in education should observe, diagnose, and adapt — not just generate content.*
