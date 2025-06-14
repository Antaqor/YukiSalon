"use client";

import dynamicImport from "next/dynamic";

// Dynamically import the GameClient so it only loads on the client.
const DynamicGameClient = dynamicImport(() => import("./GameClient"), { ssr: false });

export default DynamicGameClient;
