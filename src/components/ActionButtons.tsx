"use client";

import { IconEye, IconFile, IconLock } from "@/components/icons";

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
  loading,
  onClick,
}: Readonly<{
  variant: Variant;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}>) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={onClick}
      className={`btn btn-sm h-9 min-h-9 max-w-full px-3 sm:px-5 border-none rounded-xl font-semibold shadow-sm disabled:opacity-100 ${styles[variant]} ${
        disabled && !loading ? "opacity-60" : ""
      }`}
    >
      {children}
    </button>
  );
}

function ButtonMark({
  loading,
  light,
  children,
}: Readonly<{ loading?: boolean; light?: boolean; children: React.ReactNode }>) {
  if (loading) {
    return <span className={`yas-spinner-sm ${light ? "text-yas-navy" : ""}`} aria-hidden="true" />;
  }
  return children;
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

export function PdfRedButton({
  onClick,
  disabled,
  loading,
}: { onClick?: () => void; disabled?: boolean; loading?: boolean } = {}) {
  return (
    <ActionButton variant="pdf-red" onClick={onClick} disabled={disabled} loading={loading}>
      PDF
      <ButtonMark loading={loading}>
        <IconLock className="size-4" />
      </ButtonMark>
    </ActionButton>
  );
}

export function PdfNavyButton({
  onClick,
  disabled,
  loading,
}: { onClick?: () => void; disabled?: boolean; loading?: boolean } = {}) {
  return (
    <ActionButton variant="pdf-navy" onClick={onClick} disabled={disabled} loading={loading}>
      PDF
      <ButtonMark loading={loading}>
        <IconFile className="size-4" />
      </ButtonMark>
    </ActionButton>
  );
}

export function PdfGrayButton({
  onClick,
  disabled,
  loading,
}: { onClick?: () => void; disabled?: boolean; loading?: boolean } = {}) {
  return (
    <ActionButton variant="pdf-gray" onClick={onClick} disabled={disabled} loading={loading}>
      PDF
      {loading ? <span className="yas-spinner-sm text-yas-navy" aria-hidden="true" /> : null}
    </ActionButton>
  );
}

export function ExcelButton({
  onClick,
  disabled,
  loading,
}: { onClick?: () => void; disabled?: boolean; loading?: boolean } = {}) {
  return (
    <ActionButton variant="excel" onClick={onClick} disabled={disabled} loading={loading}>
      Excel
      <ButtonMark loading={loading}>
        <IconFile className="size-4" />
      </ButtonMark>
    </ActionButton>
  );
}

export function WordButton({
  onClick,
  disabled,
  loading,
}: { onClick?: () => void; disabled?: boolean; loading?: boolean } = {}) {
  return (
    <ActionButton variant="word" onClick={onClick} disabled={disabled} loading={loading}>
      Word
      <ButtonMark loading={loading} light>
        <IconFile className="size-4" />
      </ButtonMark>
    </ActionButton>
  );
}
