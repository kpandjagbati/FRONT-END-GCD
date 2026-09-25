"use client";

import { IconEye, IconFile, IconLock } from "@/components/icons";
import { useFileDownload } from "@/components/FileDownload";
import type { ExportKind, ExportSource } from "@/lib/downloads";

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
}: Readonly<{
  variant: Variant;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}>) {
  const isDisabled = disabled;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={`btn btn-sm h-9 min-h-9 max-w-full px-3 sm:px-5 border-none rounded-xl font-semibold shadow-sm ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

export function VoirButton({
  label = "Voir",
  blue = false,
  onClick,
}: Readonly<{
  label?: string;
  blue?: boolean;
  onClick?: () => void;
}>) {
  return (
    <ActionButton variant={blue ? "voir-blue" : "voir"} onClick={onClick}>
      {label}
      <IconEye className="size-4" />
    </ActionButton>
  );
}

function ExportButton({
  kind,
  variant,
  children,
  file,
}: Readonly<{
  kind: ExportKind;
  variant: Variant;
  children: React.ReactNode;
  file?: ExportSource;
}>) {
  const { start, busy, state } = useFileDownload();
  const active = busy && state?.kind === kind;

  return (
    <ActionButton variant={variant} disabled={busy} onClick={() => start(kind, file)}>
      {children}
      {active ? <span className="yas-spinner-sm" /> : null}
    </ActionButton>
  );
}

export function PdfRedButton({ file }: { file?: ExportSource } = {}) {
  return (
    <ExportButton kind="pdf-locked" variant="pdf-red" file={file}>
      PDF
      <IconLock className="size-4" />
    </ExportButton>
  );
}

export function PdfNavyButton({ file }: { file?: ExportSource } = {}) {
  return (
    <ExportButton kind="pdf" variant="pdf-navy" file={file}>
      PDF
      <IconFile className="size-4" />
    </ExportButton>
  );
}

export function PdfGrayButton({ file }: { file?: ExportSource } = {}) {
  return (
    <ExportButton kind="pdf" variant="pdf-gray" file={file}>
      PDF
    </ExportButton>
  );
}

export function ExcelButton() {
  return (
    <ExportButton kind="excel" variant="excel">
      Excel
      <IconFile className="size-4" />
    </ExportButton>
  );
}

export function WordButton() {
  return (
    <ExportButton kind="word" variant="word">
      Word
      <IconFile className="size-4" />
    </ExportButton>
  );
}
