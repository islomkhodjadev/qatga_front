// i18nField.js
export function pickLangField(obj, base, lang, fallbacks = ["uz", "ru", "en"]) {
  const candidates = [lang, ...fallbacks];
  for (const code of candidates) {
    const key = `${base}_${code}`;

    if (obj?.[key]) {
      return obj[key];
    }
  }
  return ""; // or null
}
