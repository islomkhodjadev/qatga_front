import { useState } from "react";

const UI_LABELS = {
  no_image_en: "No image",
  no_image_uz: "Rasm yo'q",
  no_image_ru: "Нет изображения",
};

export default function PlaceGallery({ images, name, lang }) {
  const t = (key) => UI_LABELS[`${key}_${lang}`] || UI_LABELS[`${key}_en`];

  const primaryImage = images?.find((im) => im.is_primary) || images?.[0];
  const [activeImage, setActiveImage] = useState(primaryImage || null);
  const gallery = images || [];

  return (
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
              className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl ring-1 transition ${
                activeImage?.id === img.id
                  ? "ring-blue-500"
                  : "ring-slate-200 hover:ring-slate-300"
              }`}
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
  );
}
