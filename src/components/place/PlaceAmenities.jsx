import { pickLangField } from "../../utils/i18nField";

const UI_LABELS = {
  amenities_en: "Amenities",
  amenities_uz: "Qulayliklar",
  amenities_ru: "Удобства",
};

export default function PlaceAmenities({ amenities, lang }) {
  const t = (key) => pickLangField(UI_LABELS, key, lang, ["uz", "ru", "en"]);

  if (!Array.isArray(amenities) || amenities.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-slate-900 mb-3">
        {t("amenities")}
      </h2>
      <div className="flex flex-wrap gap-2">
        {amenities.map((a) => {
          const aName =
            pickLangField(a, "name", lang, ["uz", "ru", "en"]) || a.name;
          return (
            <span
              key={a.id}
              className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 ring-1 ring-slate-200"
            >
              {aName}
            </span>
          );
        })}
      </div>
    </section>
  );
}
