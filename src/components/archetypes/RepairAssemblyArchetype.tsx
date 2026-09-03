import React, { useState } from 'react';
import { Wrench, Sliders } from 'lucide-react';
import { SoundFX } from '../../engine/SoundFX';
import type { AssemblyComponent } from '../../types/game';

interface RepairAssemblyArchetypeProps {
  title: string;
  instructionSnippet: string;
  slotsCount: number;
  components: AssemblyComponent[];
  onCommitAssembly: (
    slots: (string | null)[],
    isCorrect: boolean,
    failureReason?: string
  ) => void;
  disabled?: boolean;
}

export const RepairAssemblyArchetype: React.FC<RepairAssemblyArchetypeProps> = ({
  title,
  instructionSnippet,
  slotsCount = 3,
  components,
  onCommitAssembly,
  disabled = false,
}) => {
  // Array of componentId or null representing each slot
  const [slots, setSlots] = useState<(string | null)[]>(new Array(slotsCount).fill(null));
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const availableComponents = components.filter((c) => !slots.includes(c.id));

  const handleSelectComponent = (id: string) => {
    if (disabled) return;
    SoundFX.playClick();
    setSelectedComponentId(selectedComponentId === id ? null : id);
  };

  const handleSlotClick = (slotIdx: number) => {
    if (disabled) return;

    if (slots[slotIdx]) {
      // Remove from slot
      SoundFX.playClick();
      setSlots((prev) => {
        const next = [...prev];
        next[slotIdx] = null;
        return next;
      });
      return;
    }

    if (selectedComponentId) {
      // Place in slot
      SoundFX.playLatch();
      setSlots((prev) => {
        const next = [...prev];
        next[slotIdx] = selectedComponentId;
        return next;
      });
      setSelectedComponentId(null);
    }
  };

  const handleCommit = () => {
    SoundFX.playGear();

    // Check slots
    let isCorrect = true;
    let failureReason: string | undefined = undefined;

    // Verify all slots filled
    if (slots.some((s) => s === null)) {
      isCorrect = false;
      failureReason = 'Assembly incomplete: open sockets remain.';
    } else {
      // Check each component against its required preceding component
      for (let i = 0; i < slots.length; i++) {
        const compId = slots[i];
        const comp = components.find((c) => c.id === compId);
        if (!comp) continue;

        if (comp.slotIndex !== i) {
          isCorrect = false;
          failureReason = `Component mismatch at Socket #${i + 1}.`;
          break;
        }

        if (comp.requiredPrecedingComponentId) {
          const precedingCompId = i > 0 ? slots[i - 1] : null;
          if (precedingCompId !== comp.requiredPrecedingComponentId) {
            isCorrect = false;
            failureReason = `Dependency breached: ${comp.name} placed before prerequisite fitting.`;
            break;
          }
        }
      }
    }

    onCommitAssembly(slots, isCorrect, failureReason);
  };

  return (
    <div className="w-full max-w-xl p-6 rounded-2xl border-4 border-stone-800 bg-[#0c1017] shadow-2xl font-serif text-stone-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 mb-4">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
          <Wrench className="w-4 h-4" />
          <span>Precision Assembly — {title}</span>
        </div>
        <span className="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
          Component Train
        </span>
      </div>

      <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-300 font-serif mb-4 leading-relaxed">
        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wide block mb-0.5">
          Assembly Directive:
        </span>
        “{instructionSnippet}”
      </div>

      {/* Assembly Sockets / Train */}
      <div className="mb-6">
        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-2">
          Component Sockets (Click socket to seat/unseat selected fitting):
        </span>

        <div className="grid grid-cols-3 gap-3">
          {slots.map((compId, idx) => {
            const comp = components.find((c) => c.id === compId);

            return (
              <div
                key={idx}
                onClick={() => handleSlotClick(idx)}
                className={`p-3.5 rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[110px] cursor-pointer text-center ${
                  compId
                    ? 'bg-amber-950/20 border-amber-600/70 text-amber-200 shadow-inner'
                    : selectedComponentId
                    ? 'border-dashed border-amber-400/80 bg-stone-900/80 hover:bg-stone-850 animate-pulse'
                    : 'border-stone-700 bg-stone-950/70 hover:border-stone-600'
                }`}
              >
                <span className="text-[10px] font-mono text-stone-400 uppercase mb-1">
                  Socket #{idx + 1}
                </span>

                {comp ? (
                  <>
                    <Wrench className="w-5 h-5 text-amber-400 mb-1" />
                    <span className="text-xs font-bold font-serif leading-tight">
                      {comp.name}
                    </span>
                    <span className="text-[9px] font-mono text-stone-400 mt-1">
                      (Click to unseat)
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-mono text-stone-400">
                    Empty Cradle
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Parts Tray */}
      <div className="mb-6">
        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-2">
          Machinist Tray — Available Components:
        </span>

        <div className="grid grid-cols-2 gap-2">
          {availableComponents.map((comp) => (
            <button
              key={comp.id}
              type="button"
              onClick={() => handleSelectComponent(comp.id)}
              disabled={disabled}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedComponentId === comp.id
                  ? 'bg-amber-500 text-stone-950 font-bold border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-stone-900/80 border-stone-700 hover:border-amber-400 text-stone-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-semibold">
                  {comp.name}
                </span>
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10px] font-sans opacity-80 mt-0.5 leading-tight">
                {comp.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Commit Button */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={handleCommit}
          disabled={disabled || slots.some((s) => s === null)}
          className="w-full py-3.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
        >
          <Sliders className="w-4 h-4" />
          <span>Lock Assembly Train into Casing</span>
        </button>
      </div>
    </div>
  );
};
