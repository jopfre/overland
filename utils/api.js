const CACHE_KEY = "govuk_travel_advice";
const BASE_URL = "https://www.gov.uk/api/content/foreign-travel-advice";

// Function to get country name from parent_id
function getCountrySlugFromId(id) {
  if (typeof window === "undefined") return id;

  const mapdata = window.simplemaps_worldmap_mapdata;
  if (!mapdata?.labels) return id;

  // Find the label entry that matches the parent_id
  const label = Object.values(mapdata.labels).find(
    (label) => label.parent_id === id
  );

  // Convert name to lowercase and replace spaces with hyphens
  return label?.name.toLowerCase().replace(/\s+/g, "-");
}

export async function getCountriesData(countryCodes) {
  // Check if we have valid cached data
  const cached = getCachedData();
  if (cached) {
    return cached.data;
  }

  // Fetch fresh data for all countries
  const promises = countryCodes.map(async (code) => {
    try {
      const countryName = getCountrySlugFromId(code);
      const response = await fetch(`${BASE_URL}/${countryName}`);

      if (!response.ok) {
        console.warn(`Failed to fetch data for ${countryName} (${code})`);
        return null;
      }

      const data = await response.json();
      console.log(data.details?.image?.url);
      // Extract safety information
      const safetyInfo = {
        code,
        name: countryName,
        title: data.title,
        updated: data.public_updated_at,
        // Check if FCDO advises against travel
        hasWarnings: data.details?.alert_status?.length > 0,
        alertStatus: data.details?.alert_status || [],
        // Extract specific warnings for parts of the country
        warningDetails:
          data.details?.parts?.find(
            (part) => part.slug === "warnings-and-insurance"
          )?.body || "",
        // Get safety and security information
        safetyAndSecurity:
          data.details?.parts?.find(
            (part) => part.slug === "safety-and-security"
          )?.body || "",
        // Add warning map image if available
        image: data.details?.image?.url || null,
      };

      return safetyInfo;
    } catch (error) {
      console.error(`Error fetching data for ${code}:`, error);
      return null;
    }
  });

  const results = await Promise.all(promises);
  const validResults = results.filter(Boolean);

  // Cache the results
  setCachedData(validResults);

  return validResults;
}

function getCachedData() {
  if (typeof window === "undefined") return null;

  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  const { timestamp, data } = JSON.parse(cached);
  const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24 hours
  // const isExpired = true;
  if (isExpired) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }

  return { timestamp, data };
}

function setCachedData(data) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data,
    })
  );
}
