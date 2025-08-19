import { apiCall } from "./api";

export default async function searchPlacesList(search, categoryid) {
  const result = await apiCall(
    `places/places/places_by_categoryid/${categoryid}?search=${search}`,
    "Get"
  );

  if (result.success) {
    return result.data;
  }
  return {};
}
