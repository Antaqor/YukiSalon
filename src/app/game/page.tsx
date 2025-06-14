// pages/GamePage.tsx

// Dynamically import the client-only Three.js wrapper.
// Setting ssr: false keeps it far, far away from the server.
import dynamic from "next/dynamic";

// This will make sure the actual game client only ever runs in the browser.
const GameClient = dynamic(() => import("./GameClient"), {
  ssr: false,
});

// Tell Next.js: “Don’t even think about prerendering me.”
export const dynamic = "force-dynamic";

export default function GamePage() {
  return <GameClient />;
}
