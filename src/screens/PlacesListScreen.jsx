import "aos/dist/aos.css";
import "react";
import { ImLocation2 } from "react-icons/im";

import { locationManager } from "@telegram-apps/sdk";
import { useEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useLocation, useParams } from "react-router-dom";
import filterPlaces from "../api/filterPlaces";
import getPlacesByLocation from "../api/getPlacesByLocation";
import searchPlacesList from "../api/searchPlacesList";
import PlaceCard from "../components/place/PlaceCard";
import { pickLangField } from "../utils/i18nField";
import { useLang } from "../utils/language";
export default function PlacesListScreen({}) {
  const listRef = useRef(null);

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const { categoryId } = useParams();
  const location = useLocation();
  const { categoryObject, filters } = location.state ?? {};
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (locationManager.mount.isAvailable() && !locationManager.isMounted()) {
      locationManager.mount().catch((err) => {
        console.error("Mount error:", err);
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await filterPlaces(
          categoryObject.slug,
          filters === undefined ? null : filters
        );
        setPlaces(res);
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId, filters]);

  const locationButton = async () => {
    setLoading(true);
    try {
      const data = await getPlacesByLocation(categoryObject.slug);
      setPlaces(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  const searchButton = async () => {
    setLoading(true);
    try {
      const data = await searchPlacesList(
        query,
        categoryObject.id /* , categoryId? */
      );
      setPlaces(data);
    } finally {
      setLoading(false);
    }
  };
  const { lang } = useLang();
  const search = {
    search_uz: "Nomi, manzili yoki xizmat bo'yicha qidirish...",
    search_ru: "Поиск по названию, адресу или услуге...",
    search_en: "Search by name, address, or service...",
    srch_btn_txt_uz: "qidirish",
    srch_btn_txt_ru: "искать",
    srch_btn_txt_en: "search",
    choose_place_uz: "Joyni Tanlang",
    choose_place_en: "Choose a place",
    choose_place_ru: "Выберите место",
  };

  return (
    <div className="screen p-3 flex flex-col justify-start gap-4 ">
      <div className="w-full sticky top-0 max-w-sm min-w-[200px] bg-white  ">
        <div className="relative">
          <input
            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
            placeholder={pickLangField(search, "search", lang)}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // stop form submit/reload
                searchButton(); // call your handler
              }
            }}
          />
          <button
            className="absolute top-1 right-1 flex items-center rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="button"
            onClick={searchButton}
          >
            {loading ? (
              "…"
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                {pickLangField(search, "srch_btn_txt", lang)}
              </>
            )}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <img src={categoryObject.icon} className="rounded-2xl" />

        <h3 className="">{pickLangField(categoryObject, "name", lang)}</h3>
        <p>{pickLangField(categoryObject, "description", lang)}</p>
        <hr className="text-4xl" />
        <h3>{pickLangField(search, "choose_place", lang)}</h3>

        {places.length > 0
          ? places.map((place, index) => (
              <PlaceCard
                key={place.id}
                viewport={listRef}
                placeImage={place.images?.find((img) => img.is_primary)?.image}
                placeLocation={pickLangField(place, "address", lang)}
                placeName={pickLangField(place, "name", lang)}
                PlaceTags={place.amenities
                  ?.map((tag) => pickLangField(tag, "name", lang))
                  .filter(Boolean)}
                PlaceId={place.id}
                placeObject={place}
                indx={index}
              />
            ))
          : null}
        {!loading ? (
          <ImLocation2
            className="absolute bottom-6 right-6 bg-[#3B82F6] p-4 rounded-2xl"
            size="3.5rem"
            color="#FFFFFF"
            onClick={locationButton}
          />
        ) : (
          <AiOutlineLoading3Quarters
            className="absolute bottom-6 right-6 bg-[#3B82F6] p-4 rounded-2xl"
            size="3.5rem"
            color="#FFFFFF"
          />
        )}
      </div>
    </div>
  );
}
