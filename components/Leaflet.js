"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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

// Create a loading component
function Loading() {
  return <div>Loading map...</div>;
}

// Dynamically import the Map component with SSR disabled
const DynamicMap = dynamic(() => import("./Map"), {
  ssr: false, // This is crucial - it prevents the component from being rendered on the server
  loading: Loading,
});

export default function LeafletMap() {
  return <DynamicMap />;
}
