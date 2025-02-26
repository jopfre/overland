import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".cache");
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

let cacheHits = 0;
let cacheMisses = 0;

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
        cacheHits++;
        console.log(`🔍 Cache HIT for ${key} (Total hits: ${cacheHits})`);
        return cacheData.data;
      } else {
        cacheMisses++;
        console.log(
          `🔍 Cache EXPIRED for ${key} (Total misses: ${cacheMisses})`
        );
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
    // Ensure the cache directory exists (it might have been deleted)
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

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
    // Don't let cache errors affect the application
  }
}

/**
 * Cleans up expired cache files
 * @returns {number} Number of files removed
 */
export function cleanupExpiredCache() {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    let removedCount = 0;

    files.forEach((file) => {
      const cacheFile = path.join(CACHE_DIR, file);
      try {
        const cacheData = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
        if (Date.now() - cacheData.timestamp >= ONE_DAY_MS) {
          fs.unlinkSync(cacheFile);
          removedCount++;
        }
      } catch (error) {
        // If file can't be parsed, remove it
        fs.unlinkSync(cacheFile);
        removedCount++;
      }
    });

    return removedCount;
  } catch (error) {
    console.error("Error cleaning up cache:", error);
    return 0;
  }
}

// Add a function to get cache stats
export function getCacheStats() {
  return {
    hits: cacheHits,
    misses: cacheMisses,
    ratio: cacheHits / (cacheHits + cacheMisses || 1),
    cacheSize: fs.readdirSync(CACHE_DIR).length,
  };
}
