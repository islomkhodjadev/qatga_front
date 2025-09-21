import { motion } from "framer-motion";
import { ExternalLink, Instagram, MapPin, Verified } from "lucide-react";
import { pickLangField } from "../../utils/i18nField";

const UI_LABELS = {
  verified_en: "Verified",
  verified_uz: "Tasdiqlangan",
  verified_ru: "Проверено",
};

export default function PlaceHeader({ place, lang, onAddStory }) {
  const t = (key) => pickLangField(UI_LABELS, key, lang, ["uz", "ru", "en"]);

  const name =
    pickLangField(place, "name", lang, ["uz", "ru", "en"]) || place.name;
  const description =
    pickLangField(place, "description", lang, ["uz", "ru", "en"]) ||
    place.description;
  const address =
    pickLangField(place, "address", lang, ["uz", "ru", "en"]) || place.address;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 flex items-center gap-2">
          {name}
          {place.is_verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs">
              <Verified size={14} /> {t("verified")}
            </span>
          )}
        </h1>
        {description ? (
          <p className="mt-1 text-slate-600 max-w-3xl">{description}</p>
        ) : null}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap items-center gap-2">
        {place.instagram ? (
          <a
            href={place.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            <Instagram className="h-4 w-4" /> Instagram{" "}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
        {place.address_url ? (
          <a
            href={place.address_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700"
          >
            <MapPin className="h-4 w-4" /> {address}
          </a>
        ) : (
          <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
            <MapPin className="h-4 w-4" /> {address}
          </div>
        )}
      </div>
    </motion.div>
  );
}
