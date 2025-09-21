import { pickLangField } from "./i18nField";

const PRICING_TYPE_I18N = {
  per_hour_name_en: "Per hour",
  per_hour_name_uz: "Soatiga",
  per_hour_name_ru: "Почасовая",

  per_person_name_en: "Per person",
  per_person_name_uz: "Har bir odam uchun",
  per_person_name_ru: "За человека",

  per_person_per_hour_name_en: "Per person per hour",
  per_person_per_hour_name_uz: "Har bir odam uchun soatiga",
  per_person_per_hour_name_ru: "За человека в час",

  free_name_en: "Free",
  free_name_uz: "Bepul",
  free_name_ru: "Бесплатно",
};

export function pricingTypeLabel(lang, pricingType, fallbackFromAPI) {
  if (!pricingType) return fallbackFromAPI || "";
  const base = `${pricingType}_name`;
  const label = pickLangField(PRICING_TYPE_I18N, base, lang, [
    "uz",
    "ru",
    "en",
  ]);
  return label || fallbackFromAPI || "";
}

export function formatCurrencyUZS(v) {
  if (v == null || v === "") return "";
  const n = typeof v === "string" ? Number(v) : v;
  if (Number.isNaN(n)) return String(v);
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(n);
}
