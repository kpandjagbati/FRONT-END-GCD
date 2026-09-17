"use client";

import { IconEye, IconFile, IconLock } from "@/components/icons";
import { downloadLockedPdfFiles, downloadSimplePdf } from "@/lib/downloads";

type Variant = "voir" | "pdf-red" | "pdf-navy" | "pdf-gray" | "excel" | "word" | "valider" | "voir-blue";

const styles: Record<Variant, string> = {
  voir: "bg-[#fcd90b] text-neutral-800 hover:bg-[#f0ce00]",
  valider: "bg-[#fcd90b] text-neutral-800 hover:bg-[#f0ce00]",
  "pdf-red": "bg-[#ef6b6b] text-white hover:bg-[#e85c5c]",
  "pdf-navy": "bg-[#01377d] text-white hover:bg-[#012d66]",
  "pdf-gray": "bg-[#cfcfcf] text-white hover:bg-[#bfbfbf]",
  excel: "bg-[#2db85a] text-white hover:bg-[#27a64f]",
  word: "bg-[#cfcfcf] text-white hover:bg-[#bfbfbf] cursor-pointer",
  "voir-blue": "bg-[#3b3bdb] text-white hover:bg-[#3232c4]",
};

export function ActionButton({
  variant,
  children,
  disabled,
  onClick,
}: {
  variant: Variant;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const isDisabled = disabled;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={`btn btn-sm h-9 min-h-9 px-5 border-none rounded-xl font-semibold shadow-sm ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

export function VoirButton({
  label = "Voir",
  blue = false,
  onClick,
}: {
  label?: string;
  blue?: boolean;
  onClick?: () => void;
}) {
  return (
    <ActionButton variant={blue ? "voir-blue" : "voir"} onClick={onClick}>
      {label}
      <IconEye className="size-4" />
    </ActionButton>
  );
}

export function PdfRedButton() {
  return (
    <ActionButton variant="pdf-red" onClick={downloadLockedPdfFiles}>
      PDF
      <IconLock className="size-4" />
    </ActionButton>
  );
}

export function PdfNavyButton() {
  return (
    <ActionButton variant="pdf-navy" onClick={downloadSimplePdf}>
      PDF
      <IconFile className="size-4" />
    </ActionButton>
  );
}

export function PdfGrayButton() {
  return (
    <ActionButton variant="pdf-gray" onClick={downloadSimplePdf}>
      PDF
    </ActionButton>
  );
}

export function ExcelButton() {
  return (
    <ActionButton variant="excel">
      Excel
      <IconFile className="size-4" />
    </ActionButton>
  );
}

export function WordButton() {
  return (
    <ActionButton variant="word">
      Word
      <IconFile className="size-4" />
    </ActionButton>
  );
}
