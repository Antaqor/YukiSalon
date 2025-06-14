"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import { create } from "zustand";

// -------- Zustand store --------
interface GameState {
  coins: number;
  ore: number;
  stock: number[];
  mine: (id: number) => void;
  reset: () => void;
}

const useGame = create<GameState>((set) => ({
  coins: 0,
  ore: 0,
  stock: Array.from({ length: 100 }, (_, i) => i),
  mine: (blockId: number) =>
    set((s) => ({
      ore: s.ore + 1,
      coins: s.coins + 5,
      stock: s.stock.filter((id) => id !== blockId),
    })),
  reset: () =>
    set(() => ({
      coins: 0,
      ore: 0,
      stock: Array.from({ length: 100 }, (_, i) => i),
    })),
}));

// -------- Components --------
interface OreBlockProps {
  id: number;
  position: [number, number, number];
}

function OreBlock({ id, position }: OreBlockProps) {
  const mine = useGame((s) => s.mine);
  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        mine(id);
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffd700" />
    </mesh>
  );
}

function World() {
  const stock = useGame((s) => s.stock);
  const blocks = useMemo(
    () =>
      stock.map((id) => {
        const x = id % 10;
        const z = Math.floor(id / 10);
        return <OreBlock key={id} id={id} position={[x - 5, 0.5, z - 5]} />;
      }),
    [stock]
  );
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {blocks}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
    </>
  );
}

function HUD() {
  const coins = useGame((s) => s.coins);
  const ore = useGame((s) => s.ore);
  const stock = useGame((s) => s.stock);
  const reset = useGame((s) => s.reset);
  return (
    <div className="absolute top-4 left-4 bg-neutral-900/80 p-4 rounded-xl shadow text-cyan-300 space-y-1 text-sm">
      <div>💰 Coins: {coins}</div>
      <div>⛏️ Ore: {ore}</div>
      {stock.length === 0 && (
        <div className="text-green-400">All ore mined!</div>
      )}
      <div className="text-neutral-400">Click gold blocks to mine → earn coins</div>
      <button onClick={reset} className="mt-1 px-2 py-1 bg-cyan-700 rounded text-white">
        Reset Game
      </button>
    </div>
  );
}

export default function GameClient() {
  return (
    <div className="w-screen h-screen bg-neutral-900">
      <Canvas camera={{ position: [0, 15, 15], fov: 50 }} shadows>
        <Suspense fallback={null}>
          <World />
          <OrbitControls enablePan={false} />
          <Stats />
        </Suspense>
      </Canvas>
      <HUD />
    </div>
  );
}
