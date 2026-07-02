"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-meridian-bg">
        <div className="flex flex-col items-center justify-center min-h-screen text-white p-8">
          <h1 className="text-5xl font-bold text-meridian-burgundy-bright mb-4">
            Critical Error
          </h1>
          <p className="text-meridian-text-muted mb-6 text-center max-w-md">
            A critical error occurred. Please reload the application.
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-xl bg-meridian-burgundy text-white hover:bg-meridian-burgundy-light transition-colors cursor-pointer border-none"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
