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
      className="yas-modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[#01377d]/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="yas-modal-title"
        className={`yas-modal-panel relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-[0_28px_80px_rgba(1,55,125,0.22)] sm:rounded-3xl ${
          wide ? "max-w-6xl" : "max-w-3xl"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white text-yas-navy shadow-sm hover:bg-neutral-50"
        >
          <IconClose className="size-5" />
        </button>
        <div className="p-5 sm:p-6 md:p-8">
          <h2 id="yas-modal-title" className="pr-10 text-xl font-bold text-yas-navy">
            {title}
          </h2>
          <div className="mt-3 h-1.5 w-16 rounded-full bg-yas-yellow" />
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
