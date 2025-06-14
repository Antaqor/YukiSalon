"use client";

export const dynamic = "force-dynamic";

import dynamicImport from "next/dynamic";

const GameClient = dynamicImport(() => import("./GameClient"), { ssr: false });

export default function GamePage() {
  return <GameClient />;
}
