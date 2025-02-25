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
          const warning =
            country.alertStatus[0].replace(/_/g, " ").charAt(0).toUpperCase() +
            country.alertStatus[0].replace(/_/g, " ").slice(1);
          status[country.code] = {
            safe: false,
            alertStatus: country.alertStatus,
            message: `${warning}`,
            warningMap: warning.includes("parts") ? country.image : null,
            warningDetails: warning.includes("parts")
              ? extractWarningDetails(country.warningDetails)
              : null,
          };

          // Update map data with warning information
          if (
            window.simplemaps_worldmap_mapdata?.state_specific?.[country.code]
          ) {
            // Start with the warning message
            let description = `<p style="font-size: 12px;">${
              status[country.code].message
            }</p>`;

            // Add map image if available
            if (status[country.code].warningMap) {
              description += `<img src="${status[country.code].warningMap}" 
                alt="Travel warning map" 
                style="max-width: 300px; margin-top: 10px;" />`;
            } else if (status[country.code].warningDetails) {
              // Add warning details if no map but details available
              description += `\n\n<div style="font-size: 12px;">${
                status[country.code].warningDetails
              }</div>`;
            }

            window.simplemaps_worldmap_mapdata.state_specific[
              country.code
            ].description = description;
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
            ].description = `<p style="font-size: 12px;">Safe to travel</p>`;
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
    <div className="relative w-full h-full flex items-center justify-center">
      <Script src="/js/mapdata.js" strategy="beforeInteractive" />
      <Script src="/js/lib/raphael.js" strategy="beforeInteractive" />
      <Script src="/js/mapinfo.js" strategy="beforeInteractive" />
      <Script src="/js/worldmap.js" strategy="beforeInteractive" />

      <div id="map" className="w-full "></div>
    </div>
  );
}

// Helper function to extract warning details
function extractWarningDetails(html) {
  if (!html) return "";

  // Find the content between the markers
  const startMarker =
    '<h2 id="areas-where-fcdo-advises-against-travel">Areas where <abbr title="Foreign, Commonwealth &amp; Development Office">FCDO</abbr> advises against travel</h2>';
  const endMarker = "<p>Find out more about";

  const startIndex = html.indexOf(startMarker);
  const endIndex = html.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) return "";

  // Extract and clean the content, starting after the h2 tag
  let content = html
    .substring(startIndex + startMarker.length, endIndex)
    .replace(/&amp;/g, "&") // Replace HTML entities
    .replace(/\n\s*\n/g, "\n") // Remove extra newlines
    .trim();

  return content;
}
