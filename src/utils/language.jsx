// language.js
import {
  parseInitDataQuery,
  retrieveRawInitData,
} from "@telegram-apps/sdk-react";
import { createContext, useContext, useEffect, useState } from "react";
import { getLanguage, postLanguage } from "../api/LanguageProvider";
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    async function languageGet() {
      stored = await getLanguage();
      if (stored && stored !== lang) setLang(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    async function setLanguageOnServer() {
      const result = await postLanguage(
        parseInitDataQuery(retrieveRawInitData()).user.id,
        lang
      );
    }
    setLanguageOnServer();
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
