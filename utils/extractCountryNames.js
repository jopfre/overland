import { countryOutlines } from "@/utils/countryOutlines";

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
};

/**
 * Get all country names from the countryOutlines data
 * @returns {string[]} Array of country names
 */
export function getCountryNames() {
  // Extract all name_en values from the countryOutlines features
  const countryNames = countryOutlines.features
    .map((feature) => feature.properties.name)
    .filter(Boolean); // Filter out any undefined or null values

  return countryNames;
}

/**
 * Get country names and ISO codes as key-value pairs
 * @returns {Object} Object mapping ISO codes to country names and slugs
 */
export function getCountryNamesByCode() {
  const countryMap = {};

  countryOutlines.features.forEach((feature) => {
    const isoCode = feature.properties.iso_a2;
    const name = feature.properties.name;

    if (isoCode && name) {
      // Create a slug from the name for API calls
      const slug = name.toLowerCase().replace(/\s+/g, "-");

      countryMap[isoCode] = {
        original: name,
        slug: slug,
      };
    }
  });

  return countryMap;
}

/**
 * Map alert status to color codes
 * @param {string} alertStatus - The alert status from the API
 * @returns {string} Color code for the alert status
 */
export function getAlertStatusColor(alertStatus) {
  if (!alertStatus || alertStatus.length === 0) {
    return "#00FF00"; // Green for empty array (no warnings)
  }

  // Check for the most severe alert in the array
  if (alertStatus.includes("avoid_all_travel_to_whole_country")) {
    return "#FF0000"; // Red for avoid all travel
  } else if (
    alertStatus.includes("avoid_all_but_essential_travel_to_whole_country")
  ) {
    return "#FFA500"; // Orange for avoid all but essential travel
  } else if (
    alertStatus.some((status) => status.includes("avoid_all_travel_to_parts"))
  ) {
    return "#FF6347"; // Tomato for avoid all travel to parts
  } else if (
    alertStatus.some((status) =>
      status.includes("avoid_all_but_essential_travel_to_parts")
    )
  ) {
    return "#FFD700"; // Gold for avoid all but essential travel to parts
  }

  return "#00FF00"; // Green for no specific warnings
}
