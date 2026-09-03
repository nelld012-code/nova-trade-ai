import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "es" | "en";

const translations = {
  es: {
    home: "Inicio", howItWorks: "Cómo funciona", aiRobot: "Robot IA", performance: "Rendimientos", plans: "Planes", security: "Seguridad",
    login: "Iniciar sesión", register: "Crear cuenta", startNow: "Empezar ahora", discover: "Descubrir TradeNova AI",
    automatedTrading: "Trading automatizado", aiAnalysis: "Análisis IA", monitoring247: "Monitoreo 24/7", language: "Idioma", spanish: "Español", english: "English",
  },
  en: {
    home: "Home", howItWorks: "How it works", aiRobot: "AI Robot", performance: "Performance", plans: "Plans", security: "Security",
    login: "Sign in", register: "Create account", startNow: "Get started", discover: "Discover TradeNova AI",
    automatedTrading: "Automated trading", aiAnalysis: "AI analysis", monitoring247: "24/7 monitoring", language: "Language", spanish: "Español", english: "English",
  },
} as const;

type TranslationKey = keyof typeof translations.es;
type I18nContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: TranslationKey) => string };
const I18nContext = createContext<I18nContextValue | null>(null);

// Static UI strings used by pages/components that predate the i18n integration.
// Keeping this map here makes the selector work immediately across the whole app,
// including dynamically mounted dashboard cards and route changes.
const uiTranslations: Record<string, string> = {
  "Dashboard": "Dashboard", "Operaciones": "Operations", "Portafolio": "Portfolio", "Fondos": "Funds", "Notificaciones": "Notifications", "Perfil": "Profile", "Preferencias": "Preferences", "Administración": "Administration",
  "Panel de control": "Control panel", "Modo DEMO · datos de demostración": "DEMO mode · demonstration data", "Sistema operativo": "System operational", "Navegación": "Navigation", "Cerrar sesión": "Sign out", "Cuenta activa": "Active account", "Usuario": "User",
  "Robot IA": "AI Robot", "Configuración del Robot IA": "AI Robot Configuration", "Configura la estrategia y los límites de la simulación.": "Configure the strategy and simulation limits.", "Estrategia": "Strategy", "Equilibrada": "Balanced", "Conservadora": "Conservative", "Tendencia": "Trend", "Nivel de riesgo": "Risk level", "Bajo": "Low", "Medio": "Medium", "Alto": "High", "Capital asignado (USD)": "Allocated capital (USD)", "Modo": "Mode", "Mercados": "Markets", "Activar robot": "Activate robot", "Solo se ejecuta como simulación mientras esté en DEMO.": "It only runs as a simulation while in DEMO.", "Guardar configuración": "Save configuration", "Guardando...": "Saving...", "Activar DEMO": "Activate DEMO", "Detener": "Stop", "Configuración guardada.": "Configuration saved.", "Robot activado en modo DEMO.": "Robot activated in DEMO mode.", "Selecciona al menos un mercado.": "Select at least one market.", "El modo LIVE todavía no está disponible. Cambia a DEMO para activar el robot.": "LIVE mode is not available yet. Switch to DEMO to activate the robot.", "El modo LIVE requiere una implementación de ejecución real y controles adicionales. Esta versión no ejecuta operaciones reales y no permite activar el robot en LIVE.": "LIVE mode requires real execution and additional controls. This version does not execute real trades and does not allow the robot to be activated in LIVE.",
  "Operaciones": "Operations", "Historial reciente de actividad del robot.": "Recent robot activity history.", "Aún no hay operaciones": "There are no operations yet", "Cuando el robot genere operaciones, aparecerán aquí con su resultado.": "When the robot generates operations, they will appear here with their results.", "Activo": "Asset", "Dirección": "Direction", "Entrada": "Entry", "Salida": "Exit", "Tamaño": "Size", "Estado": "Status", "Abierta": "Open", "Cerrada": "Closed",
  "Patrimonio actual": "Current equity", "Capital invertido": "Invested capital", "P&L acumulado": "Accumulated P&L", "Rendimiento": "Performance", "Resultado de hoy": "Today's result", "P&L registrado en el portafolio.": "P&L recorded in the portfolio.", "Total depositado": "Total deposited", "Capital ingresado a la cuenta.": "Capital added to the account.", "Vista consolidada de tu capital y resultados.": "Consolidated view of your capital and results.", "Histórico de rendimiento": "Performance history", "El gráfico histórico se habilitará cuando exista una serie temporal de rendimiento en Supabase. No se inventan datos históricos.": "The historical chart will be enabled when a performance time series exists in Supabase. No historical data is invented.",
  "Depositar fondos": "Deposit funds", "Retirar fondos": "Withdraw funds", "Importe (USD)": "Amount (USD)", "Método": "Method", "Destino": "Destination", "Cuenta o wallet de destino": "Destination account or wallet", "Solicitar depósito": "Request deposit", "Solicitar retiro": "Request withdrawal", "Historial de depósitos": "Deposit history", "Historial de retiros": "Withdrawal history", "Cargando…": "Loading…", "Todavía no hay depósitos registrados.": "No deposits have been recorded yet.", "Todavía no hay retiros registrados.": "No withdrawals have been recorded yet.", "Por seguridad, verifica cuidadosamente el destino antes de solicitar un retiro.": "For security, carefully verify the destination before requesting a withdrawal.", "Modo DEMO: estas solicitudes registran movimientos en Supabase, pero no procesan pagos reales ni transfieren fondos automáticamente.": "DEMO mode: these requests record movements in Supabase, but do not process real payments or transfer funds automatically.", "Introduce un importe válido.": "Enter a valid amount.", "Introduce importe y destino válidos.": "Enter a valid amount and destination.", "Solicitud de depósito registrada.": "Deposit request recorded.", "Solicitud de retiro registrada.": "Withdrawal request recorded.",
  "Configuración": "Settings", "Guardar": "Save", "Cancelar": "Cancel", "Editar": "Edit", "Eliminar": "Delete", "Actualizar": "Update", "Volver": "Back", "Cerrar": "Close", "Sí": "Yes", "No": "No", "Nombre completo": "Full name", "Correo electrónico": "Email", "Teléfono": "Phone", "País": "Country", "Dirección": "Address", "Fecha de nacimiento": "Date of birth", "Cambiar contraseña": "Change password", "Contraseña": "Password", "Confirmar contraseña": "Confirm password", "Nueva contraseña": "New password", "Preferencias de idioma": "Language preferences", "Moneda": "Currency", "Tema": "Theme", "Notificaciones por email": "Email notifications", "Notificaciones push": "Push notifications", "Alertas de riesgo": "Risk alerts", "Seguridad": "Security", "Autenticación de dos factores": "Two-factor authentication",
  "Pendiente": "Pending", "pendiente": "pending", "Aprobado": "Approved", "Completado": "Completed", "Rechazado": "Rejected", "Cancelado": "Cancelled", "Error": "Error", "Activo": "Active", "Inactivo": "Inactive",
  "Iniciar sesión": "Sign in", "Crear cuenta": "Create account", "¿Olvidaste tu contraseña?": "Forgot your password?", "Restablecer contraseña": "Reset password", "Enviar enlace": "Send link", "Volver al inicio de sesión": "Back to sign in", "Mostrar contraseña": "Show password", "Ocultar contraseña": "Hide password",
};

