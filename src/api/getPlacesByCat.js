import { apiCall } from "./api";

export default async function getPlacesByCat(categoryid) {
  const result = await apiCall(
    `places/places/places_by_categoryid/${categoryid}/`,
    "Get"
  );
  if (result.success) {
    return result.data;
  }
  return {};
}
