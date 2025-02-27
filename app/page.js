import { getCountryNamesByCode } from "@/utils/extractCountryNames";
import { getFromCache, saveToCache } from "@/utils/cacheUtils";
import LeafletMap from "@/components/Map";
//https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#AU
const countries = [
  "MN",
  "RU",
  "KZ",
  "AM",
  "TW",
  "IN",
  "TR",
  "IR",
  "NP",
  "GE",
  "TH",
  "UA",
  "PK",
  "VN",
  "AZ",
  "AF",
  "BD",
  "BT",
  "KH",
  "LA",
  "MM",
  "KP",
  "KR",
  "CN",
  "TJ",
  "TM",
  "UZ",
  "KG",
  // "AA",
  // "AB",
  // "AC",
  // "AD",
  // "AE",
  // "AF",
  // "AG",
  // "AH",
  // "AI",
  // "AJ",
  // "AK",
  // "AL",
  // "AM",
  // "AN",
  // "AO",
  // "AP",
  // "AQ",
  // "AR",
  // "AS",
  // "AT",
  // "AU",
  // "AV",
  // "AW",
  // "AX",
  // "AY",
];

async function getData(countrySlug) {
  // console.log(`🔍 Attempting to fetch data for ${countrySlug}...`);

  // Try to get from cache first
  const cacheKey = `travel-advice-${countrySlug}`;
  const cachedData = getFromCache(cacheKey);

  if (cachedData) {
    // console.log(`✅ Using cached data for ${countrySlug}`);
    return cachedData;
  }

  // If not in cache or expired, fetch from API
  try {
    const res = await fetch(
      `https://www.gov.uk/api/content/foreign-travel-advice/${countrySlug}`,
      {
        next: { revalidate: 86400 }, // 24 hours
        cache: "force-cache", // Ensure we're using the cache
      }
    );

    // Check cache status
    const cacheStatus = res.headers.get("x-vercel-cache") || "unknown";
    const isCached = cacheStatus === "HIT";
    // console.log(`📦 API Cache ${isCached ? "HIT" : "MISS"} for ${countrySlug}`);

    if (!res.ok) {
      console.log(`❌ No data found for ${countrySlug} (${res.status})`);
      return null;
    }

    // Parse the response
    const data = await res.json();

    // Save to our file cache
    saveToCache(cacheKey, data);

    // console.log(`✅ Successfully fetched data for ${countrySlug}`);
    return data;
  } catch (error) {
    console.error(`Error fetching data for ${countrySlug}:`, error);
    return null;
  }
}

// New function to fetch border crossings
async function getBorderCrossings() {
  try {
    // Use relative URL if calling internal API route
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/border-crossings`
    );
    const data = await response.json();

    if (data.crossings) {
      return data.crossings;
    } else {
      console.error("No crossings data returned from API");
      return [];
    }
  } catch (error) {
    console.error("Error fetching border crossings:", error);
    return [];
  }
}

export default async function Home() {
  const countryNamesByCode = getCountryNamesByCode();

  // Get data for all selected countries
  const countriesData = await Promise.all(
    countries.map(async (code) => {
      const country = countryNamesByCode[code];
      if (!country) return null;

      const data = await getData(country.slug);
      return {
        code,
        name: country.original,
        slug: country.slug,
        data,
      };
    })
  );

  // Fetch border crossings data
  const borderCrossings = await getBorderCrossings();

  console.log(countriesData.find((c) => c?.code === "IR"));

  // Filter out any null responses
  const validCountriesData = countriesData.filter(Boolean);

  console.log(validCountriesData.find((c) => c?.code === "TR"));
  return (
    <main className="">
      <LeafletMap
        countriesData={validCountriesData}
        borderCrossings={borderCrossings}
      />
    </main>
  );
}
