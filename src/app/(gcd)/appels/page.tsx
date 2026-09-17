"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ExcelButton,
  PdfNavyButton,
  PdfRedButton,
  VoirButton,
  WordButton,
} from "@/components/ActionButtons";
import { IconClose } from "@/components/icons";
import MailInboxNotice from "@/components/MailInboxNotice";
import YasDataTable, { type YasColumn } from "@/components/YasDataTable";
import YasLoadingOverlay from "@/components/YasLoadingOverlay";
import { searchAppelsMock, type AppelRow } from "@/lib/mock-appels";
import { resolvePdfMailAddress } from "@/lib/session";
import { useIsClient } from "@/lib/use-client";
import { useVoirSearch } from "@/lib/use-voir-search";

const CRITERIA = [
  {
    id: "numero",
    title: "Numero",
    desc: "Rechercher les appels d'un numéro.",
    image: "/illustrations/appels.svg",
    placeholder: "Ex. 22890123456",
  },
  {
    id: "imei",
    title: "IMEI",
    desc: "Rechercher les appels d'un IMEI.",
    image: "/illustrations/ftth.svg",
    placeholder: "Ex. 356938035643809",
  },
  {
    id: "imsi",
    title: "IMSI",
    desc: "Rechercher les appels d'un IMSI.",
    image: "/illustrations/identification.svg",
    placeholder: "Ex. 208011234567890",
  },
  {
    id: "appele",
    title: "Numero appelé",
    desc: "Rechercher par numéro appelé.",
    image: "/illustrations/identites.svg",
    placeholder: "Ex. 22890123456",
  },
] as const;

type CriteriaId = (typeof CRITERIA)[number]["id"];

const RESULT_COLUMNS: YasColumn<AppelRow>[] = [
  { key: "date", label: "Date" },
  { key: "heure", label: "Heure" },
  { key: "appelant", label: "Appelant" },
  { key: "appele", label: "Appelé" },
  { key: "duree", label: "Durée" },
  { key: "type", label: "Type" },
  { key: "imei", label: "IMEI" },
  { key: "imsi", label: "IMSI" },
];

