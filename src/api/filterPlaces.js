import { apiCall } from "./api";
export default async function filterPlaces(category_slug, filters = null) {
  var url = `places/places/?category_slug=${category_slug}`;

  if (filters == null) {
    const result = await apiCall(url);
    if (result.success) {
      return result.data;
    }
    return [];
  }
  if (filters.service_max_price != null) {
    url += `&service_max_price=${filters.service_max_price}`;
  }
  if (filters.service_min_price != null) {
    url += `&service_min_price=${filters.service_min_price}`;
  }
  if (filters.service_pricing_type != null) {
    url += `&service_pricing_type=${filters.service_pricing_type}`;
  }

  if (filters.service_name != null) {
    url += `&service_name=${filters.service_name}`;
  }

  const result = await apiCall(url);

  if (result.success) {
    return result.data;
  }
  return [];
}
