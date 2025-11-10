import React from 'react';
import { RefreshCcw, Zap, Plus, Minus } from 'lucide-react';

const Controls = ({ onReset, onAddPacket, speed, onSpeedChange }) => {
  return (
    <div className="w-full md:w-72 bg-slate-900/60 border border-white/10 rounded-xl p-4 text-white space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">Controls</h3>
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onReset}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 ring-1 ring-white/10"
        >
          <RefreshCcw className="w-4 h-4" /> Reset
        </button>
        <button
          onClick={onAddPacket}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 ring-1 ring-white/10"
        >
          <Zap className="w-4 h-4" /> Add Packet
        </button>
      </div>
      <div>
        <label className="text-xs text-white/70">Speed</label>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => onSpeedChange(Math.max(0.25, speed - 0.25))}
            className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 ring-1 ring-white/10"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <input
              type="range"
              min="0.25"
              max="2"
              step="0.25"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <button
            onClick={() => onSpeedChange(Math.min(2, speed + 0.25))}
            className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 ring-1 ring-white/10"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-white/70 mt-1">{speed.toFixed(2)}x</div>
      </div>
    </div>
  );
};

export default Controls;
