export const SUPPORTED_LOCALES = ["en", "zh-CN", "zh-HK"];

export function resolveLocale(browserLocale, storedLocale) {
  if (SUPPORTED_LOCALES.includes(storedLocale)) return storedLocale;
  if (SUPPORTED_LOCALES.includes(browserLocale)) return browserLocale;
  if (typeof browserLocale === "string" && browserLocale.toLowerCase().startsWith("zh")) {
    return browserLocale.toLowerCase().includes("hant") ||
      browserLocale.toLowerCase().includes("hk") ||
      browserLocale.toLowerCase().includes("tw")
      ? "zh-HK"
      : "zh-CN";
  }
  return "en";
}
