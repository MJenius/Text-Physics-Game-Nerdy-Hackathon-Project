import React, { useState } from 'react';
import { Eye, Sliders, FileSearch } from 'lucide-react';
import { SoundFX } from '../../engine/SoundFX';

export interface ForensicsHotspot {
  id: string;
  name: string;
  iconName?: string;
  observationText: string;
  isCrucialEvidence: boolean;
  requiresItemToInspect?: string;
}

interface SearchForensicsArchetypeProps {
  title: string;
  sceneDescription: string;
  hotspots: ForensicsHotspot[];
  onHotspotInspected: (hotspotId: string, isCrucial: boolean, totalInspected: number) => void;
  onCommitDeduction: (discoveredClueIds: string[]) => void;
  disabled?: boolean;
}

export const SearchForensicsArchetype: React.FC<SearchForensicsArchetypeProps> = ({
  title,
  sceneDescription,
  hotspots,
  onHotspotInspected,
  onCommitDeduction,
  disabled = false,
}) => {
  const [inspectedIds, setInspectedIds] = useState<string[]>([]);
  const [activeObservation, setActiveObservation] = useState<string | null>(null);

  const handleInspect = (hotspot: ForensicsHotspot) => {
    if (disabled) return;
    SoundFX.playClick();

    if (!inspectedIds.includes(hotspot.id)) {
      const nextInspected = [...inspectedIds, hotspot.id];
      setInspectedIds(nextInspected);
      onHotspotInspected(hotspot.id, hotspot.isCrucialEvidence, nextInspected.length);
    }

    setActiveObservation(hotspot.observationText);
  };

  const handleCommit = () => {
    SoundFX.playLatch();
    onCommitDeduction(inspectedIds);
  };

  return (
    <div className="w-full max-w-xl p-6 rounded-2xl border-4 border-stone-800 bg-[#0c1017] shadow-2xl font-serif text-stone-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 mb-4">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
          <FileSearch className="w-4 h-4" />
          <span>Forensic Search & Inspection — {title}</span>
        </div>
        <span className="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
          Scene Hotspot Analysis
        </span>
      </div>

      <p className="text-xs text-stone-300 font-sans mb-4 leading-relaxed">
        {sceneDescription}
      </p>

      {/* Interactive Search Hotspots Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {hotspots.map((h) => {
          const isExamined = inspectedIds.includes(h.id);

          return (
            <button
              key={h.id}
              type="button"
              onClick={() => handleInspect(h)}
              disabled={disabled}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
                isExamined
                  ? 'bg-amber-950/20 border-amber-600/50 text-stone-200'
                  : 'bg-stone-900/80 border-stone-700/80 hover:border-amber-400/70 hover:bg-stone-850 text-stone-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold font-serif">
                  {h.name}
                </span>
                <Eye className={`w-3.5 h-3.5 ${isExamined ? 'text-amber-400' : 'text-stone-500'}`} />
              </div>

              <span className="text-[10px] font-mono text-stone-400 uppercase mt-2">
                {isExamined ? 'Examined (Clue Logged)' : 'Click to Inspect'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Observation Box */}
      {activeObservation && (
        <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 font-serif mb-5 animate-in fade-in leading-relaxed">
          <span className="text-[10px] font-mono text-amber-400 uppercase block mb-1">
            Physical Observation:
          </span>
          “{activeObservation}”
        </div>
      )}

      {/* Commit Button */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={handleCommit}
          disabled={disabled || inspectedIds.length === 0}
          className="w-full py-3.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
        >
          <Sliders className="w-4 h-4" />
          <span>Formulate Forensic Conclusion</span>
        </button>
      </div>
    </div>
  );
};
