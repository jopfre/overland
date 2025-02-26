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

async function getData() {
  const res = await fetch("https://your-external-api.com/data", {
    next: { revalidate: 86400 }, // 24 hours
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

// Making the component async to fetch data
export default async function Home() {
  const data = await getData();

  return (
    <main className="">
      {/* <Map countries={countries} safetyStatus={safetyStatus} /> */}
      <Leaflet />
    </main>
  );
}
