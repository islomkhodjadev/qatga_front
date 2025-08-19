import { apiCall } from "./api";
export async function postLanguage(chatId, lang) {
  const result = await apiCall("telegram/bot-clients/set-language/", "post", {
    chat_id: chatId,
    language: lang,
  });
  if (result.ok) {
    return lang;
  }
  return null;
}

export async function getLanguage() {
  const result = await apiCall("telegram/bot-clients/get-user/", "get");
  if (result.ok) {
    return result.data.language;
  }
  return null;
}
