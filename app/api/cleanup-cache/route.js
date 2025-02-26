import { NextResponse } from "next/server";
import { cleanupExpiredCache } from "@/utils/cacheUtils";

export async function GET() {
  try {
    const removedCount = cleanupExpiredCache();

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${removedCount} expired cache files`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