function translateNodeText(root: Node, language: Language) {
  if (language !== "en") return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);
  for (const text of nodes) {
    const value = text.nodeValue ?? "";
    const trimmed = value.trim();
    if (!trimmed) continue;
    const translated = uiTranslations[trimmed];
    if (translated && translated !== trimmed) text.nodeValue = value.replace(trimmed, translated);
  }
}

function restoreSpanish(root: Node) {
  const reverse = new Map(Object.entries(uiTranslations).map(([es, en]) => [en, es]));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);
  for (const text of nodes) {
    const value = text.nodeValue ?? "";
    const trimmed = value.trim();
    const spanish = reverse.get(trimmed);
    if (spanish) text.nodeValue = value.replace(trimmed, spanish);
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "es";
    const stored = window.localStorage.getItem("tradenova-language");
    if (stored === "en" || stored === "es") return stored;
    return window.navigator.language.toLowerCase().startsWith("en") ? "en" : "es";
  });
  const setLanguage = (next: Language) => { setLanguageState(next); if (typeof window !== "undefined") window.localStorage.setItem("tradenova-language", next); };

  useEffect(() => {
    document.documentElement.lang = language;
    const apply = () => language === "en" ? translateNodeText(document.body, "en") : restoreSpanish(document.body);
    apply();
    const observer = new MutationObserver(() => apply());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
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
    <button type="button" onClick={() => setLanguage("es")} aria-pressed={language === "es"} className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${language === "es" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>ES</button>
    <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"} className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>EN</button>
  </div>;
}
