import Link from "next/link";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-4">Meridian</h1>
      <p className="text-[#A1A1AA] mb-4">AI Cost Control Platform</p>
      <Link
        href="/dashboard"
        className="text-[#8E243D] hover:text-[#A52D4F] underline"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
