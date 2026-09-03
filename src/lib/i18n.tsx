import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "es" | "en";

const translations = {
  es: {
    home: "Inicio", howItWorks: "Cómo funciona", aiRobot: "Robot IA", performance: "Rendimientos", plans: "Planes", security: "Seguridad", login: "Iniciar sesión", register: "Crear cuenta", startNow: "Empezar ahora", discover: "Descubrir TradeNova AI", automatedTrading: "Trading automatizado", aiAnalysis: "Análisis IA", monitoring247: "Monitoreo 24/7", language: "Idioma", spanish: "Español", english: "English",
  },
  en: {
    home: "Home", howItWorks: "How it works", aiRobot: "AI Robot", performance: "Performance", plans: "Plans", security: "Security", login: "Sign in", register: "Create account", startNow: "Get started", discover: "Discover TradeNova AI", automatedTrading: "Automated trading", aiAnalysis: "AI analysis", monitoring247: "24/7 monitoring", language: "Language", spanish: "Español", english: "English",
  },
} as const;

type TranslationKey = keyof typeof translations.es;
type I18nContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: TranslationKey) => string };
const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "es";
    const stored = window.localStorage.getItem("tradenova-language");
    if (stored === "en" || stored === "es") return stored;
    return window.navigator.language.toLowerCase().startsWith("en") ? "en" : "es";
  });

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    if (typeof window !== "undefined") window.localStorage.setItem("tradenova-language", next);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(() => ({ language, setLanguage, t: (key) => translations[language][key] }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLanguage() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  return <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1" aria-label={t("language")}>
    <button type="button" onClick={() => setLanguage("es")} aria-pressed={language === "es"} className={`rounded-md px-2 py-1 text-xs font-semibold ${language === "es" ? "bg-slate-900 text-white" : "text-muted-foreground"}`}>ES</button>
    <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"} className={`rounded-md px-2 py-1 text-xs font-semibold ${language === "en" ? "bg-slate-900 text-white" : "text-muted-foreground"}`}>EN</button>
  </div>;
}
