import { apiCall } from "./api";

export default async function ToggleLike({
  story_id,
  bot_client_id,
  like_id = null,
}) {
  let res;

  if (like_id == null || like_id == -1) {
    res = await apiCall("story/like/", "POST", {
      story: story_id,
      bot_client: bot_client_id,
    });
    if (res.success) {
      return res.data;
    }
    return { id: -1 };
  }
  res = await apiCall(`story/like/${like_id}/`, "DELETE");
  if (res.success) {
    return { id: -1 };
  }
  return like_id;
}
