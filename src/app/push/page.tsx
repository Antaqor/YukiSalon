"use client";
import PushSubscribeButton from "../components/PushSubscribeButton";

export default function PushPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Web Push Demo</h1>
      <p>Click the button below to enable push notifications.</p>
      <PushSubscribeButton />
    </div>
  );
}
