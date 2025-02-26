"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { countryOutlines } from "../utils/countryOutlines";
import {
  getCountryNamesByCode,
  getAlertStatusColor,
} from "../utils/extractCountryNames";

// Fix for the default marker icon issue in react-leaflet
// const defaultIcon = L.icon({
//   iconUrl: "/images/marker-icon.png",
//   iconRetinaUrl: "/images/marker-icon-2x.png",
//   shadowUrl: "/images/marker-shadow.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41],
// });

// L.Marker.prototype.options.icon = defaultIcon;

export default function Leaflet({ countriesData = [] }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
      if (countryData.data.details && countryData.data.details.alert_status) {
        const alertStatus = countryData.data.details.alert_status;
        if (alertStatus.length > 0) {
          tooltipContent = `<strong>${countryName}</strong><br/>Status: ${alertStatus
            .join(", ")
            .replace(/_/g, " ")}`;
        } else {
          tooltipContent = `<strong>${countryName}</strong><br/>Status: No travel warnings`;
        }
      } else {
        tooltipContent = `<strong>${countryName}</strong><br/>Status: No travel warnings`;
      }
    }

    layer.bindTooltip(tooltipContent);

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
      },
    });
  };

  if (!isClient) {
    return <div>Loading map...</div>;
  }

  return (
    <div style={{ height: "100vh", width: "100%" }}>
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
    </div>
  );
}
