import React from 'react';
import { Circle, Router, Server, Activity } from 'lucide-react';

const Legend = () => {
  return (
    <div className="w-full md:w-72 bg-slate-900/60 border border-white/10 rounded-xl p-4 text-white space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">Legend</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
          <span>Router</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-400 inline-block" />
          <span>Edge/Exit</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
          <span>Packet</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
          <span>Active Link</span>
        </div>
      </div>
      <p className="text-xs text-white/70">
        Hot potato (deflection) routing forwards a packet to whichever outgoing link will
        get it closer to any available exit, without queueing.
      </p>
    </div>
  );
};

export default Legend;
