import { NextResponse } from "next/server";
import { DOMParser } from "xmldom";
import * as tj from "@mapbox/togeojson";

export async function GET() {
  try {
    const kmlUrl =
      "https://www.google.com/maps/d/u/0/kml?forcekml=1&mid=1Ml8xrhk9Jwr00_GdccYtBrEYScU&lid=z0rmBFooQBOI.klH5gTa0AB_k";
    const response = await fetch(kmlUrl, { next: { revalidate: 86400 } }); // Cache for 24 hours
    const kmlText = await response.text();

    // Parse the KML using xmldom for server-side parsing
    const parser = new DOMParser();
    const kml = parser.parseFromString(kmlText, "text/xml");

    // Convert KML to GeoJSON using togeojson
    const geojson = tj.kml(kml);

    // Extract points from the GeoJSON
    const crossings = [];

    if (geojson.features) {
      geojson.features.forEach((feature) => {
        if (feature.geometry && feature.geometry.type === "Point") {
          // GeoJSON coordinates are [longitude, latitude]
          const [lng, lat] = feature.geometry.coordinates;

          crossings.push({
            name: feature.properties.name || "Unknown",
            description: feature.properties.description || "",
            position: [lat, lng], // Leaflet uses [lat, lng] format
            properties: feature.properties,
          });
        }
      });
    }

    return NextResponse.json({ crossings });
  } catch (error) {
    console.error("Error fetching border crossings:", error);
    return NextResponse.json(
      { error: "Failed to fetch border crossings" },
      { status: 500 }
    );
  }
}
