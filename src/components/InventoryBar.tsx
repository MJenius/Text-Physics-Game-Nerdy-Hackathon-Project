import React from 'react';
import { useGameStore } from '../engine/GameStore';
import {
  KeyRound,
  Key,
  CheckCircle2,
  Brush,
  Diamond,
  Package
} from 'lucide-react';
import type { EntityId } from '../types/game';

export const InventoryBar: React.FC = () => {
  const { inventory, entities, selectedInventoryItem, selectInventoryItem } = useGameStore();

  const getIcon = (id: EntityId) => {
    switch (id) {
      case 'oxidized_key':
        return <KeyRound className="w-4 h-4 text-emerald-400" />;
      case 'brass_key':
        return <Key className="w-4 h-4 text-amber-400" />;
      case 'cleaning_brush':
        return <Brush className="w-4 h-4 text-amber-300" />;
      case 'quartz_prism':
        return <Diamond className="w-4 h-4 text-cyan-300" />;
      default:
        return <Package className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className="bg-slate-900/95 border-t border-slate-800 px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-semibold">
          Carried Inventory
        </span>
        <div className="h-4 w-px bg-slate-800" />

        {inventory.length === 0 ? (
          <span className="text-xs text-slate-500 italic">No tools currently in pack. Use environmental fixtures directly.</span>
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
                  className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
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
          Active tool: {entities[selectedInventoryItem]?.name} — Click a target in the chamber to apply.
        </div>
      )}
    </div>
  );
};
