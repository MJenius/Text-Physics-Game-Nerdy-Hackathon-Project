import React, { useState } from 'react';
import { Layers, Sliders } from 'lucide-react';
import { SoundFX } from '../../engine/SoundFX';
import type { SortCategory, SortItem } from '../../types/game';

interface SortClassifyArchetypeProps {
  title: string;
  instructionSnippet: string;
  categories: SortCategory[];
  items: SortItem[];
  onCommitSort: (
    assignments: Record<string, string>, // itemId -> categoryId
    isAccurate: boolean,
    distractorCountAssigned: number
  ) => void;
  disabled?: boolean;
}

export const SortClassifyArchetype: React.FC<SortClassifyArchetypeProps> = ({
  title,
  instructionSnippet,
  categories,
  items,
  onCommitSort,
  disabled = false,
}) => {
  // assignments: itemId -> categoryId
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const handleSelectItem = (itemId: string) => {
    if (disabled) return;
    SoundFX.playClick();
    setSelectedItemId(selectedItemId === itemId ? null : itemId);
  };

  const handleAssignToCategory = (catId: string) => {
    if (!selectedItemId || disabled) return;
    SoundFX.playLatch();
    setAssignments((prev) => ({
      ...prev,
      [selectedItemId]: catId,
    }));
    setSelectedItemId(null);
  };

  const handleUnassign = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    SoundFX.playClick();
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleCommit = () => {
    SoundFX.playTumbler();

    let isAccurate = true;
    let distractorCount = 0;

    for (const item of items) {
      const assignedCat = assignments[item.id];
      if (item.isDistractor) {
        if (assignedCat) {
          // Player mistakenly classified a distractor!
          distractorCount += 1;
          isAccurate = false;
        }
      } else {
        if (assignedCat !== item.targetCategoryId) {
          isAccurate = false;
        }
      }
    }

    onCommitSort(assignments, isAccurate, distractorCount);
  };

  const unassignedItems = items.filter((i) => !assignments[i.id]);

  return (
    <div className="w-full max-w-xl p-6 rounded-2xl border-4 border-stone-800 bg-[#0c1017] shadow-2xl font-serif text-stone-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 mb-4">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Classification & Taxonomy — {title}</span>
        </div>
        <span className="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
          Rule-Based Sorting
        </span>
      </div>

      <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-300 font-serif mb-4 leading-relaxed">
        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wide block mb-0.5">
          Text Categorization Principle:
        </span>
        “{instructionSnippet}”
      </div>

      {/* Unassigned Items Pool */}
      <div className="mb-5">
        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-2">
          Items Awaiting Classification (Select an item, then click target bin):
        </span>

        {unassignedItems.length === 0 ? (
          <p className="text-xs text-stone-500 italic py-2 text-center">
            All items assigned to categories. Review below before committing.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unassignedItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectItem(item.id)}
                disabled={disabled}
                className={`px-3 py-2 rounded-xl border text-xs font-serif transition-all cursor-pointer ${
                  selectedItemId === item.id
                    ? 'bg-amber-500 text-stone-950 font-bold border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] scale-105'
                    : 'bg-stone-900 border-stone-700 text-stone-300 hover:border-amber-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Target Category Bins */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {categories.map((cat) => {
          const assignedInThisCat = items.filter((i) => assignments[i.id] === cat.id);

          return (
            <div
              key={cat.id}
              onClick={() => handleAssignToCategory(cat.id)}
              className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between min-h-[130px] cursor-pointer ${
                selectedItemId
                  ? 'border-dashed border-amber-500/70 bg-stone-900/80 hover:bg-stone-850 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  : 'border-stone-700 bg-stone-900/60'
              }`}
            >
              <div>
                <h4 className="text-xs font-bold font-serif text-amber-200">
                  {cat.name}
                </h4>
                <p className="text-[10px] font-sans text-stone-400 leading-tight mt-0.5">
                  {cat.description}
                </p>
              </div>

              {/* Items currently in this category */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-stone-800">
                {assignedInThisCat.map((item) => (
                  <span
                    key={item.id}
                    onClick={(e) => handleUnassign(item.id, e)}
                    className="px-2 py-0.5 rounded bg-stone-800 text-[10px] font-mono text-stone-200 hover:bg-rose-900 hover:text-rose-200 border border-stone-700 cursor-pointer"
                    title="Click to remove"
                  >
                    {item.label} ×
                  </span>
                ))}
              </div>
            </div>
          );
        })}
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
          <span>Commit Sample Classification</span>
        </button>
      </div>
    </div>
  );
};
