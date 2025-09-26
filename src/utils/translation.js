// utils/translate.js
import enTranslations from "./languages/en.json";
import ruTranslations from "./languages/ru.json";
import uzTranslations from "./languages/uz.json";
const translations = {
  uz: uzTranslations,
  ru: ruTranslations,
  en: enTranslations,
};

/**
 * Standalone translation function
 * @param {string} key - Translation key
 * @param {string} lang - Language code ('uz', 'ru', 'en')
 * @param {object} params - Dynamic parameters to replace in translation
 * @returns {string} Translated text
 */
export function translate(key, lang = "en", params = {}) {
  let translation =
    translations[lang]?.[key] || translations["en"]?.[key] || key;
  // Replace parameters in the translation string
  if (params && typeof params === "object") {
    Object.keys(params).forEach((paramKey) => {
      const placeholder = `{{${paramKey}}}`;
      if (translation.includes(placeholder)) {
        translation = translation.replace(
          new RegExp(placeholder, "g"),
          params[paramKey]
        );
      }
    });
  }
  return translation;
}

/**
 * Alias for translate - shorter function name
 */
export function t(lang = "uz", key, params = {}) {
  return translate(key, lang, params);
}

/**
 * Hook version for React components (optional)
 */
export function useLocalTranslation() {
  // This hook doesn't depend on your LanguageContext
  // You can use it independently
  const translate = (key, lang, params) => t(key, lang, params);

  return { t: translate };
}

// Utility functions
export function getAvailableLanguages() {
  return Object.keys(translations);
}

export function getLanguageName(langCode) {
  const names = {
    uz: "Oʻzbekcha",
    ru: "Русский",
    en: "English",
  };
  return names[langCode] || langCode;
}
