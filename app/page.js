import Map from "@/components/MapSvg/MapSvg";
import Leaflet from "@/components/Leaflet";
import {
  getCountryNames,
  getCountryNamesByCode,
} from "@/utils/extractCountryNames";

const countries = [
  // "MN",
  "RU",
  "KZ",
  // "AM",
  // "TW",
  // "IN",
  // "TR",
  // "IR",
  // "NP",
  // "GE",
  // "TH",
  // "UA",
  // "PK",
  // "VN",
  // "AZ",
  // "AF",
  // "BD",
  // "BT",
  // "KH",
  // "LA",
  // "MM",
  // "KP",
  // "KR",
  // "CN",
  // "TJ",
  // "TM",
  // "UZ",
  // "KG",
];

async function getData(countrySlug) {
  console.log(`🔍 Attempting to fetch data for ${countrySlug}...`);

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
  console.log(`📦 Cache ${isCached ? "HIT" : "MISS"} for ${countrySlug}`);

  if (!res.ok) {
    console.log(`❌ No data found for ${countrySlug} (${res.status})`);
    return null;
  }

  console.log(
    `✅ Successfully fetched data for ${countrySlug} ${
      isCached ? "(from cache)" : "(from API)"
    }`
  );
  return res.json();
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

  // Filter out any null responses
  const validCountriesData = countriesData.filter(Boolean);

  console.log(validCountriesData);

  return (
    <main className="">
      <Leaflet />
    </main>
  );
}
