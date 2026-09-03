import React, { useState } from 'react';
import { User, ShieldAlert, HeartHandshake, HelpCircle, ArrowRight } from 'lucide-react';
import { SoundFX } from '../../engine/SoundFX';
import type { DialogueNode } from '../../types/game';

interface DialogueArchetypeProps {
  characterName: string;
  characterTitle: string;
  initialTrust?: number;
  initialNodeId: string;
  nodes: Record<string, DialogueNode>;
  onDialogueComplete: (finalNodeId: string, trustDelta: number, intentUsed: string) => void;
  disabled?: boolean;
}

export const DialogueArchetype: React.FC<DialogueArchetypeProps> = ({
  characterName,
  characterTitle,
  initialTrust = 50,
  initialNodeId,
  nodes,
  onDialogueComplete,
  disabled = false,
}) => {
  const [currentNodeId, setCurrentNodeId] = useState<string>(initialNodeId);
  const [trustScore, setTrustScore] = useState<number>(initialTrust);
  const [dialogueHistory, setDialogueHistory] = useState<Array<{ speaker: string; text: string }>>([
    {
      speaker: characterName,
      text: nodes[initialNodeId]?.text || '...',
    },
  ]);

  const currentNode = nodes[currentNodeId];

  const handleOptionClick = (option: DialogueNode['options'][0]) => {
    if (disabled) return;
    SoundFX.playClick();

    const delta = option.trustDelta || 0;
    const nextTrust = Math.min(100, Math.max(0, trustScore + delta));
    setTrustScore(nextTrust);

    // Append player statement to history
    const nextHistory = [
      ...dialogueHistory,
      { speaker: 'You', text: option.text },
    ];

    if (option.nextNodeId && nodes[option.nextNodeId]) {
      const nextNode = nodes[option.nextNodeId];
      nextHistory.push({ speaker: characterName, text: nextNode.text });
      setDialogueHistory(nextHistory);
      setCurrentNodeId(option.nextNodeId);

      if (option.isTerminal) {
        onDialogueComplete(option.nextNodeId, delta, option.intent);
      }
    } else {
      setDialogueHistory(nextHistory);
      onDialogueComplete(currentNodeId, delta, option.intent);
    }
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'challenge':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'sympathize':
        return <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />;
      case 'disclose':
        return <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  return (
    <div className="w-full max-w-xl p-6 rounded-2xl border-4 border-stone-800 bg-[#0c1017] shadow-2xl font-serif text-stone-200 flex flex-col">
      {/* Header with Character Profile & Trust Meter */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center text-amber-400 shadow">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-serif text-stone-100">
              {characterName}
            </h3>
            <span className="text-[10px] font-mono text-stone-400 block">
              {characterTitle}
            </span>
          </div>
        </div>

        {/* Dynamic Trust Meter */}
        <div className="flex flex-col items-end gap-1 font-mono">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider">
            Rapport / Trust:
          </span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-800 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  trustScore >= 60
                    ? 'bg-amber-400'
                    : trustScore >= 40
                    ? 'bg-stone-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${trustScore}%` }}
              />
            </div>
            <span className="text-xs font-bold text-amber-300">
              {trustScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Acoustic Tube / Dialogue Transcript Scrollbox */}
      <div className="flex-1 max-h-56 overflow-y-auto space-y-3 mb-5 pr-1 font-sans text-xs">
        {dialogueHistory.map((entry, idx) => {
          const isPlayer = entry.speaker === 'You';
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col gap-1 ${
                isPlayer
                  ? 'bg-amber-950/25 border-amber-800/50 ml-6 text-stone-200'
                  : 'bg-stone-900/70 border-stone-800 mr-6 text-stone-300'
              }`}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 font-bold">
                {entry.speaker}
              </span>
              <p className="leading-relaxed font-serif text-xs">
                “{entry.text}”
              </p>
            </div>
          );
        })}
      </div>

      {/* Available Dialogue Interaction Choices */}
      <div className="space-y-2 pt-2 border-t border-stone-800/80">
        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-2">
          Choose How to Respond:
        </span>

        {currentNode?.options?.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleOptionClick(opt)}
            disabled={disabled}
            className="w-full p-3.5 rounded-xl border border-stone-700 bg-stone-900/90 hover:bg-stone-850 hover:border-amber-400/70 text-left transition-all cursor-pointer flex flex-col gap-1 group active:scale-98 shadow-sm hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-medium text-stone-200 group-hover:text-amber-200">
                “{opt.text}”
              </span>
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-stone-400 shrink-0 ml-2">
                {getIntentIcon(opt.intent)}
                <span className="hidden sm:inline">{opt.intent}</span>
              </div>
            </div>

            {opt.consequenceHint && (
              <span className="text-[10px] font-mono text-stone-500 italic">
                Note: {opt.consequenceHint}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