export default function AppelsPage() {
  const [activeId, setActiveId] = useState<CriteriaId | null>(null);
  const [sendMail, setSendMail] = useState(false);
  const [mailInput, setMailInput] = useState("");
  const [mailNotice, setMailNotice] = useState<string | null>(null);
  const [mailNoticeKey, setMailNoticeKey] = useState(0);
  const isClient = useIsClient();
  const { loading, results, run, reset } = useVoirSearch(searchAppelsMock);
  const active = CRITERIA.find((item) => item.id === activeId) ?? null;

  function resetMail() {
    setSendMail(false);
    setMailInput("");
  }

  function announcePdfMail(typedEmail: string) {
    setMailNotice(resolvePdfMailAddress(typedEmail));
    setMailNoticeKey((value) => value + 1);
  }

  const closeMailNotice = useCallback(() => {
    setMailNotice(null);
  }, []);

  function openCard(id: CriteriaId) {
    if (loading) return;
    reset();
    resetMail();
    setActiveId(id);
  }

  function closeModal() {
    if (loading) return;
    setActiveId(null);
    resetMail();
    reset();
  }

  async function handleVoir() {
    if (sendMail) {
      announcePdfMail(mailInput);
    }
    await run();
  }

  function onSendMailChange(checked: boolean) {
    setSendMail(checked);
    if (checked && results) {
      announcePdfMail(mailInput);
    }
  }

  useEffect(() => {
    if (!active) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (loading) {
        event.preventDefault();
        return;
      }
      setActiveId(null);
      resetMail();
      reset();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [active, loading, reset]);

  return (
    <section className="space-y-6">
      <YasLoadingOverlay open={loading} />
      <div className="grid items-center gap-6 rounded-3xl bg-white px-8 py-6 shadow-[0_12px_32px_rgba(1,55,125,0.06)] md:grid-cols-[1fr_1fr]">
        <div>
          <h1 className="text-2xl font-bold text-yas-navy">Appels Détaillés</h1>
          <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-neutral-600">
            Choisissez un critère. Chaque carte ouvre un formulaire illustré pour lancer la
            recherche.
          </p>
          <div className="mt-4 h-1.5 w-24 rounded-full bg-yas-yellow" />
        </div>
        <div className="hidden justify-end md:flex">
          <span className="yas-illustration-well flex h-44 w-full max-w-md items-center justify-center rounded-2xl bg-[#eef4ff] px-4">
            <img
              src="/illustrations/appels.svg"
              alt=""
              className="yas-illustration h-40 w-auto max-w-full object-contain"
            />
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CRITERIA.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openCard(item.id)}
            className="flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_12px_32px_rgba(1,55,125,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(1,55,125,0.12)]"
          >
            <span className="yas-illustration-well flex h-36 items-center justify-center bg-[#eef4ff] px-4">
              <img src={item.image} alt="" className="yas-illustration h-28 w-auto max-w-full object-contain" />
            </span>
            <span className="flex flex-1 flex-col p-5">
              <span className="font-bold text-yas-navy">{item.title}</span>
              <span className="mt-1 text-sm text-neutral-500">{item.desc}</span>
            </span>
          </button>
        ))}
      </div>

      {isClient && active
        ? createPortal(
            <div
              className="yas-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-[#01377d]/40 p-4 backdrop-blur-[2px]"
              onClick={closeModal}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="appels-modal-title"
                className={`yas-modal-panel relative max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-white shadow-[0_28px_80px_rgba(1,55,125,0.22)] ${
                  results ? "max-w-6xl" : "max-w-3xl"
                }`}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  aria-label="Fermer"
                  onClick={closeModal}
                  className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/90 text-yas-navy shadow-sm hover:bg-white"
                >
                  <IconClose className="size-5" />
                </button>

                <div
                  className={`yas-illustration-well flex items-center justify-center bg-[#eef4ff] px-8 ${
                    results ? "h-28" : "h-44"
                  }`}
                >
                  <img
                    src={active.image}
                    alt=""
                    className={`yas-illustration w-auto max-w-full object-contain ${results ? "h-24" : "h-40"}`}
                  />
                </div>

                <form className="p-8" onSubmit={(event) => event.preventDefault()}>
                  <h2 id="appels-modal-title" className="text-xl font-bold text-yas-navy">
                    {active.title}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">{active.desc}</p>
                  <div className="mt-3 h-1.5 w-16 rounded-full bg-yas-yellow" />

                  <div className="mt-6 grid gap-5 md:grid-cols-3">
                    <div>
                      <label className="yas-label">
                        {active.title} <span className="text-red-500">*</span>
                      </label>
                      <input className="yas-input" placeholder={active.placeholder} autoFocus />
                    </div>
                    <div>
                      <label className="yas-label">
                        Date début <span className="text-red-500">*</span>
                      </label>
                      <input type="text" placeholder="jj/mm/aaaa" className="yas-input" />
                    </div>
                    <div>
                      <label className="yas-label">
                        Date fin <span className="text-red-500">*</span>
                      </label>
                      <input type="text" placeholder="jj/mm/aaaa" className="yas-input" />
                    </div>
                  </div>

                  <label className="mt-6 flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-neutral-600">
                    <input
                      type="checkbox"
                      className="yas-check"
                      checked={sendMail}
                      onChange={(event) => onSendMailChange(event.target.checked)}
                    />
                    Veuillez Cocher la case si vous souhaitez recevoir les détails de la recherche par
                    mail
                  </label>

                  {sendMail ? (
                    <div className="yas-mail-field mt-4 rounded-2xl bg-[#eef4ff] p-4">
                      <label className="yas-label">Adresse e-mail</label>
                      <input
                        type="email"
                        className="yas-input bg-white"
                        placeholder="ex. prenom.nom@yas.tg"
                        value={mailInput}
                        onChange={(event) => setMailInput(event.target.value)}
                        autoFocus
                      />
                      <p className="mt-2 text-xs font-medium text-neutral-500">
                        Si ce champ est vide, le PDF sera envoyé à l&apos;adresse utilisée pour vous
                        connecter.
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <VoirButton onClick={handleVoir} />
                    <PdfRedButton />
                    <PdfNavyButton />
                    <ExcelButton />
                    <WordButton />
                  </div>

                  {results ? (
                    <div className="mt-8">
                      <YasDataTable columns={RESULT_COLUMNS} rows={results} embedded />
                    </div>
                  ) : null}
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}

      {mailNotice ? (
        <MailInboxNotice key={mailNoticeKey} email={mailNotice} onClose={closeMailNotice} />
      ) : null}
    </section>
  );
}
