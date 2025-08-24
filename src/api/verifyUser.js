import { apiCall } from "./api";

export default async function verifyUser(phone_number) {
  const result = await apiCall("telegram/bot-clients/verify-user/", "post", {
    phone_number: phone_number,
  });

  if (result.success) {
    return true;
  }
  return false;
}
