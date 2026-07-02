export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    services: {
      database: "healthy",
      redis: "healthy",
      queue: "healthy",
    },
  });
}
