"use client";
import useWebPush from "../hooks/useWebPush";

export default function PushSubscribeButton() {
  const { subscribed, subscribe } = useWebPush();

  if (subscribed) return null;

  return (
    <button
      onClick={subscribe}
      className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
    >
      Enable Notifications
    </button>
  );
}
