"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { countryOutlines } from "../utils/countryOutlines";
import { getAlertStatusColor } from "../utils/extractCountryNames";

// Import CSS for Leaflet
import "leaflet/dist/leaflet.css";

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
        max-width: 250px;
      }
      .country-tooltip img {
        display: block;
        margin: 8px auto 0;
        max-width: 100%;
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

      // Add image if available
      if (
        countryData.data.details &&
        countryData.data.details.image &&
        countryData.data.details.image.url
      ) {
        tooltipContent += `<br/><img src="${countryData.data.details.image.url}" 
          alt="${countryName}" style="max-width: 200px; max-height: 150px; margin-top: 8px;" />`;
      }
    }

    // Create a custom tooltip with larger max width to accommodate images
    const tooltip = layer.bindTooltip(tooltipContent, {
      permanent: false,
      direction: "top",
      className: "country-tooltip",
      maxWidth: 250,
    });

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
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 1,
          color: "white",
          dashArray: "3",
          fillOpacity: 0.7,
        });
      },
      click: (e) => {
        // Handle click event if needed
        console.log(`Clicked on ${countryName}`);

        // If you want to show more details on click, you could do something like:
        if (countryData && countryData.data) {
          console.log(countryData.data);
        }
      },
    });
  };

  return (
    <>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
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

      <div
        className="map-legend"
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          background: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}
      >
        <h4>Travel Advice</h4>
        <div>
          <span
            style={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              backgroundColor: "#FF0000",
              marginRight: "5px",
            }}
          ></span>{" "}
          Avoid all travel
        </div>
        <div>
          <span
            style={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              backgroundColor: "#FFA500",
              marginRight: "5px",
            }}
          ></span>{" "}
          Avoid all but essential travel
        </div>
        <div>
          <span
            style={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              backgroundColor: "#FF6347",
              marginRight: "5px",
            }}
          ></span>{" "}
          Avoid all travel to parts
        </div>
        <div>
          <span
            style={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              backgroundColor: "#FFD700",
              marginRight: "5px",
            }}
          ></span>{" "}
          Avoid all but essential travel to parts
        </div>
        <div>
          <span
            style={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              backgroundColor: "#00FF00",
              marginRight: "5px",
            }}
          ></span>{" "}
          No specific warnings
        </div>
        <div>
          <span
            style={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              backgroundColor: "#CCCCCC",
              marginRight: "5px",
            }}
          ></span>{" "}
          No data available
        </div>
      </div>
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
    <div style={{ height: "100vh", width: "100%" }}>
      <DynamicMap countriesData={countriesData} />
    </div>
  );
}
