"use client";

/**
 * Реальная конвертация HEIC/HEIF → PDF / DOCX, целиком в браузере.
 *
 * Файл никуда не загружается: сначала HEIC декодируется в JPEG через
 * heic2any (WASM-порт libheif), затем JPEG встраивается в PDF (jsPDF)
 * или DOCX (docx). Никакого сервера в процессе не участвует.
 *
 * Библиотеки импортируются динамически (await import(...)) внутри функций,
 * а не в начале модуля: heic2any обращается к window/self уже на этапе
 * импорта, а Next.js пререндерит клиентские компоненты и на сервере тоже —
 * статический import сломал бы сборку ("window is not defined").
 */

/** Декодирует HEIC/HEIF-файл в JPEG-Blob. */
async function heicToJpegBlob(file: File): Promise<Blob> {
  const { default: heic2any } = await import("heic2any");
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
  return Array.isArray(result) ? result[0] : result;
}

interface ImageInfo {
  width: number;
  height: number;
  dataUrl: string;
  arrayBuffer: ArrayBuffer;
}

/** Читает размеры изображения и оба представления (dataURL + ArrayBuffer), нужные разным кодерам. */
function readImage(blob: Blob): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error("Не удалось прочитать изображение"));
      img.onload = async () => {
        const arrayBuffer = await blob.arrayBuffer();
        resolve({ width: img.naturalWidth, height: img.naturalHeight, dataUrl, arrayBuffer });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(blob);
  });
}

/** Конвертирует HEIC/HEIF-файл в один PDF-файл (страница = размер фото). */
export async function convertHeicToPdf(file: File): Promise<Blob> {
  const jpegBlob = await heicToJpegBlob(file);
  const { width, height, dataUrl } = await readImage(jpegBlob);

  const { jsPDF } = await import("jspdf");
  const orientation = width >= height ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "px", format: [width, height] });
  pdf.addImage(dataUrl, "JPEG", 0, 0, width, height);
  return pdf.output("blob");
}

/** Конвертирует HEIC/HEIF-файл в DOCX с фото на первой странице. */
export async function convertHeicToDocx(file: File): Promise<Blob> {
  const jpegBlob = await heicToJpegBlob(file);
  const { width, height, arrayBuffer } = await readImage(jpegBlob);

  // Вписываем фото в ширину страницы A4 с полями (~600px при 96dpi), сохраняя пропорции.
  const maxWidth = 600;
  const scale = width > maxWidth ? maxWidth / width : 1;

  const { Document, ImageRun, Packer, Paragraph } = await import("docx");
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                type: "jpg",
                data: arrayBuffer,
                transformation: {
                  width: Math.round(width * scale),
                  height: Math.round(height * scale),
                },
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

/** Запускает скачивание Blob как файла с заданным именем. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
