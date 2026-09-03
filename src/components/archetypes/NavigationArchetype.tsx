import React, { useState } from 'react';
import { Compass, MapPin, ArrowRight, DoorOpen } from 'lucide-react';
import { SoundFX } from '../../engine/SoundFX';

export interface RouteOption {
  id: string;
  name: string;
  cardinalDirection: 'North' | 'South' | 'East' | 'West' | 'Upward' | 'Downward';
  description: string;
  environmentalCondition: 'Safe & Lit' | 'Dark & Hazardous' | 'Flooded' | 'Pressurized';
  requiresConditionPassed?: boolean;
  consequenceHint: string;
}

interface NavigationArchetypeProps {
  title: string;
  currentSectorName: string;
  instructionSnippet: string;
  availableRoutes: RouteOption[];
  onSelectRoute: (routeId: string, isHazardous: boolean) => void;
  disabled?: boolean;
}

export const NavigationArchetype: React.FC<NavigationArchetypeProps> = ({
  title,
  currentSectorName,
  instructionSnippet,
  availableRoutes,
  onSelectRoute,
  disabled = false,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const handleRouteClick = (route: RouteOption) => {
    if (disabled) return;
    SoundFX.playClick();
    setSelectedRouteId(route.id);
  };

  const handleCommitMove = () => {
    if (!selectedRouteId || disabled) return;
    SoundFX.playLatch();
    const route = availableRoutes.find((r) => r.id === selectedRouteId);
    const isHazardous = route?.environmentalCondition.includes('Hazardous') || route?.environmentalCondition.includes('Flooded');
    onSelectRoute(selectedRouteId, isHazardous || false);
  };

  return (
    <div className="w-full max-w-xl p-6 rounded-2xl border-4 border-stone-800 bg-[#0c1017] shadow-2xl font-serif text-stone-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 mb-4">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Spatial Navigation — {title}</span>
        </div>
        <span className="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
          Mount Caelum Crossroads
        </span>
      </div>

      {/* Sector Badge */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-900 border border-stone-800 mb-4 font-mono text-xs">
        <div className="flex items-center gap-2 text-stone-300">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>Current Location:</span>
        </div>
        <span className="font-bold text-amber-300 uppercase">
          {currentSectorName}
        </span>
      </div>

      <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-300 font-serif mb-4 leading-relaxed">
        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wide block mb-0.5">
          Cartographic Guide:
        </span>
        “{instructionSnippet}”
      </div>

      {/* Corridor Routes */}
      <div className="space-y-2.5 mb-6">
        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
          Available Corridors & Portals:
        </span>

        {availableRoutes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          const isHazard = route.environmentalCondition.includes('Hazardous') || route.environmentalCondition.includes('Flooded');

          return (
            <button
              key={route.id}
              type="button"
              onClick={() => handleRouteClick(route)}
              disabled={disabled}
              className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-stone-900/80 border-stone-700/80 hover:border-amber-400/60 hover:bg-stone-850'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold font-serif text-stone-100">
                    {route.cardinalDirection}: {route.name}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                    isHazard
                      ? 'bg-rose-950/80 border-rose-700/60 text-rose-300'
                      : 'bg-stone-800 border-stone-700 text-stone-300'
                  }`}
                >
                  {route.environmentalCondition}
                </span>
              </div>

              <p className="text-[11px] font-sans text-stone-400 leading-tight">
                {route.description}
              </p>

              <span className="text-[10px] font-mono text-stone-500 pt-1 border-t border-stone-800/80">
                Route Impact: {route.consequenceHint}
              </span>
            </button>
          );
        })}
      </div>

      {/* Commit Move Button */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={handleCommitMove}
          disabled={disabled || !selectedRouteId}
          className="w-full py-3.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
        >
          <ArrowRight className="w-4 h-4" />
          <span>Traverse Chosen Corridor</span>
        </button>
      </div>
    </div>
  );
};
