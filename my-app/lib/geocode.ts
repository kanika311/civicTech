/**
 * Geocode a location string to lat/lng using OpenStreetMap Nominatim.
 * Use max 1 request per second (Nominatim policy).
 */

export type Coords = { lat: number; lng: number };

/** India center - used when geocoding fails or for fallback */
const INDIA_CENTER: Coords = { lat: 20.5937, lng: 78.9629 };

export async function geocodeLocation(
  location: string
): Promise<Coords | null> {
  if (!location || !location.trim()) return null;
  let query = location.trim();
  if (!/,\s*India$/i.test(query)) {
    query = `${query}, India`;
  }
  const encoded = encodeURIComponent(query);
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "CivicTrack/1.0 (https://github.com/civictrack)",
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    }
    return null;
  } catch {
    return null;
  }
}

/** Geocode location; if Nominatim fails, return a fallback in India (with small offset by index so pins don't stack). */
export async function geocodeWithFallback(
  location: string,
  index: number
): Promise<Coords> {
  const coords = await geocodeLocation(location);
  if (coords) return coords;
  const offset = (index % 5) * 0.05;
  const angle = (index % 8) * 0.8;
  return {
    lat: INDIA_CENTER.lat + offset * Math.cos(angle),
    lng: INDIA_CENTER.lng + offset * Math.sin(angle),
  };
}

/** Geocode multiple locations with 1 req/sec delay. Returns array of coords (null if failed). */
export async function geocodeLocations(
  locations: string[]
): Promise<(Coords | null)[]> {
  const results: (Coords | null)[] = [];
  for (const loc of locations) {
    const coords = await geocodeLocation(loc);
    results.push(coords);
    await new Promise((r) => setTimeout(r, 1100));
  }
  return results;
}
