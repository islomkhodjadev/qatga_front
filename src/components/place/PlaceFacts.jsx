import { Clock, MapPin, Phone } from "lucide-react";
import { pickLangField } from "../../utils/i18nField";

const UI_LABELS = {
  hours_en: "Hours",
  hours_uz: "Soatlar",
  hours_ru: "Часы",

  phone_en: "Phone",
  phone_uz: "Telefon",
  phone_ru: "Телефон",

  address_en: "Address",
  address_uz: "Manzil",
  address_ru: "Адрес",
};

function prettyTime(t) {
  if (!t) return "";
  try {
    const [h, m] = t.split(":");
    const date = new Date();
    date.setHours(Number(h), Number(m), 0, 0);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return t;
  }
}

export default function PlaceFacts({ place, lang }) {
  const t = (key) => pickLangField(UI_LABELS, key, lang, ["uz", "ru", "en"]);
  const address =
    pickLangField(place, "address", lang, ["uz", "ru", "en"]) || place.address;

  const hours = (() => {
    const open = prettyTime(place.opening_time);
    const close = prettyTime(place.closing_time);
    if (!open && !close) return "";
    if (place.opening_time === "00:00:00" && place.closing_time === "00:00:00")
      return "24/7";
    if (place.opening_time === "00:00:00" && place.closing_time === "00:01:00")
      return "24/7";
    return `${open} – ${close}`;
  })();

  return (
    <aside className="lg:col-span-1">
      <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-3 text-sm">
          {hours ? (
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-slate-500" />
              <div>
                <div className="font-medium text-slate-900">{t("hours")}</div>
                <div className="text-slate-600">{hours}</div>
              </div>
            </div>
          ) : null}

          {place.phone_number ? (
            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-slate-500" />
              <div>
                <div className="font-medium text-slate-900">{t("phone")}</div>
                <a
                  href={`tel:${place.phone_number}`}
                  className="text-blue-600 hover:underline"
                >
                  {place.phone_number}
                </a>
              </div>
            </div>
          ) : null}

          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
            <div>
              <div className="font-medium text-slate-900">{t("address")}</div>
              <div className="text-slate-600">{address}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
