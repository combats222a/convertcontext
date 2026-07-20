"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { Converter } from "@/components/converter/converter";
import { Footer } from "@/components/layout/footer";

function HeicDOCXConverter() {
  const searchParams = useSearchParams();
  const initialTargetCode = searchParams.get("to")?.toUpperCase() || "DOCX";

  return (
    <div className="mx-auto max-w-[900px] px-6 pt-14 pb-24 text-left sm:px-10">
      <Converter
        heading="HEIC → DOCX за секунды"
        description="Конвертация происходит прямо в браузере. Файлы никуда не загружаются."
        category="doc"
        sourceFormatOptions={["HEIC", "HEIF"]}
        targetFormatOptions={["DOCX"]}
        initialTargetCode={initialTargetCode}
        fixedTarget
        mode="process"
      />
    </div>
  );
}

export function HeicDOCXPageClient() {
  return (
    <>
      <Suspense fallback={null}>
        <HeicDOCXConverter />
      </Suspense>
      <Footer />
    </>
  );
}
