import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';

// Utility helpers
const rand = (min, max) => Math.random() * (max - min) + min;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Build a random graph with a few exits around the border
function useGraph(width, height, nodeCount = 10, exitCount = 3) {
  const [graph, setGraph] = useState({ nodes: [], edges: [], exits: [] });

  useEffect(() => {
    const padding = 40;
    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: rand(padding, width - padding),
      y: rand(padding, height - padding),
    }));

    // Create edges by connecting each node to its 2-3 nearest neighbors
    const edges = [];
    nodes.forEach((n) => {
      const sorted = [...nodes]
        .filter((m) => m !== n)
        .sort((a, b) => dist(n, a) - dist(n, b))
        .slice(0, 3);
      sorted.forEach((m) => {
        const key = [n.id, m.id].sort().join('-');
        if (!edges.some((e) => e.key === key)) {
          edges.push({ key, a: n.id, b: m.id });
        }
      });
    });

    // Exits placed on border points
    const exits = Array.from({ length: exitCount }, () => {
      const side = Math.floor(Math.random() * 4);
      if (side === 0) return { x: rand(0, width), y: padding * 0.4, type: 'exit' };
      if (side === 1) return { x: width - padding * 0.4, y: rand(0, height), type: 'exit' };
      if (side === 2) return { x: rand(0, width), y: height - padding * 0.4, type: 'exit' };
      return { x: padding * 0.4, y: rand(0, height), type: 'exit' };
    });

    setGraph({ nodes, edges, exits });
  }, [width, height, nodeCount, exitCount]);

  return graph;
}

function findNearestExit(point, exits) {
  let best = null;
  let bestD = Infinity;
  for (const e of exits) {
    const d = dist(point, e);
    if (d < bestD) {
      best = e;
      bestD = d;
    }
  }
  return { target: best, distance: bestD };
}

// Hot potato step: pick the neighbor that reduces distance-to-nearest-exit the most
function chooseNextNode(currentId, prevId, graph) {
  const current = graph.nodes[currentId];
  if (!current) return null;
  const { distance: currentToExit } = findNearestExit(current, graph.exits);
  const neighbors = graph.edges
    .filter((e) => e.a === currentId || e.b === currentId)
    .map((e) => (e.a === currentId ? e.b : e.a))
    .filter((id) => id !== prevId);

  if (neighbors.length === 0) return null;

  let best = null;
  let bestGain = -Infinity;
  for (const nId of neighbors) {
    const node = graph.nodes[nId];
    const { distance } = findNearestExit(node, graph.exits);
    const gain = currentToExit - distance; // positive means closer to exit
    if (gain > bestGain) {
      bestGain = gain;
      best = nId;
    }
  }
  return best;
}

const useResize = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 800, height: 500 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setSize({ width: cr.width, height: cr.height });
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, size];
};

const NetworkCanvas = forwardRef(({ isPlaying, speed, onPacketCountChange }, ref) => {
  const [hostRef, { width, height }] = useResize();
  const graph = useGraph(width, height, 12, 3);
  const [packets, setPackets] = useState([]);

  // Spawn an initial packet
  useEffect(() => {
    if (graph.nodes.length && packets.length === 0) {
      setPackets([{ id: 0, at: 0, prev: null, progress: 0 }]);
      onPacketCountChange?.(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph.nodes.length]);

  // Expose controls
  useImperativeHandle(ref, () => ({
    addPacket: () => {
      setPackets((cur) => {
        const id = cur.length ? Math.max(...cur.map((p) => p.id)) + 1 : 0;
        const start = Math.floor(Math.random() * Math.max(1, graph.nodes.length));
        const next = [...cur, { id, at: start, prev: null, progress: 0 }];
        onPacketCountChange?.(next.length);
        return next;
      });
    },
    reset: () => {
      setPackets([]);
      onPacketCountChange?.(0);
    },
  }), [graph.nodes.length, onPacketCountChange]);

  // Animation loop
  useEffect(() => {
    let raf;
    const tick = () => {
      setPackets((cur) => {
        if (!isPlaying || cur.length === 0) return cur;
        const next = cur
          .map((p) => {
            // If progress finished, move to next node
            if (p.progress >= 1) {
              const nextId = chooseNextNode(p.at, p.prev, graph);
              if (nextId == null) return null; // stuck, drop
              return { id: p.id, at: nextId, prev: p.at, progress: 0 };
            }
            return { ...p, progress: Math.min(1, p.progress + 0.01 * speed) };
          })
          .filter(Boolean);

        // If a packet is at a node that is closest to an exit and within threshold, remove (delivered)
        const filtered = next.filter((p) => {
          const node = graph.nodes[p.at];
          const { distance } = findNearestExit(node, graph.exits);
          return distance > 30; // delivered when very close to border exit
        });
        if (filtered.length !== next.length) onPacketCountChange?.(filtered.length);
        return filtered;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, speed, graph]);

  // Draw
  const canvasRef = useRef(null);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Edges
    ctx.lineWidth = 1.2;
    for (const e of graph.edges) {
      const a = graph.nodes[e.a];
      const b = graph.nodes[e.b];
      if (!a || !b) continue;
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Exits
    for (const ex of graph.exits) {
      ctx.fillStyle = 'rgba(129, 140, 248, 0.85)'; // indigo-400
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Routers
    for (const n of graph.nodes) {
      ctx.fillStyle = 'rgba(52, 211, 153, 0.9)'; // emerald-400
      ctx.beginPath();
      ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Active edges for packets
    for (const p of packets) {
      const cur = graph.nodes[p.at];
      const nextId = chooseNextNode(p.at, p.prev, graph);
      if (cur && nextId != null) {
        const nxt = graph.nodes[nextId];
        if (!nxt) continue;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)'; // amber-400
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cur.x, cur.y);
        ctx.lineTo(nxt.x, nxt.y);
        ctx.stroke();
        ctx.lineWidth = 1.2;
      }
    }

    // Packets
    for (const p of packets) {
      const cur = graph.nodes[p.at];
      const nextId = chooseNextNode(p.at, p.prev, graph);
      if (!cur) continue;
      const pos = { x: cur.x, y: cur.y };
      if (nextId != null) {
        const nxt = graph.nodes[nextId];
        if (nxt) {
          pos.x = cur.x + (nxt.x - cur.x) * p.progress;
          pos.y = cur.y + (nxt.y - cur.y) * p.progress;
        }
      }
      ctx.fillStyle = 'rgba(244, 63, 94, 0.95)'; // rose-500
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [graph, packets, width, height]);

  return (
    <div ref={hostRef} className="relative w-full h-[540px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10">
      <canvas ref={canvasRef} width={width} height={height} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 to-transparent" />
    </div>
  );
});

export default NetworkCanvas;
