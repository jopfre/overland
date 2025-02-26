import Map from "@/components/MapSvg/MapSvg";
import Leaflet from "@/components/Leaflet";
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
];

// Making the component async to fetch data
export default async function Home() {
  // Fetch safety status data directly from our API route
  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_BASE_URL
    }/api/travel-advice?countries=${countries.join(",")}`,
    { next: { revalidate: 3600 } } // Cache for 1 hour
  );
  const safetyStatus = await response.json();

  return (
    <main className="">
      {/* <Map countries={countries} safetyStatus={safetyStatus} /> */}
      <Leaflet />
    </main>
  );
}
