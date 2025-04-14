import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Traducciones importadas
import en from "./Idiomas/en.json";
import es from "./Idiomas/es.json";
import ja from "./Idiomas/ja.json";
import pt from "./Idiomas/pt.json";

// Recursos de idioma
const resources = {
  en: { translation: en },
  es: { translation: es },
  ja: { translation: ja },
  pt: { translation: pt },
};

// Función para obtener el idioma almacenado o el del dispositivo
const getStoredLanguage = async () => {
  try {
    const storedLang = await AsyncStorage.getItem("userLanguage");
    if (storedLang && resources[storedLang]) {
      return storedLang;
    }

    const deviceLang = Localization.locale.split("-")[0]; // Ej. "es", "ja"
    return resources[deviceLang] ? deviceLang : "en";
  } catch (error) {
    console.warn("Error detectando idioma:", error);
    return "en";
  }
};

// Inicializar i18n (aún sin definir el idioma)
i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    compatibilityJSON: "v3",
    debug: false, // siempre en false por si __DEV__ se comporta distinto
    interpolation: {
      escapeValue: false,
    },
  });

// Detectar y aplicar el idioma en segundo plano
getStoredLanguage().then((lang) => {
  i18n.changeLanguage(lang);
});

// Función pública para cambiar idioma desde la app
export const changeLanguage = async (lang) => {
  if (resources[lang]) {
    await AsyncStorage.setItem("userLanguage", lang);
    i18n.changeLanguage(lang);
  }
};

export default i18n;
