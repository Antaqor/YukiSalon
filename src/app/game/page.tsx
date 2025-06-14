"use client";

import GameClient from "./GameClient";

// Disable static rendering for this page since the Three.js based
// components rely on browser APIs that are not available during
// Next.js' build-time prerendering phase.
export const dynamic = "force-dynamic";

export default function GamePage() {
  return <GameClient />;
}
