"use client";

import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/use-client";

export default function YasLoadingOverlay({ open }: { open: boolean }) {
  const isClient = useIsClient();
  if (!open || !isClient) return null;

  return createPortal(
    <div
      className="yas-loading-overlay"
      role="alert"
      aria-busy="true"
      aria-live="assertive"
      aria-label="Chargement en cours"
    >
      <span className="yas-spinner" />
    </div>,
    document.body,
  );
}
