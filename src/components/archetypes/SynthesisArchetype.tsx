import React, { useState } from 'react';
import { Gauge, AlertTriangle, Cpu } from 'lucide-react';
import { SoundFX } from '../../engine/SoundFX';
import type { SynthesisParameter } from '../../types/game';

interface SynthesisArchetypeProps {
  title: string;
  instructionSnippet: string;
  parameters: SynthesisParameter[];
  mutualExclusionWarning?: string;
  onCommitSynthesis: (
    values: Record<string, number>,
    isHarmonized: boolean,
    failedParamName?: string
  ) => void;
  disabled?: boolean;
}

export const SynthesisArchetype: React.FC<SynthesisArchetypeProps> = ({
  title,
  instructionSnippet,
  parameters,
  mutualExclusionWarning,
  onCommitSynthesis,
  disabled = false,
}) => {
  const [paramValues, setParamValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    parameters.forEach((p) => {
      initial[p.id] = p.initialValue;
    });
    return initial;
  });

  const [consequenceFeedback, setConsequenceFeedback] = useState<string | null>(null);
  const [isErrorState, setIsErrorState] = useState<boolean>(false);

  const handleValueChange = (paramId: string, value: number) => {
    if (disabled) return;
    SoundFX.playClick();
    setParamValues((prev) => ({
      ...prev,
      [paramId]: value
    }));
    setConsequenceFeedback(null);
  };

  const handleStep = (param: SynthesisParameter, delta: number) => {
    if (disabled) return;
    const current = paramValues[param.id] ?? param.initialValue;
    const next = Math.min(param.maxValue, Math.max(param.minValue, current + delta));
    handleValueChange(param.id, next);
  };

  const handleCommit = () => {
    if (disabled) return;
    SoundFX.playLatch();

    // Check each parameter against target and tolerance
    let allPassed = true;
    let failedParam: SynthesisParameter | undefined;

    for (const p of parameters) {
      const val = paramValues[p.id] ?? p.initialValue;
      const diff = Math.abs(val - p.targetValue);
      if (diff > p.tolerance) {
        allPassed = false;
        failedParam = p;
        break;
      }
    }

    if (allPassed) {
      SoundFX.playChime();
      setIsErrorState(false);
      setConsequenceFeedback(
        'HARMONIC RESONANCE ACHIEVED. All independent physical subsystems synchronize into compound equilibrium!'
      );
    } else {
      SoundFX.playGearShudder();
      setIsErrorState(true);
      setConsequenceFeedback(
        `HARMONIC IMBALANCE: Subsystem [${failedParam?.subsystemLabel}] failed to achieve resonant tolerance. Check your document calculations.`
      );
    }

    onCommitSynthesis(paramValues, allPassed, failedParam?.name);
  };

  return (
    <div className="w-full max-w-xl flex flex-col items-center select-none font-serif text-stone-200 animate-in fade-in duration-300">
      <div className="relative w-full rounded-2xl border-4 border-stone-800 bg-[#0d1117] p-5 shadow-2xl overflow-hidden">
        {/* Top Header Badge */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-900 border border-stone-700 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-amber-300 uppercase shadow flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>{title} • Compound Synthesis Console</span>
        </div>

        {/* Instruction Banner */}
        <div className="mt-2 mb-4 p-3 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
          <p className="text-xs text-stone-300 font-sans leading-relaxed">
            {instructionSnippet}
          </p>
          {mutualExclusionWarning && (
            <p className="text-[10px] font-mono text-amber-400/90 flex items-center gap-1 pt-1 border-t border-stone-800/80">
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{mutualExclusionWarning}</span>
            </p>
          )}
        </div>

        {/* Parameter Adjusters Rack */}
        <div className="space-y-3.5 mb-5">
          {parameters.map((param) => {
            const val = paramValues[param.id] ?? param.initialValue;

            return (
              <div
                key={param.id}
                className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                      {param.subsystemLabel} • {param.name}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">
                      Doc Source: {param.derivationHint}
                    </span>
                  </div>
                  <div className="px-3 py-1 rounded bg-black/60 border border-stone-700 font-mono text-xs font-bold text-amber-300">
                    {val} <span className="text-[10px] text-stone-400 font-normal">{param.unit}</span>
                  </div>
                </div>

                {/* Slider + Step Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleStep(param, -param.step)}
                    disabled={disabled || val <= param.minValue}
                    className="w-7 h-7 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-mono font-bold flex items-center justify-center text-xs cursor-pointer disabled:opacity-40"
                  >
                    -
                  </button>

                  <input
                    type="range"
                    min={param.minValue}
                    max={param.maxValue}
                    step={param.step}
                    value={val}
                    onChange={(e) => handleValueChange(param.id, Number(e.target.value))}
                    disabled={disabled}
                    className="flex-1 accent-amber-500 h-1.5 bg-stone-950 rounded-lg cursor-pointer"
                  />

                  <button
                    type="button"
                    onClick={() => handleStep(param, param.step)}
                    disabled={disabled || val >= param.maxValue}
                    className="w-7 h-7 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-mono font-bold flex items-center justify-center text-xs cursor-pointer disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
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
              <Gauge className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <span>{consequenceFeedback}</span>
          </div>
        )}

        {/* Master Actuation Lever */}
        <div className="pt-2 flex flex-col items-center">
          <button
            type="button"
            onClick={handleCommit}
            disabled={disabled}
            className="px-8 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-stone-950 border border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            Engage Master Compound Actuator
          </button>
          <span className="text-[10px] font-mono text-stone-500 mt-1.5">
            (Commits compound physical synthesis across all parameters)
          </span>
        </div>
      </div>
    </div>
  );
};
