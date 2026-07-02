export default function RootLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-meridian-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-meridian-burgundy/30 animate-pulse" />
        <p className="text-sm text-meridian-text-muted animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
