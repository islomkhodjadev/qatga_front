// ./api/postStory.js
import { apiCall } from "./api";
export default async function postStory({ file, placeId = null }) {
  const form = new FormData();
  form.append("story", file); // MUST match your StoryModel field name
  if (placeId != null) form.append("place", String(placeId)); // FK id if you have it

  // Don't set Content-Type manually. The browser will set the proper multipart boundary.
  // ONLY if apiCall(path, method, body) is the real signature:
  const res = await apiCall(
    "story/story/",
    "POST",
    form,
    "multipart/form-data"
  );

  if (res?.success) return res.data;
  throw new Error(res?.message || "Failed to upload story");
}
