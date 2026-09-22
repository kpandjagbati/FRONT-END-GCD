"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { IconClose } from "@/components/icons";
import { useIsClient } from "@/lib/use-client";

type MailInboxNoticeProps = {
  email: string;
  onClose: () => void;
};

export default function MailInboxNotice({ email, onClose }: MailInboxNoticeProps) {
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;
    const timer = window.setTimeout(onClose, 10000);
    return () => window.clearTimeout(timer);
  }, [email, onClose, isClient]);

  if (!isClient) return null;

  return createPortal(
    <aside className="yas-mail-toast" role="status" aria-live="polite">
      <div className="relative rounded-2xl border border-yas-yellow bg-[#fff8d6] p-4 text-sm text-yas-navy shadow-[0_18px_40px_rgba(1,55,125,0.22)] dark:text-[#e8eef7]">
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full text-yas-navy/70 hover:bg-black/5 hover:text-yas-navy"
        >
          <IconClose className="size-4" />
        </button>
        <p className="pr-8 font-bold">Vérifiez votre boîte mail</p>
        <p className="mt-1.5 font-medium leading-relaxed">
          Allez vérifier dans votre boîte mail : vous recevrez un e-mail contenant le PDF à
          l&apos;adresse <span className="font-bold">{email}</span>.
        </p>
      </div>
    </aside>,
    document.body,
  );
}
