import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata, buildWebApplicationJsonLd } from "@/lib/seo";
import { HeicDOCPageClient } from "./heic-doc-page-client";

const TITLE = "HEIC в DOC онлайн — ConvertContext";
const DESCRIPTION =
  "Конвертируйте HEIC-фото с iPhone в DOC-документ прямо в браузере. Быстро и без загрузки на сервер.";
const PATH = "/heic-doc";

export const metadata = buildMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });
const jsonLd = buildWebApplicationJsonLd({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function HeicDOCPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <HeicDOCPageClient />
    </>
  );
}
