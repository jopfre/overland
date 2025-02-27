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
  "LK", // Sri Lanka
  "SG", // Singapore
  "MY", // Malaysia
  "PH", // Philippines
  "PG", // Papua New Guinea
  "JP", // Japan
  "ID", // Indonesia

  // Middle Eastern countries
  "SA", // Saudi Arabia
  "AE", // United Arab Emirates
  "QA", // Qatar
  "KW", // Kuwait
  "BH", // Bahrain
  "OM", // Oman
  "YE", // Yemen
  "IQ", // Iraq
  "SY", // Syria
  "JO", // Jordan
  "LB", // Lebanon
  "IL", // Israel
  "PS", // Palestine
  "CY", // Cyprus
  "EG", // Egypt

  // Central American countries
  "MX", // Mexico
  "GT", // Guatemala
  "BZ", // Belize
  "SV", // El Salvador
  "HN", // Honduras
  "NI", // Nicaragua
  "CR", // Costa Rica
  "PA", // Panama
];

// Country slug overrides for special cases
const countrySlugOverrides = {
  PS: "the-occupied-palestinian-territories", // Override for Palestine
};

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

export default async function Home() {
  const countryNamesByCode = getCountryNamesByCode();

  // Get data for all selected countries
  const countriesData = await Promise.all(
    countries.map(async (code) => {
      const country = countryNamesByCode[code];
      if (!country) return null;

      // Use override slug if available, otherwise use the default slug
      const slug = countrySlugOverrides[code] || country.slug;

      const data = await getData(slug);
      return {
        code,
        name: country.original,
        slug, // Use the potentially overridden slug
        data,
      };
    })
  );

  // Filter out any null responses
  const validCountriesData = countriesData.filter(Boolean);

  return (
    <main className="">
      <LeafletMap countriesData={validCountriesData} />
    </main>
  );
}
