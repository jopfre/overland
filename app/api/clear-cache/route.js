import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const CACHE_DIR = path.join(process.cwd(), ".cache");

  try {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR);

      for (const file of files) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      }

      return NextResponse.json({
        success: true,
        message: `Cleared ${files.length} cache files`,
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "No cache directory found",
      });
    }
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
