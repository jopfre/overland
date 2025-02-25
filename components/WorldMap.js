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

  // Update map colors when safety status changes
  useEffect(() => {
    if (typeof window.simplemaps_worldmap === "undefined") return;

    // Define warning colors
    const warningColors = {
      avoid_all_travel_to_whole_country: "#FF0000", // Red
      avoid_all_travel_to_parts: "#FFA500", // Orange
      avoid_all_but_essential_travel_to_parts: "#FFFF00", // Yellow
      avoid_all_but_essential_travel_to_whole_country: "#FFA500", // Orange
    };

    // Update map state colors based on safety
    Object.entries(safetyStatus).forEach(([code, info]) => {
      if (window.simplemaps_worldmap_mapdata.state_specific[code]) {
        let color = "#90EE90"; // Default green for safe countries

        // Check if country has warnings and alertStatus exists
        if (
          info?.alertStatus &&
          Array.isArray(info.alertStatus) &&
          info.alertStatus.length > 0
        ) {
          const warning = info.alertStatus[0];
          color = warningColors[warning] || "#FFB6C1";
        }

        window.simplemaps_worldmap_mapdata.state_specific[code].color = color;
      }
    });

    // Reload the map to show new colors
    window.simplemaps_worldmap.load();
  }, [safetyStatus]);

  // Fetch data when target countries are set
  useEffect(() => {
    async function fetchData() {
      if (targetCountries.length === 0) return;

      const data = await getCountriesData(targetCountries);
      setCountryData(data);

      // Process safety information
      const status = {};
      data.forEach((country) => {
        if (country.hasWarnings && Array.isArray(country.alertStatus)) {
          const warning = country.alertStatus[0].replace(/_/g, " ");
          status[country.code] = {
            safe: false,
            alertStatus: country.alertStatus,
            message: `Travel warning: ${warning}`,
          };

          // Update map data with warning information
          if (
            window.simplemaps_worldmap_mapdata?.state_specific?.[country.code]
          ) {
            window.simplemaps_worldmap_mapdata.state_specific[
              country.code
            ].description = `${status[country.code].message}`;
          }
        } else {
          status[country.code] = {
            safe: true,
            alertStatus: [],
            message: "No specific FCDO warnings against travel",
          };

          // Update map data with safe status
          if (
            window.simplemaps_worldmap_mapdata?.state_specific?.[country.code]
          ) {
            window.simplemaps_worldmap_mapdata.state_specific[
              country.code
            ].description = `Safe to travel`;
          }
        }
      });
      setSafetyStatus(status);

      // Reload the map to show updated tooltips
      if (window.simplemaps_worldmap) {
        window.simplemaps_worldmap.load();
      }
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
      {/* <div className="absolute top-4 right-4 bg-white p-4 rounded shadow">
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
      </div> */}
    </div>
  );
}
