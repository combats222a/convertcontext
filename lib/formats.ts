export interface FormatItem {
  code: string;
  enabled: boolean;
}

export type FormatCategory = "image" | "doc" | "ebook" | "vector";

export const CATEGORY_LABELS: Record<FormatCategory, string> = {
  image: "Изображение",
  doc: "Документ",
  ebook: "Электронная книга",
  vector: "Вектор",
};

const IMAGE_FORMATS: FormatItem[] = [
  { code: "JPG", enabled: true },
  { code: "PNG", enabled: true },
  { code: "JPEG", enabled: true },
  { code: "WEBP", enabled: true },
  { code: "TIFF", enabled: true },
  { code: "GIF", enabled: true },
  { code: "BMP", enabled: true },
  { code: "PSD", enabled: true },
  { code: "HDR", enabled: true },
  { code: "JPE", enabled: true },
  { code: "ICO", enabled: true },
  { code: "JFIF", enabled: true },
  { code: "RGB", enabled: true },
  { code: "JPS", enabled: true },
  { code: "CUR", enabled: true },
  { code: "JIF", enabled: true },
  { code: "WBMP", enabled: true },
  { code: "PPM", enabled: true },
  { code: "PGM", enabled: true },
  { code: "TGA", enabled: true },
  { code: "PBM", enabled: true },
  { code: "MTV", enabled: true },
  { code: "PAM", enabled: true },
  { code: "PFM", enabled: true },
  { code: "PICON", enabled: true },
  { code: "PNM", enabled: true },
  { code: "RAS", enabled: true },
  { code: "RGBA", enabled: true },
  { code: "SGI", enabled: true },
  { code: "SUN", enabled: true },
  { code: "XBM", enabled: true },
  { code: "XPM", enabled: true },
  { code: "JFI", enabled: true },
];

function toFormats(codes: string[]): FormatItem[] {
  return codes.map((code) => ({ code, enabled: false }));
}

export const FORMATS: Record<FormatCategory, FormatItem[]> = {
  image: IMAGE_FORMATS,
  doc: [
    { code: "PDF", enabled: true },
    { code: "DOC", enabled: false },
    { code: "DOCX", enabled: true },
  ],
  ebook: [
    { code: "EPUB", enabled: true },
    { code: "FB2", enabled: true },
    { code: "TXT", enabled: true },
    { code: "PDB", enabled: true },
  ],
  // SVG/EPS/PS/AI реально конвертируются на /heic (см. рассуждение и
  // энкодеры там) — здесь просто даём их выбрать, а handleFiles() ниже
  // редиректит HEIC-файл на /heic?to=<код>.
  vector: [
    { code: "SVG", enabled: true },
    { code: "EPS", enabled: true },
    { code: "PS", enabled: true },
    { code: "AI", enabled: true },
  ],
};

export interface PopularFormat {
  code: string;
  label: string;
  sub: string;
  color: string;
}

export const POPULAR_FORMATS: PopularFormat[] = [
  { code: "JPG", label: "JPG", sub: "Изображение", color: "#3ecf8e" },
  { code: "PNG", label: "PNG", sub: "Изображение", color: "var(--primary)" },
  { code: "WEBP", label: "WEBP", sub: "Изображение", color: "#a86bff" },
  { code: "AVIF", label: "AVIF", sub: "Изображение", color: "#f0554d" },
  { code: "PDF", label: "PDF", sub: "Документ", color: "#e0554d" },
  { code: "TIFF", label: "TIFF", sub: "Изображение", color: "#e0a83a" },
];
