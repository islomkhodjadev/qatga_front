import { locationManager } from "@telegram-apps/sdk";
import { apiCall } from "./api";
export default async function getPlacesByLocation(category_slug) {
  if (locationManager.requestLocation.isAvailable()) {
    const location = await locationManager.requestLocation();
    const result = await apiCall(
      `places/places/?category_slug=${category_slug}&latitude=${location.latitude}&longitude=${location.longitude}`
    );
    if (result.success) {
      return result.data;
    }
    return [];
  }

  const result = await apiCall(
    `/places/places/?category_slug=${category_slug}`
  );

  if (result.success) {
    return result.data;
  }
  return [];
}
