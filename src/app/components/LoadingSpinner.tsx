"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-4" aria-label="Loading">
      <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
