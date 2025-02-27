"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { countryOutlines } from "../utils/countryOutlines";
import { getAlertStatusColor } from "../utils/extractCountryNames";

import "leaflet/dist/leaflet.css";

// Import the MapLegend component
import MapLegend from "./MapLegend";

// Create a client-side only version of the map
const ClientSideMap = ({ countriesData }) => {
  // Import Leaflet components dynamically
  const {
    MapContainer,
    TileLayer,
    GeoJSON,
    Marker,
    Popup,
  } = require("react-leaflet");
  const L = require("leaflet");

  const [borderCrossings, setBorderCrossings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch border crossings on the client side
    async function fetchBorderCrossings() {
      try {
        const response = await fetch("/api/border-crossings");
        if (!response.ok) {
          console.error("Failed to fetch border crossings:", response.status);
          return;
        }
        const data = await response.json();
        setBorderCrossings(data.crossings || []);
      } catch (error) {
        console.error("Error fetching border crossings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBorderCrossings();
  }, []);

  // Add custom CSS for tooltips and emoji icons
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .country-tooltip {
        width: 320px;
        max-width: 320px;
        width: max-content;
        white-space: normal;
      }
      .country-tooltip .leaflet-tooltip-content {
        word-wrap: break-word;
        white-space: normal;
        overflow-wrap: break-word;
      }
      .country-tooltip img {
        display: block;
        margin: 8px auto 0;
        max-width: 100%;
        width: 100%;
        border-radius: 4px;
      }
      .emoji-icon {
        font-size: 16px;
        text-align: center;
        line-height: 18px;
        background: none;
        border: none;
      }
    `;
    document.head.appendChild(style);

    // Clean up on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Function to get emoji based on styleUrl
  const getBorderCrossingEmoji = (styleUrl) => {
    if (!styleUrl) return "❓"; // Default emoji

    // Extract the style ID from the styleUrl (e.g., "#icon-62" -> "icon-62")
    const styleId = styleUrl.startsWith("#") ? styleUrl.substring(1) : styleUrl;

    // Map different style IDs to different emojis
    const emojiMap = {
      "icon-62": "✅", // Open border
      "icon-15": "🚧", // Possible problems
      "icon-124": "❌", // Closed border
      "icon-163": "❓", // Unknown
      "icon-22": "🎌", // Bilateral border crossing
    };

    return emojiMap[styleId] || "❓"; // Return mapped emoji or default
  };

  // Function to get human-readable status text from styleUrl
  const getBorderStatusText = (styleUrl) => {
    if (!styleUrl) return "Unknown";

    const styleId = styleUrl.startsWith("#") ? styleUrl.substring(1) : styleUrl;

    const statusMap = {
      "icon-62": "Open", // Open border
      "icon-15": "Possible problems", // Possible problems
      "icon-124": "Closed", // Closed border
      "icon-163": "Unknown", // Unknown
      "icon-22": "Bilateral", // Bilateral border crossing
    };

    return statusMap[styleId] || "Border Checkpoint";
  };

  // Create a custom icon for border crossings using emoji
  const createBorderCrossingIcon = (styleUrl) => {
    return L.divIcon({
      html: getBorderCrossingEmoji(styleUrl),
      className: "emoji-icon",
      iconSize: [14, 14],
      iconAnchor: [9, 9],
      popupAnchor: [0, -9],
    });
  };

  // Style function for the GeoJSON layer
  const countryStyle = (feature) => {
    const isoCode = feature.properties.iso_a2;

    // Find if we have data for this country
    const countryData = countriesData.find(
      (country) => country.code === isoCode
    );

    let fillColor = "#CCCCCC"; // Default gray for no data

    if (countryData && countryData.data) {
      // If we have data for this country, check alert status
      if (countryData.data.details && countryData.data.details.alert_status) {
        fillColor = getAlertStatusColor(countryData.data.details.alert_status);
      } else {
        // If there's data but no alert_status, treat as no warnings
        fillColor = "#00FF00";
      }
    }

    return {
      fillColor: fillColor,
      weight: 1,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    };
  };

  // Handle events for each feature
  const onEachFeature = (feature, layer) => {
    const countryName = feature.properties.name;
    const isoCode = feature.properties.iso_a2;

    // Find if we have data for this country
    const countryData = countriesData.find(
      (country) => country.code === isoCode
    );

    let tooltipContent = countryName;

    if (countryData && countryData.data) {
      // Start building tooltip content
      tooltipContent = `<strong>${countryName}</strong>`;

      // Add status information only when there are warnings
      if (countryData.data.details && countryData.data.details.alert_status) {
        const alertStatus = countryData.data.details.alert_status;
        if (alertStatus.length > 0) {
          const alertText = alertStatus
            .join(", ")
            .replace(/_/g, " ")
            .replace(/^\w/, (c) => c.toUpperCase());

          // Determine color based on severity
          let bgColor = "#FFF3CD"; // Default yellow warning color
          let textColor = "#856404";
          let icon = "⚠️";

          // Check for severe warnings - only "avoid all travel to whole country" gets the most severe styling
          if (
            alertText
              .toLowerCase()
              .includes("avoid all travel to whole country")
          ) {
            bgColor = "#F8D7DA";
            textColor = "#721C24";
            icon = "🚫";
          }

          tooltipContent += `<div style="margin-top: 5px; padding: 5px; background-color: ${bgColor}; color: ${textColor}; border-radius: 4px; font-weight: bold;">${icon} ${alertText}</div>`;
        }
      }

      // Add image if available and not "avoid all travel to whole country"
      const hasAvoidAllTravel = countryData.data.details?.alert_status?.some(
        (status) =>
          status.toLowerCase().includes("avoid_all_travel_to_whole_country")
      );

      if (
        !hasAvoidAllTravel &&
        countryData.data.details &&
        countryData.data.details.image &&
        countryData.data.details.image.url
      ) {
        tooltipContent += `<img style="margin-top: 5px; display:block;" src="${countryData.data.details.image.url}" 
            alt="${countryName}" />`;
      }

      // Add visa requirements information
      if (
        countryData.data.details &&
        countryData.data.details.parts &&
        Array.isArray(countryData.data.details.parts)
      ) {
        // Find entry requirements section
        const entryRequirements = countryData.data.details.parts.find(
          (part) => part.slug === "entry-requirements"
        );

        // Extract visa information if available
        if (entryRequirements && entryRequirements.body) {
          // Look for visa-requirements section with a more flexible pattern
          const visaSection = entryRequirements.body.match(
            /<h2[^>]*visa-requirements[^>]*>.*?<\/h2>([\s\S]*?)(?=<h2|$)/i
          );

          if (visaSection && visaSection[1]) {
            // Extract the content between visa-requirements h2 and the next h2
            let visaContent = visaSection[1].trim();

            // Clean up the content (remove HTML tags and limit length)
            visaContent = visaContent
              .replace(/<[^>]*>/g, "") // Remove HTML tags
              .replace(/\s+/g, " ") // Normalize whitespace
              .trim();

            // Limit to a reasonable length (first 200 characters)
            if (visaContent.length > 200) {
              const lastPeriod = visaContent.substring(0, 200).lastIndexOf(".");
              if (lastPeriod !== -1) {
                visaContent = visaContent.substring(0, lastPeriod + 1);
              } else {
                visaContent = visaContent.substring(0, 197) + "...";
              }
            }

            if (visaContent) {
              tooltipContent += `<div style="margin-top: 5px; padding: 5px; background-color: #E2F0FF; color: #0066CC; border-radius: 4px;">🛂 ${visaContent}</div>`;
            }
          }
        }
      }

      // Check for organized tour requirement
      if (
        countryData.data.details &&
        countryData.data.details.parts &&
        Array.isArray(countryData.data.details.parts)
      ) {
        // Find entry requirements section
        const entryRequirements = countryData.data.details.parts.find(
          (part) => part.slug === "entry-requirements"
        );

        // Check if organized tour is mentioned
        if (
          entryRequirements &&
          entryRequirements.body &&
          entryRequirements.body.toLowerCase().includes("organised tour")
        ) {
          tooltipContent += `<div style="margin-top: 5px; padding: 5px; background-color: #FFF3CD; color: #856404; border-radius: 4px; font-weight: bold;">⚠️ Organized tour required</div>`;
        }
      }
    }

    // Create a tooltip that follows the cursor
    const tooltip = L.tooltip({
      permanent: false,
      direction: "top",
      className: "country-tooltip",
      width: 320,
      opacity: 0.9,
      sticky: true, // This makes the tooltip follow the cursor
    });

    tooltip.setContent(tooltipContent);

    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: "#666",
          dashArray: "",
          fillOpacity: 0.9,
        });
        layer.bringToFront();

        // Show tooltip at cursor position
        tooltip.setLatLng(e.latlng).addTo(layer._map);
      },
      mousemove: (e) => {
        // Update tooltip position as cursor moves
        tooltip.setLatLng(e.latlng);
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 1,
          color: "white",
          dashArray: "3",
          fillOpacity: 0.7,
        });

        // Remove tooltip when mouse leaves the country
        layer._map.closeTooltip(tooltip);
      },
      click: (e) => {
        // Open UK government travel advice website for the clicked country
        if (countryData && countryData.data) {
          // Get the country slug from the data if available
          const countrySlug =
            countryData.data.details?.slug ||
            countryName.toLowerCase().replace(/\s+/g, "-");

          // Construct the URL for the UK government travel advice
          const ukGovUrl = `https://www.gov.uk/foreign-travel-advice/${countrySlug}`;

          // Open the URL in a new tab
          window.open(ukGovUrl, "_blank");

          console.log(`Opening travel advice for ${countryName}: ${ukGovUrl}`);
        } else {
          console.log(`No data available for ${countryName}`);
        }
      },
    });
  };

  return (
    <>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          data={countryOutlines}
          style={countryStyle}
          onEachFeature={onEachFeature}
        />

        {/* Add border crossing markers */}
        {borderCrossings.map((crossing, index) => (
          <Marker
            key={`crossing-${index}`}
            position={crossing.position}
            icon={createBorderCrossingIcon(crossing.properties?.styleUrl)}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{crossing.name}</h3>
                <div
                  dangerouslySetInnerHTML={{ __html: crossing.description }}
                />
                {crossing.properties && crossing.properties.styleUrl && (
                  <p className="text-xs  mt-2">
                    {getBorderStatusText(crossing.properties.styleUrl)}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <MapLegend />
    </>
  );
};

// Create a dynamic component with SSR disabled
const DynamicMap = dynamic(() => Promise.resolve(ClientSideMap), {
  ssr: false,
});

// Main component that renders the dynamic map
export default function LeafletMap({ countriesData }) {
  return (
    <div className="h-screen w-full">
      <DynamicMap countriesData={countriesData} />
    </div>
  );
}
