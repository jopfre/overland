"use client";
import { countryOutlines } from "./countryOutlines";
import { countryCodes } from "@/utils/codes";
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for the default marker icon issue in react-leaflet
const defaultIcon = L.icon({
  iconUrl: "/images/marker-icon.png",
  iconRetinaUrl: "/images/marker-icon-2x.png",
  shadowUrl: "/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function Map() {
  // Center on a more global view
  const position = [20, 0];
  const [isClient, setIsClient] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const geoJsonLayerRef = useRef(null);

  useEffect(() => {
    // Set marker icon only on client side
    L.Marker.prototype.options.icon = defaultIcon;
    setIsClient(true);
  }, []);

  // Style function for the GeoJSON layer
  const countryStyle = (feature) => {
    return {
      fillColor: "#FFEDA0",
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.5,
    };
  };

  // Highlight feature on hover
  const highlightFeature = (e) => {
    const layer = e.target;

    if (!layer) return;

    layer.setStyle({
      weight: 5,
      color: "#666",
      dashArray: "",
      fillOpacity: 0.7,
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }

    setSelectedCountry(layer.feature.properties);
  };

  // Reset highlight on mouseout
  const resetHighlight = (e) => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.resetStyle(e.target);
    }
    setSelectedCountry(null);
  };

  // Zoom to country on click
  const zoomToFeature = (e) => {
    const map = e.target._map;
    map.fitBounds(e.target.getBounds());
  };

  // Add these event handlers to each feature
  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature,
    });
  };

  // Info control component
  const InfoControl = () => {
    return (
      <div
        className="info"
        style={{
          padding: "6px 8px",
          font: "14px/16px Arial, Helvetica, sans-serif",
          background: "white",
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
          borderRadius: "5px",
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
        }}
      >
        <h4 style={{ margin: "0 0 5px", color: "#777" }}>
          Country Information
        </h4>
        {selectedCountry ? (
          <div>
            <b>{selectedCountry.name}</b>
          </div>
        ) : (
          <div>Hover over a country</div>
        )}
      </div>
    );
  };

  // Component to get reference to the GeoJSON layer
  const GeoJSONWithRef = () => {
    const map = useMap();

    useEffect(() => {
      if (map && geoJsonLayerRef.current) {
        // This ensures the GeoJSON layer is properly added to the map
        geoJsonLayerRef.current.addTo(map);
      }
    }, [map]);

    return (
      <GeoJSON
        ref={geoJsonLayerRef}
        data={countryOutlines}
        style={countryStyle}
        onEachFeature={onEachFeature}
      />
    );
  };

  if (!isClient) {
    return <div>Loading map...</div>;
  }

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <MapContainer
        center={position}
        zoom={2}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSONWithRef />
      </MapContainer>
      <InfoControl />
    </div>
  );
}
