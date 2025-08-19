// src/LanguageSwitcher.jsx
import { useState } from "react";
import { FaLanguage } from "react-icons/fa";
import { useLang } from "../../utils/language";

const OPTIONS = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "uz", label: "O‘zbekcha" },
];

export default function LanguageMenu() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <FaLanguage
        color="#3B82F6"
        size="2.5rem"
        className="cursor-pointer"
        onClick={() => setOpen(!open)}
      />

      {open && (
        <div className="absolute right-2 mt-2  w-44 rounded-2xl border border-blue-950 bg-white shadow-lg z-50 overflow-hidden">
          {OPTIONS.map((o) => (
            <div
              key={o.code}
              onClick={() => {
                setLang(o.code);
                setOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer ${
                lang === o.code
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-black/5"
              }`}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
