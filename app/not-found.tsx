import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-meridian-bg text-white">
      <h1 className="text-5xl font-bold text-meridian-burgundy-bright mb-4">404</h1>
      <p className="text-meridian-text-muted mb-6">Page not found</p>
      <Link
        href="/dashboard"
        className="text-meridian-burgundy-bright hover:text-meridian-burgundy-light underline transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
