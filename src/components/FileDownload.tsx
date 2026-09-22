"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconClose, IconFile } from "@/components/icons";
import {
  EXPORT_FILES,
  fetchExport,
  filenameFromResponse,
  readResponseWithProgress,
  saveBlob,
  type ExportKind,
  type ExportSource,
} from "@/lib/downloads";
import { useIsClient } from "@/lib/use-client";

type DownloadStatus = "running" | "done" | "error";

type DownloadState = {
  status: DownloadStatus;
  kind: ExportKind;
  filename: string;
  progress: number;
  saved: boolean;
};

type FileDownloadContextValue = {
  state: DownloadState | null;
  busy: boolean;
  start: (kind: ExportKind, source?: ExportSource) => void;
  dismiss: () => void;
};

const FileDownloadContext = createContext<FileDownloadContextValue | null>(null);

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function FileDownloadProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [state, setState] = useState<DownloadState | null>(null);
  const runId = useRef(0);

  const dismiss = useCallback(() => {
    setState(null);
  }, []);

  const start = useCallback((kind: ExportKind, source?: ExportSource) => {
    const meta = EXPORT_FILES[kind];
    const fallbackName = source?.filename ?? meta.filename;
    const id = ++runId.current;

    setState({
      status: "running",
      kind,
      filename: fallbackName,
      progress: 8,
      saved: false,
    });

    void (async () => {
      try {
        const response = source?.url ? await fetch(source.url) : await fetchExport(kind);
        if (runId.current !== id) return;

        if (response) {
          if (!response.ok) throw new Error("export-failed");
          const filename = filenameFromResponse(response, fallbackName);
          setState((current) =>
            current && runId.current === id ? { ...current, filename } : current,
          );
          const blob = await readResponseWithProgress(response, (ratio) => {
            if (runId.current !== id) return;
            setState((current) =>
              current ? { ...current, progress: Math.max(8, Math.round(ratio * 100)) } : current,
            );
          });
          if (runId.current !== id) return;
          saveBlob(filename, blob);
          setState({
            status: "done",
            kind,
            filename,
            progress: 100,
            saved: true,
          });
          window.setTimeout(() => {
            if (runId.current === id) setState(null);
          }, 3500);
          return;
        }

        for (const value of [22, 44, 66, 84]) {
          await wait(160);
          if (runId.current !== id) return;
          setState((current) => (current ? { ...current, progress: value } : current));
        }

        setState({
          status: "done",
          kind,
          filename: meta.filename,
          progress: 100,
          saved: false,
        });
        window.setTimeout(() => {
          if (runId.current === id) setState(null);
        }, 3500);
      } catch {
        if (runId.current !== id) return;
        setState({
          status: "error",
          kind,
          filename: meta.filename,
          progress: 0,
          saved: false,
        });
      }
    })();
  }, []);

  const value = useMemo<FileDownloadContextValue>(
    () => ({
      state,
      busy: state?.status === "running",
      start,
      dismiss,
    }),
    [dismiss, start, state],
  );

  return <FileDownloadContext.Provider value={value}>{children}</FileDownloadContext.Provider>;
}

export function useFileDownload() {
  const context = useContext(FileDownloadContext);
  if (!context) {
    throw new Error("useFileDownload must be used within FileDownloadProvider");
  }
  return context;
}

export function FileDownloadNotice() {
  const isClient = useIsClient();
  const { state, dismiss } = useFileDownload();

  if (!isClient || !state) return null;

  const title =
    state.status === "running"
      ? "Téléchargement en cours"
      : state.status === "error"
        ? "Échec du téléchargement"
        : state.saved
          ? "Téléchargement terminé"
          : "Téléchargement prêt";

  const detail =
    state.status === "error"
      ? "Le fichier n'a pas pu être récupéré."
      : state.status === "running"
        ? state.filename
        : state.saved
          ? `${state.filename} a été enregistré.`
          : `${state.filename} s'affichera ici dès que le serveur enverra le fichier.`;

  return createPortal(
    <aside className="yas-mail-toast" role="status" aria-live="polite">
      <div className="relative rounded-2xl border border-yas-navy/10 bg-white p-4 text-sm text-yas-navy shadow-[0_18px_40px_rgba(1,55,125,0.22)] dark:border-white/10 dark:text-[#e8eef7]">
        <button
          type="button"
          aria-label="Fermer"
          onClick={dismiss}
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full text-yas-navy/70 hover:bg-black/5 hover:text-yas-navy"
        >
          <IconClose className="size-4" />
        </button>
        <div className="flex items-start gap-3 pr-8">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-yas-navy">
            <IconFile className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">{title}</p>
            <p className="mt-1 font-medium leading-relaxed text-neutral-600">{detail}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-200">
              <div
                className={`h-full rounded-full ${
                  state.status === "error" ? "bg-[#ef6b6b]" : "bg-yas-yellow"
                } ${state.status === "running" ? "transition-[width] duration-200" : ""}`}
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>,
    document.body,
  );
}
