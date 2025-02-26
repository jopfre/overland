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
  const { MapContainer, TileLayer, GeoJSON } = require("react-leaflet");
  const L = require("leaflet");

  // Add custom CSS for tooltips
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .country-tooltip {
        width: 320px;
      }
      .country-tooltip img {
        display: block;
        margin: 8px auto 0;
        max-width: 100%;
        width: 100%;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);

    // Clean up on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

      // Add status information
      if (countryData.data.details && countryData.data.details.alert_status) {
        const alertStatus = countryData.data.details.alert_status;
        if (alertStatus.length > 0) {
          tooltipContent += `<br/>Status: ${alertStatus
            .join(", ")
            .replace(/_/g, " ")}`;
        } else {
          tooltipContent += `<br/>Status: No travel warnings`;
        }
      } else {
        tooltipContent += `<br/>Status: No travel warnings`;
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
          tooltipContent += `<br/><div style="margin-top: 5px; padding: 5px; background-color: #FFF3CD; color: #856404; border-radius: 4px; font-weight: bold;">⚠️ Organized tour required</div>`;
        }
      }

      // Add image if available
      if (
        countryData.data.details &&
        countryData.data.details.image &&
        countryData.data.details.image.url
      ) {
        tooltipContent += `<br/><img src="${countryData.data.details.image.url}" 
          alt="${countryName}" />`;
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
export default function LeafletMap({ countriesData = [] }) {
  return (
    <div className="h-screen w-full">
      <DynamicMap countriesData={countriesData} />
    </div>
  );
}
