import React, { useState } from 'react';
import { Clock, ArrowDown, ArrowUp, GitBranch, Sliders } from 'lucide-react';
import { SoundFX } from '../../engine/SoundFX';
import type { TimelineEvent } from '../../types/game';

interface TimelineArchetypeProps {
  title: string;
  promptQuestion: string;
  events: TimelineEvent[];
  onCommitOrder: (
    orderedEventIds: string[],
    isChronologicallyCorrect: boolean,
    isCausallyCorrect: boolean
  ) => void;
  disabled?: boolean;
}

export const TimelineArchetype: React.FC<TimelineArchetypeProps> = ({
  title,
  promptQuestion,
  events,
  onCommitOrder,
  disabled = false,
}) => {
  // Current order of events as manipulated by player
  const [orderedEvents, setOrderedEvents] = useState<TimelineEvent[]>([...events]);
  // Optional: player selects which earlier event CAUSES the primary crisis
  const [inferredCausalParentId, setInferredCausalParentId] = useState<string | null>(null);

  const moveUp = (index: number) => {
    if (disabled || index === 0) return;
    SoundFX.playClick();
    setOrderedEvents((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (disabled || index === orderedEvents.length - 1) return;
    SoundFX.playClick();
    setOrderedEvents((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleCommit = () => {
    SoundFX.playLatch();

    // Check temporal order
    const isChronologicallyCorrect = orderedEvents.every(
      (ev, idx) => ev.correctChronologicalIndex === idx
    );

    // Check causal root: find event with causalParentId defined
    const targetCausalEvent = events.find((e) => e.causalParentId);
    const isCausallyCorrect = targetCausalEvent
      ? inferredCausalParentId === targetCausalEvent.causalParentId
      : true;

    onCommitOrder(
      orderedEvents.map((e) => e.id),
      isChronologicallyCorrect,
      isCausallyCorrect
    );
  };

  return (
    <div className="w-full max-w-xl p-6 rounded-2xl border-4 border-stone-800 bg-[#0c1017] shadow-2xl font-serif text-stone-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 mb-4">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>Timeline Reconstruction — {title}</span>
        </div>
        <span className="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
          Chronology & Causality
        </span>
      </div>

      <p className="text-xs text-stone-300 mb-4 font-sans leading-relaxed">
        {promptQuestion} Arrange the recorded events from earliest to latest based on the log entries.
      </p>

      {/* Event Ordering Cards */}
      <div className="space-y-2.5 mb-6">
        {orderedEvents.map((ev, idx) => (
          <div
            key={ev.id}
            className="p-3.5 rounded-xl border border-stone-700 bg-stone-900/90 flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="w-6 h-6 rounded-full bg-stone-800 border border-stone-700 text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <p className="text-xs text-stone-200 leading-relaxed font-serif">
                {ev.text}
              </p>
            </div>

            {/* Reorder Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => moveUp(idx)}
                disabled={disabled || idx === 0}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-300 border border-stone-700 cursor-pointer"
                title="Move earlier"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveDown(idx)}
                disabled={disabled || idx === orderedEvents.length - 1}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-300 border border-stone-700 cursor-pointer"
                title="Move later"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Distinguish Temporal Precedence vs Causal Trigger (Harder Skill Check) */}
      <div className="p-4 rounded-xl bg-stone-950 border border-stone-800/90 mb-5 space-y-2 font-sans">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
          <GitBranch className="w-4 h-4" />
          <span>Causal Identification (Temporal Order ≠ Direct Cause)</span>
        </div>
        <p className="text-[11px] text-stone-400">
          Which preceding event was the <strong>primary physical cause</strong> of the subsequent mechanical failure?
        </p>

        <div className="grid gap-1.5 pt-1">
          {orderedEvents.slice(0, -1).map((ev) => (
            <label
              key={ev.id}
              className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                inferredCausalParentId === ev.id
                  ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                  : 'border-stone-800 bg-stone-900/50 text-stone-300 hover:border-stone-700'
              }`}
            >
              <input
                type="radio"
                name="causalRoot"
                checked={inferredCausalParentId === ev.id}
                onChange={() => {
                  SoundFX.playClick();
                  setInferredCausalParentId(ev.id);
                }}
                className="accent-amber-500"
              />
              <span className="font-serif">{ev.text}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Commit Button */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={handleCommit}
          disabled={disabled}
          className="w-full py-3.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
        >
          <Sliders className="w-4 h-4" />
          <span>Commit Chronological Sequence Deduction</span>
        </button>
      </div>
    </div>
  );
};
