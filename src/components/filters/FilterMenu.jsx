// ServiceFilterForm.jsx
import React, { useCallback, useMemo, useState } from "react";
import { CiFilter } from "react-icons/ci";
import { useLocation, useNavigate } from "react-router-dom";
import { pickLangField } from "../../utils/i18nField";
import { useLang } from "../../utils/language";

// --- Backend values (do not change these) ---
export const PRICING_TYPE_CHOICES = [
  ["per_hour", "Soatiga"],
  ["per_person", "Har bir odam uchun"],
  ["per_person_per_hour", "Har bir odam uchun soatiga"],
  ["free", "Bepul"],
];

const Button = {
  clear_en: "Clear",
  clear_uz: "Tozalash",
  clear_ru: "Сброс",

  apply_en: "Apply",
  apply_uz: "Qo'llash",
  apply_ru: "Применить",
};

// --- Translation objects for labels/placeholders (used by pickLangField) ---
const FIELD_I18N = {
  // Labels
  service_name_label_en: "Service name",
  service_name_label_uz: "Xizmat nomi",
  service_name_label_ru: "Название услуги",

  service_min_price_label_en: "Min price",
  service_min_price_label_uz: "Minimal narx",
  service_min_price_label_ru: "Мин. цена",

  service_max_price_label_en: "Max price",
  service_max_price_label_uz: "Maksimal narx",
  service_max_price_label_ru: "Макс. цена",

  service_pricing_type_label_en: "Pricing type",
  service_pricing_type_label_uz: "Narxlash turi",
  service_pricing_type_label_ru: "Тип оплаты",

  // Placeholders
  service_name_ph_en: "e.g. Haircut",
  service_name_ph_uz: "masalan, Soch olish",
  service_name_ph_ru: "например, Стрижка",

  service_min_price_ph_en: "Enter min",
  service_min_price_ph_uz: "Minimal qiymat",
  service_min_price_ph_ru: "Введите мин.",

  service_max_price_ph_en: "Enter max",
  service_max_price_ph_uz: "Maksimal qiymat",
  service_max_price_ph_ru: "Введите макс.",

  service_pricing_type_ph_en: "Select pricing type",
  service_pricing_type_ph_uz: "Narxlash turini tanlang",
  service_pricing_type_ph_ru: "Выберите тип оплаты",
};

// Pricing type labels per language (mapped from backend value)
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

// Memoized InputRow component to prevent unnecessary re-renders
const InputRow = React.memo(
  ({
    id,
    type = "text",
    labelKey,
    placeholderKey,
    value,
    onChange,
    rightAdornment,
    lang,
  }) => (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {pickLangField(FIELD_I18N, labelKey, lang)}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={pickLangField(FIELD_I18N, placeholderKey, lang)}
          className="
          h-11 w-full rounded-xl
          bg-white/70 dark:bg-slate-800/70
          text-slate-900 dark:text-slate-100
          placeholder-slate-400
          ring-1 ring-slate-300 dark:ring-slate-700
          focus:ring-2 focus:ring-blue-500 focus:outline-none
          pl-3 pr-12
          shadow-sm
          transition
          appearance-none
          [-moz-appearance:textfield]
          [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:appearance-none
        "
        />
        {rightAdornment ? (
          <span className="absolute inset-y-0 right-3 flex items-center text-sm text-slate-500 dark:text-slate-400">
            {rightAdornment}
          </span>
        ) : null}
      </div>
    </div>
  )
);

InputRow.displayName = "InputRow";

export default function FilterMenu({}) {
  const { lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [pricingType, setPricingType] = useState("");

  const { categoryObject } = location.state || {};

  // Memoize the pricing options with a more stable dependency
  const pricingOptions = useMemo(() => {
    return PRICING_TYPE_CHOICES.map(([value]) => ({
      value,
      label: pickLangField(PRICING_TYPE_I18N, `${value}_name`, lang, [
        "uz",
        "ru",
        "en",
      ]),
    }));
  }, [lang]); // Make sure lang is properly memoized in useLang hook

  // Memoize event handlers to prevent child re-renders
  const handleServiceNameChange = useCallback((e) => {
    setServiceName(e.target.value);
  }, []);

  const handleMinPriceChange = useCallback((e) => {
    setMinPrice(e.target.value);
  }, []);

  const handleMaxPriceChange = useCallback((e) => {
    setMaxPrice(e.target.value);
  }, []);

  const handlePricingTypeChange = useCallback((e) => {
    setPricingType(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const payload = {
        service_min_price:
          minPrice === "" || minPrice === null ? null : Number(minPrice),
        service_max_price:
          maxPrice === "" || maxPrice === null ? null : Number(maxPrice),
        service_pricing_type: pricingType || null, // backend key
      };

      navigate(location.pathname, {
        state: { ...location.state, filters: payload },
        replace: true,
      });

      setOpen(false);
    },
    [minPrice, maxPrice, pricingType, navigate, location]
  );

  const clearAll = useCallback(() => {
    setServiceName("");
    setMinPrice("");
    setMaxPrice("");
    setPricingType("");
    // Remove the onSubmit call as it's not defined in props
  }, []);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return (
    <div>
      <CiFilter
        color="#3B82F6"
        size="1.8rem"
        className="cursor-pointer"
        onClick={toggleOpen}
      />
      <form
        onSubmit={handleSubmit}
        className={`absolute ${
          !open ? "hidden" : null
        } left-0  z-50 h-full background-navbar mx-auto max-w-2xl w-full p-5 space-y-4`}
      >
        {/* Min & Max price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputRow
            id="service_min_price"
            type="number"
            labelKey="service_min_price_label"
            placeholderKey="service_min_price_ph"
            value={minPrice}
            onChange={handleMinPriceChange}
            rightAdornment="UZS"
            lang={lang}
          />
          <InputRow
            id="service_max_price"
            type="number"
            labelKey="service_max_price_label"
            placeholderKey="service_max_price_ph"
            value={maxPrice}
            onChange={handleMaxPriceChange}
            rightAdornment="UZS"
            lang={lang}
          />
        </div>

        {/* Pricing type */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {pickLangField(FIELD_I18N, "service_pricing_type_label", lang)}
          </label>
          <select
            value={pricingType}
            onChange={handlePricingTypeChange}
            className="
            h-11 w-full rounded-xl
            bg-white/70 dark:bg-slate-800/70
            text-slate-900 dark:text-slate-100
            ring-1 ring-slate-300 dark:ring-slate-700
            focus:ring-2 focus:ring-blue-500 focus:outline-none
            px-3 shadow-sm transition
          "
          >
            <option value="">
              {pickLangField(FIELD_I18N, "service_pricing_type_ph", lang)}
            </option>
            {pricingOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={clearAll}
            className="px-3 h-10 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {pickLangField(Button, "clear", lang)}
          </button>
          <button
            type="submit"
            className="px-4 h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            {pickLangField(Button, "apply", lang)}
          </button>
        </div>
      </form>
    </div>
  );
}
