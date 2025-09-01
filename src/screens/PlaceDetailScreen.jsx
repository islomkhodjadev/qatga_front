import { motion } from "framer-motion";
import {
  Clock,
  ExternalLink,
  Instagram,
  MapPin,
  Phone,
  Verified,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import getStories from "../api/getStories";
import RecordStoryScreen from "../components/story/PopUpStoryRecord";
import StoryModal from "../components/story/PopUpStoryScreen";
import { pickLangField } from "../utils/i18nField";
import { useLang } from "../utils/language";

// Translation dictionary for UI labels
const UI_LABELS = {
  verified_en: "Verified",
  verified_uz: "Tasdiqlangan",
  verified_ru: "Проверено",

  no_image_en: "No image",
  no_image_uz: "Rasm yo'q",
  no_image_ru: "Нет изображения",

  hours_en: "Hours",
  hours_uz: "Soatlar",
  hours_ru: "Часы",

  phone_en: "Phone",
  phone_uz: "Telefon",
  phone_ru: "Телефон",

  address_en: "Address",
  address_uz: "Manzil",
  address_ru: "Адрес",

  services_en: "Services",
  services_uz: "Xizmatlar",
  services_ru: "Услуги",

  amenities_en: "Amenities",
  amenities_uz: "Qulayliklar",
  amenities_ru: "Удобства",

  active_en: "Active",
  active_uz: "Faol",
  active_ru: "Активный",

  inactive_en: "Inactive",
  inactive_uz: "Nofaol",
  inactive_ru: "Неактивный",
};

// Pricing type labels
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

function pricingTypeLabel(lang, pricingType, fallbackFromAPI) {
  if (!pricingType) return fallbackFromAPI || "";
  const base = `${pricingType}_name`;
  const label = pickLangField(PRICING_TYPE_I18N, base, lang, [
    "uz",
    "ru",
    "en",
  ]);
  return label || fallbackFromAPI || "";
}

function formatCurrencyUZS(v) {
  if (v == null || v === "") return "";
  const n = typeof v === "string" ? Number(v) : v;
  if (Number.isNaN(n)) return String(v);
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(n);
}

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

function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

export default function PlaceScreen() {
  const { lang } = useLang();
  const location = useLocation();
  const { placeObject: place } = location.state || {};
  const [groupedStories, setGroupedStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [openRecorder, setOpenRecorder] = useState(false);
  const [watchedClients, setWatchedClients] = useState([]);

  useEffect(() => {
    async function fetchStories() {
      const data = await getStories(`place=${place.id}`);

      // group stories by bot_client.id
      const grouped = data.reduce((acc, story) => {
        const clientId = story.bot_client.id;
        if (!acc[clientId]) {
          acc[clientId] = {
            bot_client: story.bot_client,
            stories: [],
          };
        }
        acc[clientId].stories.push(story);
        return acc;
      }, {});

      setGroupedStories(Object.values(grouped));
    }

    fetchStories();
  }, []);

  if (!place) {
    return (
      <div className="p-4 text-center text-slate-600">
        <p>
          No place data passed. Provide a <code>placeObject</code> in
          location.state.
        </p>
      </div>
    );
  }

  const t = (key) => pickLangField(UI_LABELS, key, lang, ["uz", "ru", "en"]);

  const name =
    pickLangField(place, "name", lang, ["uz", "ru", "en"]) || place.name;
  const description =
    pickLangField(place, "description", lang, ["uz", "ru", "en"]) ||
    place.description;
  const address =
    pickLangField(place, "address", lang, ["uz", "ru", "en"]) || place.address;

  const primaryImage =
    place.images?.find((im) => im.is_primary) || place.images?.[0];
  const [activeImage, setActiveImage] = useState(primaryImage || null);
  const gallery = useMemo(() => place.images || [], [place.images]);

  const hours = useMemo(() => {
    const open = prettyTime(place.opening_time);
    const close = prettyTime(place.closing_time);
    if (!open && !close) return "";
    if (place.opening_time === "00:00:00" && place.closing_time === "00:00:00")
      return "24/7";
    if (place.opening_time === "00:00:00" && place.closing_time === "00:01:00")
      return "24/7";
    return `${open} – ${close}`;
  }, [place.opening_time, place.closing_time]);

  return (
    <div className="screen max-w-6xl p-4 sm:p-6 ">
      {activeStory && (
        <StoryModal
          stories={activeStory.stories}
          bot_client={activeStory.bot_client}
          onClose={() => setActiveStory(null)}
          onAllFinished={(clientId) =>
            setWatchedClients((prev) => [...prev, clientId])
          }
        />
      )}

      {/* Header */}
      <div className="flex col gap-2  overflow-y-scroll">
        <div
          className="w-[70px] h-[70px] flex items-center justify-center cursor-pointer"
          onClick={() => setOpenRecorder(true)} // ✅ open modal
        >
          <div className="inset-0 rounded-full p-[3px] bg-gradient-to-tr from-green-500 via-blue-500 to-green-500">
            <div className="w-[60px] h-[60px] rounded-full flex justify-center items-center text-6xl">
              +
            </div>
          </div>
        </div>

        {/* Modal (fullscreen recorder) */}
        {openRecorder && (
          <RecordStoryScreen
            onClose={() => setOpenRecorder(false)}
            placeId={place.id}
          />
        )}
        {groupedStories.length > 0
          ? groupedStories.map((group) => {
              const isWatched = watchedClients.includes(group.bot_client.id);
              return (
                <div
                  key={group.bot_client.id}
                  className="relative w-[65px] h-[65px] flex items-center justify-center"
                  onClick={() => setActiveStory(group)}
                >
                  {/* Animated border */}
                  <div
                    className={`absolute inset-0 rounded-full 
          ${
            isWatched
              ? "bg-gray-400"
              : "bg-gradient-to-tr from-green-500 via-blue-500 to-green-500 animate-spin [animation-duration:3s]"
          }`}
                  >
                    <div className="w-full h-full rounded-full bg-transparent"></div>
                  </div>

                  {/* Profile picture */}
                  <div
                    style={{
                      backgroundImage: `url(${group.bot_client.profile_picture})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    className="w-[60px] h-[60px] rounded-full z-5"
                  ></div>
                </div>
              );
            })
          : null}
      </div>
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

      {/* Media + Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gallery */}
        <section className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-slate-50">
            {activeImage ? (
              <img
                src={activeImage.image}
                alt={name}
                className="h-[320px] sm:h-[420px] w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-[320px] sm:h-[420px] w-full grid place-items-center text-slate-400">
                {t("no_image")}
              </div>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img)}
                  className={classNames(
                    "relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl ring-1 transition",
                    activeImage?.id === img.id
                      ? "ring-blue-500"
                      : "ring-slate-200 hover:ring-slate-300"
                  )}
                >
                  <img
                    src={img.image}
                    alt="thumb"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Facts card */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-3 text-sm">
              {hours ? (
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 text-slate-500" />
                  <div>
                    <div className="font-medium text-slate-900">
                      {t("hours")}
                    </div>
                    <div className="text-slate-600">{hours}</div>
                  </div>
                </div>
              ) : null}

              {place.phone_number ? (
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 text-slate-500" />
                  <div>
                    <div className="font-medium text-slate-900">
                      {t("phone")}
                    </div>
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
                  <div className="font-medium text-slate-900">
                    {t("address")}
                  </div>
                  <div className="text-slate-600">{address}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Services */}
      {Array.isArray(place.services) && place.services.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            {t("services")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {place.services.map((s, index) => {
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
      )}

      {/* Amenities */}
      {Array.isArray(place.amenities) && place.amenities.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            {t("amenities")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {place.amenities.map((a) => {
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
      )}
    </div>
  );
}
