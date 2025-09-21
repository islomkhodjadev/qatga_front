// ./api/postStory.js
import { apiCall } from "./api";
export default async function DeleteStory(storyId) {
  // Remove destructuring
  const res = await apiCall(`story/story/${storyId}/`, "DELETE");
  if (res?.success) return res;
  throw new Error(res?.message || "Failed to delete story");
}
