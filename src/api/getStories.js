import { apiCall } from "./api";

export default async function getStories(query = null) {
  let result;
  if (query != null) {
    result = await apiCall(`story/story?${query}`);
  } else {
    result = await apiCall(`story/story`);
  }
  if (result.success) {
    return result.data;
  }
  return {};
}
