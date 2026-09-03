import React from 'react';
import { useGameStore } from '../engine/GameStore';
import { KeyRound, Key, CheckCircle2 } from 'lucide-react';
import type { EntityId } from '../types/game';


export const InventoryBar: React.FC = () => {
  const { inventory, entities, selectedInventoryItem, selectInventoryItem } = useGameStore();

  const getIcon = (id: EntityId) => {
    switch (id) {
      case 'oxidized_key':
        return <KeyRound className="w-5 h-5 text-emerald-400" />;
      case 'brass_key':
        return <Key className="w-5 h-5 text-amber-400" />;
      default:
        return <Key className="w-5 h-5 text-slate-300" />;
    }
  };

  return (
    <div className="bg-slate-900/95 border-t border-slate-800 px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-semibold">
          Inventory
        </span>
        <div className="h-4 w-px bg-slate-800" />

        {inventory.length === 0 ? (
          <span className="text-xs text-slate-500 italic">No items carried.</span>
        ) : (
          <div className="flex items-center gap-2">
            {inventory.map((itemId) => {
              const item = entities[itemId];
              if (!item) return null;
              const isSelected = selectedInventoryItem === itemId;

              return (
                <button
                  key={itemId}
                  onClick={() => selectInventoryItem(itemId)}
                  className={`group relative flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/50'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span className="shrink-0">{getIcon(itemId)}</span>
                  <span>{item.name}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedInventoryItem && (
        <div className="text-xs font-mono text-amber-300/90 animate-pulse">
          Active item: {entities[selectedInventoryItem]?.name} — Click a lock on stage to use.
        </div>
      )}
    </div>
  );
};
