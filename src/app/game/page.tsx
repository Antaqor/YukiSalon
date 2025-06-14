import dynamic from "next/dynamic";

// Dynamically import the client component so it is never
// executed on the server during prerendering. This avoids
// errors from libraries that depend on browser-only APIs.
const GameClient = dynamic(() => import("./GameClient"), { ssr: false });

// Disable static rendering for this page since the Three.js based
// components rely on browser APIs that are not available during
// Next.js' build-time prerendering phase.
export const dynamic = "force-dynamic";

export default function GamePage() {
  return <GameClient />;
}
