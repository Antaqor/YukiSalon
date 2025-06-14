// pages/GamePage.tsx (or wherever you keep this file)

// Dynamically import the client-only Three.js wrapper.
// Setting ssr: false keeps it far, far away from the server.
import dynamic from "next/dynamic";

const GameClient = dynamic(() => import("./GameClient"), {
  ssr: false,
});

// Tell Next.js: “Don’t even think about prerendering me.”
export const dynamic = "force-dynamic";

export default function GamePage() {
  return <GameClient />;
}
