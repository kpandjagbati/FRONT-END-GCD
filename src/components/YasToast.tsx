"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconClose } from "@/components/icons";
import { useIsClient } from "@/lib/use-client";

export type YasToastTone =
  | "info"
  | "success"
  | "export"
  | "pdf-red"
  | "pdf-navy"
  | "pdf-gray"
  | "excel"
  | "word";

const TONE_STYLES: Record<YasToastTone, string> = {
  info: "border-yas-navy/15 bg-[#eef4ff] text-yas-navy shadow-[0_18px_40px_rgba(1,55,125,0.14)]",
  success: "border-[#1f7a46]/20 bg-[#e8f6ee] text-[#1f7a46] shadow-[0_18px_40px_rgba(31,122,70,0.18)]",
  export: "border-yas-navy/15 bg-white text-yas-navy shadow-[0_18px_40px_rgba(1,55,125,0.16)]",
  "pdf-red":
    "border-[#e5252a]/25 bg-[#e5252a] text-white shadow-[0_18px_40px_rgba(229,37,42,0.28)]",
  "pdf-navy":
    "border-[#01377d]/25 bg-[#01377d] text-white shadow-[0_18px_40px_rgba(1,55,125,0.28)]",
  "pdf-gray":
    "border-[#3b6ea8]/25 bg-[#3b6ea8] text-white shadow-[0_18px_40px_rgba(59,110,168,0.28)]",
  excel:
    "border-[#217346]/25 bg-[#217346] text-white shadow-[0_18px_40px_rgba(33,115,70,0.28)]",
  word:
    "border-[#2b579a]/25 bg-[#2b579a] text-white shadow-[0_18px_40px_rgba(43,87,154,0.28)]",
};

export function YasToast({
  open,
  title,
  message,
  tone = "export",
  onClose,
}: Readonly<{
  open: boolean;
  title: string;
  message?: string;
  tone?: YasToastTone;
  onClose: () => void;
}>) {
  const isClient = useIsClient();

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => onClose(), 3200);
    return () => window.clearTimeout(timer);
  }, [open, title, message]); // eslint-disable-line react-hooks/exhaustive-deps -- auto-dismiss per toast content

  if (!isClient || !open) return null;

  return createPortal(
    <aside className="yas-side-toast" role="status" aria-live="polite">
      <div className={`relative rounded-2xl border p-4 text-sm ${TONE_STYLES[tone]}`}>
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full text-inherit opacity-70 hover:bg-black/10 hover:opacity-100"
        >
          <IconClose className="size-4" />
        </button>
        <p className="pr-8 font-bold">{title}</p>
        {message ? <p className="mt-1.5 font-medium leading-relaxed opacity-90">{message}</p> : null}
      </div>
    </aside>,
    document.body,
  );
}

export function useYasToast() {
  const [toast, setToast] = useState<{ title: string; message?: string; tone?: YasToastTone } | null>(
    null,
  );

  const showToast = useCallback((title: string, message?: string, tone: YasToastTone = "export") => {
    setToast({ title, message, tone });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}

export const EXPORT_TOAST: Record<
  "pdf-red" | "pdf-navy" | "pdf-gray" | "excel" | "word",
  { title: string; message: string; tone: YasToastTone }
> = {
  "pdf-red": {
    title: "PDF sécurisé",
    message: "Vous avez choisi le PDF avec mot de passe. Génération en cours…",
    tone: "pdf-red",
  },
  "pdf-navy": {
    title: "PDF",
    message: "Vous avez choisi l’export PDF. Génération en cours…",
    tone: "pdf-navy",
  },
  "pdf-gray": {
    title: "PDF",
    message: "Vous avez choisi l’export PDF. Génération en cours…",
    tone: "pdf-gray",
  },
  excel: {
    title: "Excel",
    message: "Vous avez choisi l’export Excel. Génération en cours…",
    tone: "excel",
  },
  word: {
    title: "Word",
    message: "Vous avez choisi l’export Word. Génération en cours…",
    tone: "word",
  },
};
