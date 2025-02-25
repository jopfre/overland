"use client";
import { countryPaths } from "./countryPaths";
import { countryCodes } from "@/utils/codes";
import React, { useState } from "react";
export default function Map({ countries = [], safetyStatus = {}, ...props }) {
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const countrySet = new Set(countries.map((code) => code.toLowerCase()));

  // Define warning colors
  const warningColors = {
    avoid_all_travel_to_whole_country: "#FF4B4B", // Softer red
    avoid_all_travel_to_parts: "#FF9F45", // Warm orange
    avoid_all_but_essential_travel_to_parts: "#FFD93D", // Warm yellow
    avoid_all_but_essential_travel_to_whole_country: "#FF9F45", // Warm orange
  };

  const getCountryColor = (code) => {
    const info = safetyStatus.find((status) => status.code === code);
    if (!info) return "#E8E8E8"; // Lighter gray for countries without data

    // If country has warnings
    if (info.hasWarnings) {
      if (
        info.alertStatus &&
        Array.isArray(info.alertStatus) &&
        info.alertStatus.length > 0
      ) {
        const warning = info.alertStatus[0];
        return warningColors[warning] || "#FFC4C4"; // Softer pink as fallback
      }
      return "#FF9F45"; // Warm orange for countries with warnings but no specific alert status
    }

    return "#4ADE80"; // Fresh green for safe countries
  };

  const shouldShowPath = (className) => {
    if (countries.length === 0) return true;
    if (!className) return true;
    const countryCode = className.split("_").pop().toLowerCase();
    return countrySet.has(countryCode);
  };

  const getCountryCode = (className) => {
    return className?.split("_").pop().toUpperCase() || "";
  };

  const getCountryName = (code) => {
    const country = countryCodes.find((country) => country.code === code);
    return country ? country.name : code;
  };

  const getCountryInfo = (code) => {
    return safetyStatus.find((status) => status.code === code);
  };

  // Function to extract text content from HTML string
  // Helper function to extract warning details
  function extractWarningDetails(html) {
    if (!html) return "";

    // Find the content between the markers
    // Using just "advises against travel" will match both cases with and without the space
    const startMarker = "advises against travel";

    const endMarker = "<p>Find out more about";

    const startIndex = html.indexOf(startMarker);
    const endIndex = html.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) return "";

    // Find the closing h2 tag after our marker
    const closingH2Index = html.indexOf("</h2>", startIndex);

    // Extract and clean the content, starting after the closing h2 tag
    let content = html
      .substring(closingH2Index + "</h2>".length, endIndex)
      .replace(/&amp;/g, "&") // Replace HTML entities
      .replace(/\n\s*\n/g, "\n") // Remove extra newlines
      .trim();

    return content;
  }

  // Add this function near the other utility functions
  const openTravelAdvice = (code) => {
    const countryInfo = getCountryInfo(code);
    if (!countryInfo) return;

    // Convert country name to lowercase and replace spaces with hyphens
    const countrySlug = getCountryName(code).toLowerCase().replace(/\s+/g, "-");
    const url = `https://www.gov.uk/foreign-travel-advice/${countrySlug}`;
    window.open(url, "_blank");
  };

  // Modify the paths to include hover handlers and colors
  const enhancedPaths = countryPaths.map((path) => {
    if (!path.props.className) return path;
    const countryCode = getCountryCode(path.props.className);
    return React.cloneElement(path, {
      onMouseEnter: () => setHoveredCountry(countryCode),
      onMouseLeave: () => setHoveredCountry(null),
      onClick: () => openTravelAdvice(countryCode),
      fill: getCountryColor(countryCode),
      style: {
        transition: "fill 0.3s ease",
        cursor: "pointer", // Add cursor pointer to indicate clickable
      },
    });
  });

  return (
    <div className="w-full h-screen flex items-center justify-center relative bg-slate-100">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid"
        viewBox="1080 0 700 500"
        {...props}
      >
        {enhancedPaths.filter((path) => shouldShowPath(path.props.className))}
      </svg>
      {hoveredCountry && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            padding: "10px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            borderRadius: "5px",
            fontSize: "14px",
            maxWidth: "300px",
          }}
        >
          <div className="font-bold mb-2">{getCountryName(hoveredCountry)}</div>
          {(() => {
            const countryInfo = getCountryInfo(hoveredCountry);
            if (!countryInfo) return null;

            return (
              <>
                {countryInfo.hasWarnings ? (
                  <div className="text-red-300 mb-2">
                    {countryInfo.alertStatus?.length > 0
                      ? countryInfo.alertStatus.map((status) => (
                          <div key={status} className="mb-1">
                            ⚠️{" "}
                            {status.replace(/_/g, " ").charAt(0).toUpperCase() +
                              status.replace(/_/g, " ").slice(1)}
                          </div>
                        ))
                      : "⚠️ Travel warnings in effect"}
                  </div>
                ) : (
                  <div className="text-green-300 mb-2">✓ Safe for travel</div>
                )}
                {countryInfo.warningDetails && !countryInfo.image && (
                  <div className="text-sm mb-2">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: extractWarningDetails(
                          countryInfo.warningDetails
                        ),
                      }}
                    />
                  </div>
                )}
                {countryInfo.image && (
                  <img
                    src={countryInfo.image}
                    alt={`${getCountryName(hoveredCountry)} map`}
                    style={{
                      marginTop: "8px",
                      maxWidth: "100%",
                      borderRadius: "3px",
                    }}
                  />
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
