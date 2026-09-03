import React, { useState } from 'react';
import { Gauge, Sliders } from 'lucide-react';
import { SoundFX } from '../../engine/SoundFX';

interface CalibrateArchetypeProps {
  title: string;
  variableName: string;
  unit: string;
  initialValue?: number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  targetValue: number;
  tolerance?: number;
  instructionSnippet: string;
  onCommit: (calibratedValue: number, isAccurate: boolean) => void;
  disabled?: boolean;
}

export const CalibrateArchetype: React.FC<CalibrateArchetypeProps> = ({
  title,
  variableName,
  unit,
  initialValue = 0,
  minValue = 0,
  maxValue = 100,
  step = 1,
  targetValue,
  tolerance = 2,
  instructionSnippet,
  onCommit,
  disabled = false,
}) => {
  const [currentValue, setCurrentValue] = useState<number>(initialValue);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentValue(val);
    SoundFX.playClick();
  };

  const handleNudge = (delta: number) => {
    setCurrentValue((prev) => {
      const next = Math.min(maxValue, Math.max(minValue, prev + delta));
      SoundFX.playClick();
      return next;
    });
  };

  const handleCommit = () => {
    SoundFX.playLatch();
    const diff = Math.abs(currentValue - targetValue);
    const isAccurate = diff <= tolerance;
    onCommit(currentValue, isAccurate);
  };

  // Calculate gauge angle (-90deg to +90deg)
  const range = maxValue - minValue || 1;
  const percent = Math.min(1, Math.max(0, (currentValue - minValue) / range));
  const needleAngle = -90 + percent * 180;

  return (
    <div className="w-full max-w-xl p-6 rounded-2xl border-4 border-stone-800 bg-[#0c1017] shadow-2xl font-serif text-stone-200">
      <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 mb-5">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
          <Gauge className="w-4 h-4" />
          <span>Physical Calibration — {title}</span>
        </div>
        <span className="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
          Analog Vernier Scale
        </span>
      </div>

      {/* Analog Dial / Gauge Readout */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative w-48 h-28 overflow-hidden flex items-end justify-center">
          {/* Gauge Arc */}
          <div className="w-44 h-44 rounded-full border-8 border-stone-700 border-t-amber-600/70 border-r-amber-700/60 border-l-stone-700 absolute -bottom-22 flex items-center justify-center bg-stone-950 shadow-inner">
            <div className="w-32 h-32 rounded-full border border-stone-800 bg-[#070b12]" />
          </div>

          {/* Needle */}
          <div
            className="w-1 h-20 bg-amber-400 absolute bottom-0 origin-bottom transition-transform duration-150 rounded-t shadow-[0_0_8px_rgba(245,158,11,0.6)]"
            style={{ transform: `rotate(${needleAngle}deg)` }}
          />
          {/* Needle Pivot Pin */}
          <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-stone-950 absolute -bottom-2 z-10 shadow" />
        </div>

        {/* Current Readout Value (Strict neutral styling: zero green cheat!) */}
        <div className="mt-3 flex flex-col items-center">
          <div className="flex items-baseline gap-1.5 px-4 py-1.5 rounded-xl bg-stone-900/90 border border-stone-700 font-mono">
            <span className="text-2xl font-bold text-stone-100 tracking-wider">
              {currentValue}
            </span>
            <span className="text-xs text-stone-400 uppercase">{unit}</span>
          </div>
          <span className="text-[11px] font-mono text-stone-400 mt-1 uppercase tracking-wider">
            {variableName} Setting
          </span>
        </div>
      </div>

      {/* Micro-Adjustment Controls */}
      <div className="space-y-4 my-5 bg-stone-900/50 p-4 rounded-xl border border-stone-800">
        <div className="flex items-center justify-between text-xs font-mono text-stone-400">
          <span>{minValue} {unit}</span>
          <span className="text-[11px] text-stone-300">Adjust Vernier Pitch</span>
          <span>{maxValue} {unit}</span>
        </div>

        {/* Tactile Slider */}
        <input
          type="range"
          min={minValue}
          max={maxValue}
          step={step}
          value={currentValue}
          onChange={handleSliderChange}
          disabled={disabled}
          className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50"
        />

        {/* Fine Nudge Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handleNudge(-step * 5)}
            disabled={disabled}
            className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-mono text-stone-300 border border-stone-700 active:scale-95 cursor-pointer"
          >
            -{step * 5}
          </button>
          <button
            type="button"
            onClick={() => handleNudge(-step)}
            disabled={disabled}
            className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-mono text-stone-300 border border-stone-700 active:scale-95 cursor-pointer"
          >
            -{step}
          </button>
          <button
            type="button"
            onClick={() => handleNudge(step)}
            disabled={disabled}
            className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-mono text-stone-300 border border-stone-700 active:scale-95 cursor-pointer"
          >
            +{step}
          </button>
          <button
            type="button"
            onClick={() => handleNudge(step * 5)}
            disabled={disabled}
            className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-mono text-stone-300 border border-stone-700 active:scale-95 cursor-pointer"
          >
            +{step * 5}
          </button>
        </div>
      </div>

      {/* Text Clue Reminder */}
      <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800/80 text-xs text-stone-300 font-serif leading-relaxed mb-5">
        <span className="text-[10px] font-mono text-amber-400 block mb-0.5 uppercase tracking-wide">
          Horological Principle:
        </span>
        “{instructionSnippet}”
      </div>

      {/* Physical Commit Lever */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={handleCommit}
          disabled={disabled}
          className="w-full py-3.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
        >
          <Sliders className="w-4 h-4" />
          <span>Commit Mechanical Caliper Engagement</span>
        </button>
        <span className="text-[10px] font-mono text-stone-500 mt-2">
          (Physical engagement test. Miscalibration induces gear shock and escapement bind.)
        </span>
      </div>
    </div>
  );
};
