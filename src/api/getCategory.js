import { apiCall } from "./api";

export async function getCategory() {
  const result = await apiCall("places/categories/", "Get");
  if (result.success) {
    return result.data;
  }
  return {};
}
