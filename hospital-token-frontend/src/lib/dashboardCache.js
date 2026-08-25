/**
 * dashboardCache.js
 * A sessionStorage-based cache with TTL for dashboard API responses.
 *
 * - Data is stored per-key with a timestamp.
 * - `get(key)` returns cached data only if it's within TTL_MS.
 * - `set(key, data)` stores data with the current timestamp.
 * - `invalidate(key)` / `invalidateAll()` force a fresh fetch next time.
 * - TTL is 2 minutes — long enough to avoid redundant fetches on tab switches,
 *   short enough that the admin always sees reasonably fresh queue data.
 */

const PREFIX  = 'gmcch_cache_';
const TTL_MS  = 2 * 60 * 1000; // 2 minutes

export const dashboardCache = {
    /**
     * Returns parsed cached data if fresh, or null if missing/expired.
     * @param {string} key
     * @returns {any|null}
     */
    get(key) {
        try {
            const raw = sessionStorage.getItem(PREFIX + key);
            if (!raw) return null;

            const { data, timestamp } = JSON.parse(raw);
            const age = Date.now() - timestamp;

            if (age > TTL_MS) {
                sessionStorage.removeItem(PREFIX + key); // clean up expired entry
                return null;
            }
            return data;
        } catch {
            return null;
        }
    },

    /**
     * Stores data in cache with the current timestamp.
     * @param {string} key
     * @param {any} data
     */
    set(key, data) {
        try {
            sessionStorage.setItem(PREFIX + key, JSON.stringify({
                data,
                timestamp: Date.now(),
            }));
        } catch {
            // sessionStorage quota exceeded or unavailable — fail silently
        }
    },

    /**
     * Removes a single cache entry, forcing next get() to fetch fresh.
     * @param {string} key
     */
    invalidate(key) {
        sessionStorage.removeItem(PREFIX + key);
    },

    /**
     * Removes all GMCCH cache entries (e.g. on logout).
     */
    invalidateAll() {
        Object.keys(sessionStorage)
            .filter(k => k.startsWith(PREFIX))
            .forEach(k => sessionStorage.removeItem(k));
    },

    /**
     * Returns the age of a cache entry in seconds, or null if not cached.
     * @param {string} key
     * @returns {number|null}
     */
    getAge(key) {
        try {
            const raw = sessionStorage.getItem(PREFIX + key);
            if (!raw) return null;
            const { timestamp } = JSON.parse(raw);
            return Math.floor((Date.now() - timestamp) / 1000);
        } catch {
            return null;
        }
    }
};

export const CACHE_KEYS = {
    SUMMARY : 'dashboard_summary',
    UNITS   : 'dashboard_units',
};
