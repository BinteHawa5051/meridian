"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-meridian-bg text-white">
      <h1 className="text-5xl font-bold text-meridian-burgundy-bright mb-4">500</h1>
      <p className="text-meridian-text-muted mb-6">Something went wrong</p>
      <p className="text-meridian-text-muted/60 text-sm mb-8 max-w-md text-center">
        {error.message || "An unexpected error occurred"}
      </p>
      <button
        onClick={reset}
        className="text-meridian-burgundy-bright hover:text-meridian-burgundy-light underline transition-colors cursor-pointer bg-none border-none"
      >
        Try again
      </button>
    </div>
  );
}
