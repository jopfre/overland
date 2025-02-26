import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".cache");
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Get data from cache if it exists and is not expired
 * @param {string} key - Cache key
 * @returns {Object|null} - Cached data or null if not found/expired
 */
export function getFromCache(key) {
  const cacheFile = path.join(CACHE_DIR, `${key}.json`);

  try {
    if (fs.existsSync(cacheFile)) {
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, "utf8"));

      // Check if cache is still valid
      if (Date.now() - cacheData.timestamp < ONE_DAY_MS) {
        // console.log(`🔍 Cache HIT for ${key}`);
        return cacheData.data;
      } else {
        // console.log(`🔍 Cache EXPIRED for ${key}`);
      }
    }
  } catch (error) {
    console.error(`Error reading cache for ${key}:`, error);
  }

  return null;
}

/**
 * Save data to cache
 * @param {string} key - Cache key
 * @param {Object} data - Data to cache
 */
export function saveToCache(key, data) {
  const cacheFile = path.join(CACHE_DIR, `${key}.json`);

  try {
    fs.writeFileSync(
      cacheFile,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      }),
      "utf8"
    );
    console.log(`💾 Saved to cache: ${key}`);
  } catch (error) {
    console.error(`Error writing cache for ${key}:`, error);
  }
}
