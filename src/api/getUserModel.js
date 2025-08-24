import { apiCall } from "./api";

export default async function getUserModel() {
  const result = await apiCall("telegram/bot-clients/get-user/");
  if (result.status == "error") {
    return {};
  }
  return result.data;
}
