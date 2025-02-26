import { countryOutlines } from "./countryOutlines";

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
};

export function getCountryNames() {
  // Extract all name_en values from the countryOutlines features
  const countryNames = countryOutlines.features
    .map((feature) => ({
      original: feature.properties.name_en,
      slug: slugify(feature.properties.name_en),
    }))
    .filter((names) => names.original); // Filter out any undefined or null values

  return countryNames;
}

// If you need the ISO codes and names as key-value pairs
export function getCountryNamesByCode() {
  const countryMap = {};

  countryOutlines.features.forEach((feature) => {
    const isoCode = feature.properties.iso_a2;
    const name = feature.properties.name_en;

    if (isoCode && name) {
      countryMap[isoCode] = {
        original: name,
        slug: slugify(name),
      };
    }
  });

  return countryMap;
}
