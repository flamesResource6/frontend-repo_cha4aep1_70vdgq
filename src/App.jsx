import React, { useRef, useState } from 'react';
import Header from './components/Header';
import Legend from './components/Legend';
import Controls from './components/Controls';
import NetworkCanvas from './components/NetworkCanvas';

function App() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [packetCount, setPacketCount] = useState(0);
  const canvasRef = useRef(null);

  const handleReset = () => canvasRef.current?.reset?.();
  const handleAddPacket = () => canvasRef.current?.addPacket?.();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <Header isPlaying={isPlaying} onTogglePlay={() => setIsPlaying((p) => !p)} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Hot Potato Routing Playground</h2>
              <div className="text-sm text-white/70">Packets in flight: {packetCount}</div>
            </div>
            <NetworkCanvas
              ref={canvasRef}
              isPlaying={isPlaying}
              speed={speed}
              onPacketCountChange={setPacketCount}
            />
            <p className="text-sm text-white/70 leading-relaxed">
              In hot potato (deflection) routing, routers do not queue packets. Each hop forwards the packet to the neighbour that most reduces the remaining distance to any exit. If a link becomes unavailable, the packet is immediately deflected to another viable neighbour. Use the controls to add more packets and adjust speed.
            </p>
          </div>

          <div className="space-y-4">
            <Legend />
            <Controls
              onReset={handleReset}
              onAddPacket={handleAddPacket}
              speed={speed}
              onSpeedChange={setSpeed}
            />
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-4 pb-8 text-xs text-white/60">
        Built to visualize how packets race to the nearest exit without waiting in queues.
      </footer>
    </div>
  );
}

export default App;
