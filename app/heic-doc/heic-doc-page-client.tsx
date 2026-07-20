"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { Converter } from "@/components/converter/converter";
import { Footer } from "@/components/layout/footer";

function HeicDOCConverter() {
  const searchParams = useSearchParams();
  const initialTargetCode = searchParams.get("to")?.toUpperCase() || "DOC";

  return (
    <div className="mx-auto max-w-[900px] px-6 pt-14 pb-24 text-left sm:px-10">
      <Converter
        heading="HEIC → DOC за секунды"
        description="Конвертация происходит прямо в браузере. Файлы никуда не загружаются."
        category="doc"
        sourceFormatOptions={["HEIC", "HEIF"]}
        targetFormatOptions={["DOC"]}
        initialTargetCode={initialTargetCode}
        fixedTarget
        mode="process"
      />
    </div>
  );
}

export function HeicDOCPageClient() {
  return (
    <>
      <Suspense fallback={null}>
        <HeicDOCConverter />
      </Suspense>
      <Footer />
    </>
  );
}
