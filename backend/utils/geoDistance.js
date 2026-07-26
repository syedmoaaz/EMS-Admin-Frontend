const EARTH_RADIUS_KM = 6371;
/** Ignore GPS jitter shorter than this (meters). */
export const MIN_SEGMENT_METERS = 20;

/**
 * Great-circle distance in kilometers between two WGS84 points.
 */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Distance to add for a new point, or 0 if missing/jitter.
 */
export function segmentKm(prevLat, prevLng, lat, lng) {
  if (
    prevLat == null ||
    prevLng == null ||
    lat == null ||
    lng == null ||
    Number.isNaN(Number(lat)) ||
    Number.isNaN(Number(lng))
  ) {
    return 0;
  }
  const km = haversineKm(
    Number(prevLat),
    Number(prevLng),
    Number(lat),
    Number(lng)
  );
  if (km * 1000 < MIN_SEGMENT_METERS) return 0;
  return km;
}

export function formatDistanceKm(km) {
  const n = Number(km) || 0;
  if (n < 0.05) return "0 km";
  if (n < 10) return `${n.toFixed(2)} km`;
  return `${n.toFixed(1)} km`;
}
