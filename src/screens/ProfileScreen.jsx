import { requestContact } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import getUserModel from "../api/getUserModel";
import verifyUser from "../api/verifyUser";
import { useLang } from "../utils/language";

// Translation map for labels
const PROFILE_I18N = {
  first_name: { en: "First name", ru: "Имя", uz: "Ism" },
  last_name: { en: "Last name", ru: "Фамилия", uz: "Familiya" },
  username: {
    en: "Username",
    ru: "Имя пользователя",
    uz: "Foydalanuvchi nomi",
  },
  chat_id: { en: "Chat ID", ru: "Чат ID", uz: "Chat ID" },
  language: { en: "Language", ru: "Язык", uz: "Til" },
  created_at: { en: "Joined", ru: "Дата регистрации", uz: "Qo‘shilgan vaqt" },
  last_active: {
    en: "Last active",
    ru: "Последняя активность",
    uz: "Oxirgi faollik",
  },
  verify: {
    en: "Verify Account",
    ru: "Подтвердить аккаунт",
    uz: "Hisobni tasdiqlash",
  },
  verified: { en: "Verified", ru: "Подтверждено", uz: "Tasdiqlangan" },
};

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const { lang } = useLang();
  const [verified, setVerified] = useState(false);

  async function verifyUserOnClick() {
    const result = await requestContact();
    if (result?.contact?.phone_number) {
      const verify = await verifyUser(result.contact.phone_number);
      setVerified(verify);
    }
  }

  useEffect(() => {
    async function getUser() {
      const data = await getUserModel();
      setUser(data);
    }
    getUser();
  }, [verified]);

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-slate-500">
        <div className="animate-pulse text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="screen max-w-md mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center space-y-6">
        {/* Avatar */}
        <div className="relative">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-100 shadow"
            />
          ) : (
            <div className="w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-300 text-white text-3xl font-bold shadow">
              {user.first_name?.charAt(0)}
              {user.last_name?.charAt(0)}
            </div>
          )}
        </div>

        {/* Name + Username */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-800">
            {user.first_name} {user.last_name || ""}
          </h2>
          <p className="text-slate-500">@{user.username || "no_username"}</p>
        </div>

        {/* Verify */}
        {!user.is_verified ? (
          <button
            onClick={verifyUserOnClick}
            className=" animate-pulse mt-4 w-full px-6 py-3 bg-gradient-to-r bg-[#3B82F6] text-white rounded-xl shadow hover:opacity-90 transition"
          >
            {PROFILE_I18N.verify[lang]}
          </button>
        ) : (
          <span className="mt-4 px-5 py-2 bg-green-100 text-green-700 rounded-full shadow-sm text-sm">
            ✅ {PROFILE_I18N.verified[lang]}
          </span>
        )}
      </div>
    </div>
  );
}
