"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { IconClose } from "@/components/icons";

export default function YasModal({
  open,
  title,
  onClose,
  wide = false,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={`yas-modal-backdrop fixed inset-0 flex items-end justify-center bg-[#01377d]/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4 ${
        wide ? "z-[60]" : "z-50"
      }`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="yas-modal-title"
        className={`yas-modal-panel relative flex w-full min-w-0 flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_28px_80px_rgba(1,55,125,0.22)] sm:rounded-3xl ${
          wide
            ? "h-[min(92dvh,100%)] max-w-[84rem] sm:h-[min(90dvh,100%)]"
            : "max-h-[min(96dvh,100%)] max-w-3xl overflow-y-auto overscroll-contain sm:max-h-[92dvh]"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-yas-navy shadow-sm hover:bg-neutral-50 sm:right-4 sm:top-4"
        >
          <IconClose className="size-5" />
        </button>
        <div
          className={`flex min-h-0 flex-1 flex-col p-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-5 sm:pb-6 ${
            wide ? "overflow-hidden" : "md:p-8 sm:pb-8"
          }`}
        >
          <h2 id="yas-modal-title" className="shrink-0 pr-10 text-lg font-bold text-yas-navy sm:text-xl">
            {title}
          </h2>
          <div className="mt-3 h-1.5 w-16 shrink-0 rounded-full bg-yas-yellow" />
          <div className={`mt-6 min-h-0 ${wide ? "flex-1 overflow-auto overscroll-contain" : ""}`}>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
