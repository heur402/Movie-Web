// src/i18n/i18n.js
// react-i18next configuration
// Run: npm install i18next react-i18next

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en  from "./en.json";
import kin from "./kin.json";
import fr  from "./fr.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en:  { translation: en.en },
      kin: { translation: kin.kin },
      fr:  { translation: fr.fr },
    },
    lng: localStorage.getItem("language") || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

// Persist language choice whenever it changes
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
});

export default i18n;
