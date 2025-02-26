import { NextResponse } from "next/server";

export async function GET() {
  // Fetch data from external API with cache tag
  const response = await fetch("https://your-external-api.com/data", {
    next: {
      tags: ["ukgov-data"],
    },
  });

  const data = await response.json();

  return NextResponse.json(data);
}
