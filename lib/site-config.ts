/**
 * Единая точка конфигурации сайта для SEO.
 *
 * Домен задаётся через NEXT_PUBLIC_SITE_URL (см. .env.local / .env.example).
 * Когда появится боевой домен — меняется только это значение (одна
 * переменная окружения), и все canonical/OG/Twitter/JSON-LD/sitemap
 * обновятся автоматически, без правок по всему проекту.
 */

const DEFAULT_SITE_URL = "https://convertcontext.vercel.app";

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export const siteConfig = {
  name: "ConvertContext",
  url: normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL),
  locale: "ru_RU",
  language: "ru",
  description:
    "Конвертируйте изображения и другие файлы в любой формат прямо в браузере. Быстро, бесплатно, без загрузки на сервер.",
} as const;

/** Статические маршруты сайта — единый список для sitemap.ts. */
export const STATIC_ROUTES = [
  "/",
  "/heic",
  "/heic-to",
  "/heic-jpg",
  "/heic-pdf",
  "/heic-doc",
  "/heic-docx",
  "/ebook",
  "/apps",
  "/pricing",
  "/privacy",
  "/support",
  "/history",
  "/favorites",
  "/settings",
  "/api",
] as const;
