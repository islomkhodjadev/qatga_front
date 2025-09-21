import { motion } from "framer-motion";
import { formatCurrencyUZS, pricingTypeLabel } from "../../utils/format";
import { pickLangField } from "../../utils/i18nField";

const UI_LABELS = {
  services_en: "Services",
  services_uz: "Xizmatlar",
  services_ru: "Услуги",

  active_en: "Active",
  active_uz: "Faol",
  active_ru: "Активный",

  inactive_en: "Inactive",
  inactive_uz: "Nofaol",
  inactive_ru: "Неактивный",
};

export default function PlaceServices({ services, lang }) {
  const t = (key) => pickLangField(UI_LABELS, key, lang, ["uz", "ru", "en"]);

  if (!Array.isArray(services) || services.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-slate-900 mb-3">
        {t("services")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, index) => {
          const sName =
            pickLangField(s, "name", lang, ["uz", "ru", "en"]) || s.name;
          const sDesc =
            pickLangField(s, "description", lang, ["uz", "ru", "en"]) ||
            s.description;
          const sPrice = s.price ? formatCurrencyUZS(s.price) : null;
          const sType = pricingTypeLabel(
            lang,
            s.pricing_type,
            s.pricing_type_display
          );

          return (
            <motion.div
              initial={{ x: index % 2 ? 80 : -80, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              key={s.id}
              className="rounded-2xl ring-1 ring-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-slate-900">{sName}</div>
                  {sDesc ? (
                    <div className="text-sm text-slate-600">{sDesc}</div>
                  ) : null}
                </div>
                {s.is_active ? (
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs">
                    {t("active")}
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-xs">
                    {t("inactive")}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-lg font-semibold text-slate-900">
                  {sPrice || "—"}
                </div>
                <div className="text-sm text-slate-500">{sType}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
