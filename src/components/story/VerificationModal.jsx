import { useNavigate } from "react-router-dom";

const translations = {
  en: {
    title: "Verification Required",
    verifyMessage: "To access stories, first verify in your profile.",
    button: "Go to Profile",
  },
  ru: {
    title: "Требуется подтверждение",
    verifyMessage:
      "Чтобы получить доступ к историям, сначала подтвердите профиль.",
    button: "Перейти в профиль",
  },
  uz: {
    title: "Tasdiqlash talab qilinadi",
    verifyMessage: "Hikoyalarga kirish uchun avval profilingizni tasdiqlang.",
    button: "Profilga o‘tish",
  },
};

export default function VerificationModal({ lang, onClose }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {translations[lang]?.title || translations.en.title}
        </h2>

        <p className="text-gray-700 mb-6">
          {translations[lang]?.verifyMessage || translations.en.verifyMessage}
        </p>

        <button
          onClick={() => navigate("/profile")}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          {translations[lang]?.button || translations.en.button}
        </button>
      </div>
    </div>
  );
}
