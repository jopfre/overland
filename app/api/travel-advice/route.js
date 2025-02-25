import { NextResponse } from "next/server";
import { countryCodeToName } from "@/utils/codes";

const BASE_URL = "https://www.gov.uk/api/content/foreign-travel-advice";
let cache = {
  timestamp: 0,
  data: null,
};

// Function to get country name from code
function getCountrySlugFromId(id) {
  const countryName = countryCodeToName[id];
  if (!countryName) {
    console.warn(`No country name found for code: ${id}`);
    return id.toLowerCase();
  }
  return countryName.toLowerCase().replace(/\s+/g, "-");
}

export async function GET(request) {
  console.log("Fetching travel advice");
  const { searchParams } = new URL(request.url);
  const countries = searchParams.get("countries")?.split(",") || [];

  // Check cache (24 hour expiry)
  const now = Date.now();
  if (cache.data && now - cache.timestamp < 24 * 60 * 60 * 1000) {
    return NextResponse.json(cache.data);
  }

  // Fetch fresh data
  const promises = countries.map(async (code) => {
    try {
      const countrySlug = getCountrySlugFromId(code);
      const response = await fetch(`${BASE_URL}/${countrySlug}`);

      if (!response.ok) {
        console.warn(`Failed to fetch data for ${countrySlug} (${code})`);
        return null;
      }

      const data = await response.json();
      return {
        code,
        slug: countrySlug,
        title: data.title,
        updated: data.public_updated_at,
        hasWarnings: data.details?.alert_status?.length > 0,
        alertStatus: data.details?.alert_status || [],
        warningDetails:
          data.details?.parts?.find(
            (part) => part.slug === "warnings-and-insurance"
          )?.body || "",
        safetyAndSecurity:
          data.details?.parts?.find(
            (part) => part.slug === "safety-and-security"
          )?.body || "",
        image: data.details?.image?.url || null,
      };
    } catch (error) {
      console.error(`Error fetching data for ${code}:`, error);
      return null;
    }
  });

  const results = await Promise.all(promises);
  const validResults = results.filter(Boolean);

  // Update cache
  cache = {
    timestamp: now,
    data: validResults,
  };

  return NextResponse.json(validResults);
}
