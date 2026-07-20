import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata, buildWebApplicationJsonLd } from "@/lib/seo";
import { HeicDOCXPageClient } from "./heic-docx-page-client";

const TITLE = "HEIC в DOCX онлайн — ConvertContext";
const DESCRIPTION =
  "Конвертируйте HEIC-фото с iPhone в DOCX-документ прямо в браузере. Быстро и без загрузки на сервер.";
const PATH = "/heic-docx";

export const metadata = buildMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });
const jsonLd = buildWebApplicationJsonLd({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function HeicDOCXPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <HeicDOCXPageClient />
    </>
  );
}
