"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { getCountriesData } from "@/utils/api";

export default function WorldMap() {
  const [countryData, setCountryData] = useState(null);
  const [safetyStatus, setSafetyStatus] = useState({});
  const [targetCountries, setTargetCountries] = useState([]);

  // Get target countries from mapdata after it's loaded
  useEffect(() => {
    function getTargetCountries() {
      if (typeof window !== "undefined" && window.simplemaps_worldmap_mapdata) {
        const centralAsiaStates =
          window.simplemaps_worldmap_mapdata.regions[5]?.states || [];
        setTargetCountries(centralAsiaStates);
      }
    }

    // Check if mapdata is already loaded
    if (typeof window !== "undefined" && window.simplemaps_worldmap_mapdata) {
      getTargetCountries();
    } else {
      // If not loaded, wait for script to load
      window.addEventListener("load", getTargetCountries);
      return () => window.removeEventListener("load", getTargetCountries);
    }
  }, []);

  // Fetch data when target countries are set
  useEffect(() => {
    async function fetchData() {
      if (targetCountries.length === 0) return;

      const data = await getCountriesData(targetCountries);
      setCountryData(data);

      // Process safety information
      const status = {};
      data.forEach((country) => {
        if (country.hasWarnings) {
          status[country.code] = {
            safe: false,
            message: `Travel warning: ${country.alertStatus.join(", ")}`,
          };
        } else {
          status[country.code] = {
            safe: true,
            message: "No specific FCDO warnings against travel",
          };
        }
      });
      setSafetyStatus(status);
    }
    fetchData();
  }, [targetCountries]);

  useEffect(() => {
    // Initialize map after scripts are loaded
    if (typeof window.simplemaps_worldmap !== "undefined") {
      window.simplemaps_worldmap.load();
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <Script src="/mapdata.js" strategy="beforeInteractive" />
      <Script src="/worldmap.js" strategy="beforeInteractive" />

      <div id="map" className="w-full h-full"></div>

      {/* Display safety information */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Travel Safety Status:</h3>
        {Object.entries(safetyStatus).map(([code, info]) => (
          <div
            key={code}
            className={`mb-2 ${info.safe ? "text-green-600" : "text-red-600"}`}
          >
            <strong>
              {countryData?.find((c) => c.code === code)?.name || code}:
            </strong>{" "}
            {info.message}
          </div>
        ))}
      </div>
    </div>
  );
}
