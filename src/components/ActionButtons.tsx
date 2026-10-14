"use client";

import { IconExcel, IconEye, IconPdf, IconPdfLock, IconWord } from "@/components/icons";

type Variant = "voir" | "pdf-red" | "pdf-navy" | "pdf-gray" | "excel" | "word" | "valider" | "voir-blue";

const styles: Record<Variant, string> = {
  voir: "bg-[#fcd90b] text-neutral-800 hover:bg-[#f0ce00]",
  valider: "bg-[#fcd90b] text-neutral-800 hover:bg-[#f0ce00]",
  "pdf-red": "bg-[#e5252a] text-white hover:bg-[#c91f24]",
  "pdf-navy": "bg-[#01377d] text-white hover:bg-[#012d66]",
  "pdf-gray": "bg-[#3b6ea8] text-white hover:bg-[#325e91]",
  excel: "bg-[#217346] text-white hover:bg-[#1a5c38]",
  word: "bg-[#2b579a] text-white hover:bg-[#234a82] cursor-pointer",
  "voir-blue": "bg-[#3b3bdb] text-white hover:bg-[#3232c4]",
};

export function ActionButton({
  variant,
  children,
  disabled,
  loading,
  onClick,
  "aria-label": ariaLabel,
}: Readonly<{
  variant: Variant;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}>) {
  const inactive = Boolean(disabled && !loading);
  const paleTone =
    variant === "pdf-red"
      ? "bg-[#f0a8ab] text-white hover:bg-[#f0a8ab]"
      : variant === "excel"
        ? "bg-[#8fbf9f] text-white hover:bg-[#8fbf9f]"
        : variant === "word"
          ? "bg-[#8fa8c9] text-white hover:bg-[#8fa8c9]"
          : "";
  const tone =
    inactive && paleTone
      ? `${paleTone} cursor-not-allowed shadow-none`
      : `${styles[variant]} ${inactive ? "opacity-60" : ""}`;

  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`btn btn-sm h-9 min-h-9 max-w-full shrink-0 gap-1.5 px-2.5 text-xs sm:px-5 sm:text-sm border-none rounded-xl font-semibold shadow-sm disabled:opacity-100 ${tone}`}
    >
      {children}
    </button>
  );
}

function ButtonMark({
  loading,
  children,
}: Readonly<{ loading?: boolean; children: React.ReactNode }>) {
  if (loading) {
    return <span className="yas-spinner-sm" aria-hidden="true" />;
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
  iconOnly = false,
}: { onClick?: () => void; disabled?: boolean; loading?: boolean; iconOnly?: boolean } = {}) {
  return (
    <ActionButton
      variant="pdf-red"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      aria-label={iconOnly ? "Télécharger PDF" : undefined}
    >
      {iconOnly ? null : "PDF"}
      <ButtonMark loading={loading}>
        <IconPdfLock className="size-4" />
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
        <IconPdf className="size-4" />
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
      <ButtonMark loading={loading}>
        <IconPdf className="size-4" />
      </ButtonMark>
    </ActionButton>
  );
}

export function ExcelButton({
  onClick,
  disabled,
  loading,
  iconOnly = false,
}: { onClick?: () => void; disabled?: boolean; loading?: boolean; iconOnly?: boolean } = {}) {
  return (
    <ActionButton
      variant="excel"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      aria-label={iconOnly ? "Télécharger Excel" : undefined}
    >
      {iconOnly ? null : "Excel"}
      <ButtonMark loading={loading}>
        <IconExcel className="size-4" />
      </ButtonMark>
    </ActionButton>
  );
}

export function WordButton({
  onClick,
  disabled,
  loading,
  iconOnly = false,
}: { onClick?: () => void; disabled?: boolean; loading?: boolean; iconOnly?: boolean } = {}) {
  return (
    <ActionButton
      variant="word"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      aria-label={iconOnly ? "Télécharger Word" : undefined}
    >
      {iconOnly ? null : "Word"}
      <ButtonMark loading={loading}>
        <IconWord className="size-4" />
      </ButtonMark>
    </ActionButton>
  );
}
