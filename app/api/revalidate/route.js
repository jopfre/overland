import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request) {
  // Optional: Add authentication here
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.REVALIDATE_SECRET}`) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  // Revalidate the cache for the tag
  revalidateTag("ukgov-data");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
