import React from 'react';
import { Rocket, Network, Play, Pause } from 'lucide-react';

const Header = ({ isPlaying, onTogglePlay }) => {
  return (
    <header className="w-full border-b border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 ring-1 ring-indigo-400/30">
            <Network className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Hot Potato Routing Visualizer</h1>
            <p className="text-xs text-white/70">Watch packets hop to the nearest exit in real-time</p>
          </div>
        </div>
        <button
          onClick={onTogglePlay}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ring-1 ring-white/10 ${
            isPlaying ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </header>
  );
};

export default Header;
