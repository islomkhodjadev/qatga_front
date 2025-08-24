import "react";
import { CgProfile } from "react-icons/cg";

import { IoMdArrowRoundBack } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import { pickLangField } from "../..//utils/i18nField";
import { useLang } from "../../utils/language";
import FilterMenu from "../filters/FilterMenu";
import LanguageMenu from "../language/LanguageMenu";
function NavBar() {
  const { lang } = useLang();
  const title = {
    name_uz: "Bugun Qatga?",
    name_ru: "Куда сегодня?",
    name_en: "Where to today?",
  };
  const navigate = useNavigate();
  const canGoBack = window.history.state && window.history.state.idx > 0;
  const location = useLocation();
  return (
    <div className="background-navbar flex justify-between h-[64px] items-center px-[1rem]">
      <div className="flex items-center gap-2">
        {canGoBack && (
          <IoMdArrowRoundBack
            onClick={() => navigate(-1)}
            className="rounded hover:bg-slate-700"
            color="#3B82F6"
            size="2.5rem"
          />
        )}
        <h3>{pickLangField(title, "name", lang, ["ru", "uz"])}</h3>
      </div>
      <div className="flex justify-around items-center gap-[1rem]">
        {/* <HiSun color="#3B82F6" size="2.5rem" /> */}
        <CgProfile
          onClick={() => navigate("/profile")}
          color="#3B82F6"
          size="1.5rem"
          className="cursor-pointer"
        />
        {location.pathname.startsWith("/category") ? <FilterMenu /> : null}
        <LanguageMenu />
      </div>
    </div>
  );
}

export default NavBar;
