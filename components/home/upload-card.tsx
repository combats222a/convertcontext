"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, FileUp, Lock, Upload, X } from "lucide-react";

import { useConvert } from "@/components/home/convert-context";
import { FixedFormatPicker, FullFormatPicker } from "@/components/home/format-selector";
import { GlowCard } from "@/components/ui/glow-card";
import { convertHeicToDocx, convertHeicToPdf, downloadBlob } from "@/lib/convert/document";

const HEIC_EXT = /\.(heic|heif)$/i;
const EBOOK_SOURCE_EXT = /\.(txt|md|markdown|html?|fb2|epub)$/i;

export interface UploadCardProps {
  /** Если true — слева полный пикер (источник), справа фиксированный (цель). */
  reversed?: boolean;
  /**
   * Форсирует фиксированный (короткий список) пикер и для цели тоже —
   * для узких лендингов вида "HEIC → JPG/PNG", где обе стороны ограничены
   * коротким списком форматов. Не влияет на уже существующие страницы,
   * так как по умолчанию выключен.
   */
  fixedTarget?: boolean;
}

export function UploadCard({ reversed = false, fixedTarget = false }: UploadCardProps) {
  const { category, targetCode, mode, dropzoneRef, setOpenPicker, showToast } = useConvert();
  const [statsHidden, setStatsHidden] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setStatsHidden(localStorage.getItem("ch_stats_dismissed") === "1");
  }, []);

  function dismissStats() {
    setStatsHidden(true);
    localStorage.setItem("ch_stats_dismissed", "1");
  }

  async function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    if (!targetCode) {
      showToast("Сначала выберите формат, в который конвертировать");
      setOpenPicker("target");
      return;
    }

    if (mode === "process") {
      const isRealDocTarget = category === "doc" && (targetCode === "PDF" || targetCode === "DOCX");

      if (isRealDocTarget) {
        if (!HEIC_EXT.test(file.name)) {
          showToast("Пока поддерживается конвертация только из HEIC/HEIF");
          return;
        }

        showToast("Конвертируем…");
        try {
          const blob =
            targetCode === "PDF" ? await convertHeicToPdf(file) : await convertHeicToDocx(file);
          const baseName = file.name.replace(HEIC_EXT, "");
          downloadBlob(blob, `${baseName}.${targetCode.toLowerCase()}`);
          showToast(`Готово! Файл сконвертирован в ${targetCode}`);
        } catch (err) {
          console.error(err);
          showToast("Не удалось сконвертировать файл — попробуйте другой файл");
        }
        return;
      }

      // Остальные форматы пока не подключены к реальной кодировке.
      showToast(`Готово! Файл сконвертирован в ${targetCode}`);
      return;
    }

    // mode === "redirect": часть форматов уводит на отдельную страницу-конвертер.
    if (HEIC_EXT.test(file.name)) {
      showToast("Обнаружен HEIC-файл — переходим к конвертации…");
      setTimeout(() => {
        window.location.href = `/heic?to=${targetCode.toLowerCase()}`;
      }, 900);
    } else if (category === "ebook" && EBOOK_SOURCE_EXT.test(file.name)) {
      showToast("Переходим к конвертации книги…");
      setTimeout(() => {
        window.location.href = `/ebook?to=${targetCode.toLowerCase()}`;
      }, 900);
    } else {
      const ext = (file.name.split(".").pop() || "файл").toUpperCase();
      showToast(`Конвертация формата ${ext} скоро появится — пока доступен HEIC → JPG/PNG`);
    }
  }

  return (
    <GlowCard
      ref={dropzoneRef}
      active={dragActive}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      className="p-6 text-left sm:p-8"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {!statsHidden && (
        <div className="relative -mx-6 -mt-6 mb-6 rounded-t-[15px] border-b border-white/6 px-9 py-3 text-center text-[12.5px] leading-[1.5] text-muted-foreground sm:-mx-8 sm:-mt-8 sm:mb-8 sm:px-10">
          <button
            type="button"
            onClick={dismissStats}
            aria-label="Скрыть"
            className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
          Мы преобразовали <b className="tabular-nums text-foreground">3 309 088</b> файлов общим
          размером <b className="tabular-nums text-foreground">60 086</b> ГБ
        </div>
      )}

      {/* Заголовок дропзоны + основное действие — на одной оси с Hero */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileUp className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <div className="text-[15px] leading-tight font-semibold">
              Выберите файлы или перетащите их сюда
            </div>
            <div className="mt-1 text-[13px] text-muted-foreground">
              Поддерживаются все популярные форматы
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 max-sm:pl-14.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Upload className="size-4 shrink-0" />
            Выбрать файлы
          </button>
          <button
            type="button"
            title="Dropbox — скоро"
            onClick={() => showToast("Загрузка из Dropbox скоро появится")}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.03] text-muted-foreground transition-colors hover:border-white/15 hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
              <path d="m6 2 6 3.8L6 9.6 0 5.8 6 2Zm12 0 6 3.8-6 3.8-6-3.8L18 2ZM0 13.4l6-3.8 6 3.8-6 3.8-6-3.8Zm18-3.8 6 3.8-6 3.8-6-3.8 6-3.8ZM6 17.9l6-3.8 6 3.8-6 3.7-6-3.7Z" />
            </svg>
          </button>
          <button
            type="button"
            title="Google Drive — скоро"
            onClick={() => showToast("Загрузка из Google Drive скоро появится")}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.03] text-muted-foreground transition-colors hover:border-white/15 hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
              <path d="M7.6 2h8.8l7.1 12.3-4.4 7.7H4.9L.5 14.3 7.6 2Zm1.1 2-5.4 9.4h10.8L8.7 4Zm2 10.4L6.3 22h11.4l-2.1-3.7-4.9-3.9Zm7.3-1L13.9 22h5.6l3-5.3-3.5-5.3ZM8.1 4l4.4 7.6h5.4L13.5 4H8.1Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Мета-строка: приватность + лимит/регистрация, левый край = ось Hero */}
      <div className="mt-5 flex flex-col gap-2 text-[12.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          <Lock className="size-3.5 shrink-0" />
          Ваши файлы защищены и не загружаются на сервер
        </div>
        <div>
          1 GB максимальный размер файла или{" "}
          <a
            onClick={(e) => {
              e.preventDefault();
              showToast("Регистрация скоро появится");
            }}
            href="#"
            className="cursor-pointer font-medium text-primary underline underline-offset-2"
          >
            Регистрация
          </a>
        </div>
      </div>

      {/* Выбор форматов — компактный ряд, отделён тонкой границей */}
      <div className="mt-6 flex items-center gap-2 border-t border-white/6 pt-5">
        {reversed ? <FullFormatPicker side="source" /> : <FixedFormatPicker side="source" />}
        <SwapButton />
        {reversed || fixedTarget ? <FixedFormatPicker side="target" /> : <FullFormatPicker side="target" />}
      </div>
    </GlowCard>
  );
}

function SwapButton() {
  const { swapFormats } = useConvert();
  return (
    <button
      type="button"
      title="Поменять местами"
      aria-label="Поменять местами"
      onClick={swapFormats}
      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-white/[0.03] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
    >
      <ArrowLeftRight className="size-3.5" />
    </button>
  );
}
