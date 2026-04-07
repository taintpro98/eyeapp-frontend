import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "@/locales/en.json";
import vi from "@/locales/vi.json";

export const resources = {
  en: { translation: en },
  vi: { translation: vi },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    /** Default for new visitors; overridden by `localStorage` when user has chosen a language */
    lng: "vi",
    /** Missing keys in `vi` fall back to English */
    fallbackLng: "en",
    supportedLngs: ["en", "vi"],
    interpolation: { escapeValue: false },
    detection: {
      // Do not use browser `navigator` so first visit is Vietnamese, not the OS locale
      order: ["localStorage"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

function applyDocumentLang(lng: string) {
  document.documentElement.lang = lng.startsWith("vi") ? "vi" : "en";
}

applyDocumentLang(i18n.language);
i18n.on("languageChanged", applyDocumentLang);

export default i18n;
