import React, { useState } from 'react';
import { FileText, Bookmark, Pin, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SoundFX } from '../../engine/SoundFX';
import type { EvidenceClaim, EvidenceSnippet } from '../../types/game';

interface EvidenceArchetypeProps {
  title: string;
  instructionSnippet: string;
  claims: EvidenceClaim[];
  snippets: EvidenceSnippet[];
  onCommitEvidence: (claimId: string, pinnedSnippetId: string, isSubstantiated: boolean) => void;
  disabled?: boolean;
}

export const EvidenceArchetype: React.FC<EvidenceArchetypeProps> = ({
  title,
  instructionSnippet,
  claims,
  snippets,
  onCommitEvidence,
  disabled = false,
}) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string>(claims[0]?.id || '');
  const [pinnedSnippetId, setPinnedSnippetId] = useState<string | null>(null);
  const [stance, setStance] = useState<'supports' | 'refutes'>('supports');
  const [consequenceFeedback, setConsequenceFeedback] = useState<string | null>(null);
  const [isErrorState, setIsErrorState] = useState<boolean>(false);

  const activeClaim = claims.find((c) => c.id === selectedClaimId) || claims[0];

  const handleSelectSnippet = (snippetId: string) => {
    if (disabled) return;
    SoundFX.playClick();
    setPinnedSnippetId(snippetId);
    setConsequenceFeedback(null);
  };

  const handleCommit = () => {
    if (!pinnedSnippetId || !activeClaim || disabled) return;

    SoundFX.playLatch();
    const isAccurateSnippet = pinnedSnippetId === activeClaim.requiredProofSnippetId;
    const isAccurateStance = activeClaim.isTrue ? stance === 'supports' : stance === 'refutes';
    const isSuccess = isAccurateSnippet && isAccurateStance;

    if (isSuccess) {
      SoundFX.playChime();
      setIsErrorState(false);
      setConsequenceFeedback(
        `EVIDENTIARY CITATION VERIFIED. The excerpt from “${
          snippets.find((s) => s.id === pinnedSnippetId)?.documentTitle
        }” directly substantiates the claim.`
      );
    } else {
      SoundFX.playSpark();
      setIsErrorState(true);
      setConsequenceFeedback(
        'INSUFFICIENT PROOF. The selected citation does not corroborate the causal claim under forensic review.'
      );
    }

    onCommitEvidence(activeClaim.id, pinnedSnippetId, isSuccess);
  };

  return (
    <div className="w-full max-w-xl flex flex-col items-center select-none font-serif text-stone-200 animate-in fade-in duration-300">
      <div className="relative w-full rounded-2xl border-4 border-stone-800 bg-[#0d1117] p-5 shadow-2xl overflow-hidden">
        {/* Top Header Badge */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-900 border border-stone-700 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-amber-300 uppercase shadow flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span>{title} • Evidentiary Attribution Docket</span>
        </div>

        {/* Instruction Banner */}
        <div className="mt-2 mb-4 p-3 rounded-xl bg-stone-950/70 border border-stone-800 flex items-start gap-2.5">
          <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-stone-300 font-sans leading-relaxed">
            {instructionSnippet}
          </p>
        </div>

        {/* Claim Selector & Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>TECHNICAL HYPOTHESIS / CLAIM:</span>
            {claims.length > 1 && (
              <div className="flex gap-1.5">
                {claims.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedClaimId(c.id);
                      setPinnedSnippetId(null);
                      setConsequenceFeedback(null);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                      selectedClaimId === c.id
                        ? 'bg-amber-950 border-amber-500 text-amber-200 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Claim #{idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-stone-900/90 border border-amber-900/40 space-y-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-400/90 uppercase tracking-wider">
                Source: {activeClaim?.claimSource}
              </span>
            </div>
            <p className="text-sm font-bold text-amber-100 font-serif leading-snug">
              “{activeClaim?.claimText}”
            </p>
          </div>

          {/* Stance Selector */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-stone-400 text-[11px]">Your Evaluation:</span>
            <button
              type="button"
              onClick={() => setStance('supports')}
              className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                stance === 'supports'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              Cites Proof (Supports)
            </button>
            <button
              type="button"
              onClick={() => setStance('refutes')}
              className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                stance === 'refutes'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              Cites Counter-Evidence (Refutes)
            </button>
          </div>
        </div>

        {/* Excerpt Pinboard */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>AVAILABLE DOCUMENT EXCERPTS (PIN PROOF):</span>
            <span className="text-[10px] text-stone-500">Select one text citation</span>
          </div>

          <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
            {snippets.map((snip) => {
              const isPinned = pinnedSnippetId === snip.id;

              return (
                <button
                  key={snip.id}
                  type="button"
                  onClick={() => handleSelectSnippet(snip.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    isPinned
                      ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-amber-100'
                      : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-900'
                  }`}
                >
                  <Pin
                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-transform ${
                      isPinned ? 'text-amber-400 rotate-45 scale-110' : 'text-stone-500'
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                      <span className="font-semibold text-amber-300">{snip.documentTitle}</span>
                      {snip.authorOrDate && <span>{snip.authorOrDate}</span>}
                    </div>
                    <p className="text-xs font-serif leading-relaxed italic">
                      “{snip.snippetText}”
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Consequence Feedback Banner */}
        {consequenceFeedback && (
          <div
            className={`p-3 rounded-xl border text-xs font-serif leading-relaxed mb-4 animate-in fade-in flex items-start gap-2 ${
              isErrorState
                ? 'bg-rose-950/60 border-rose-600/60 text-rose-200'
                : 'bg-amber-950/60 border-amber-600/60 text-amber-200'
            }`}
          >
            {isErrorState ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <span>{consequenceFeedback}</span>
          </div>
        )}

        {/* Commit Action */}
        <div className="pt-2 flex flex-col items-center">
          <button
            type="button"
            onClick={handleCommit}
            disabled={!pinnedSnippetId || disabled}
            className={`px-8 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 ${
              !pinnedSnippetId || disabled
                ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-500 text-stone-950 border border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
            }`}
          >
            Commit Evidentiary Deduction
          </button>
          <span className="text-[10px] font-mono text-stone-500 mt-1.5">
            (Pins citation permanently to hypothesis log)
          </span>
        </div>
      </div>
    </div>
  );
};
