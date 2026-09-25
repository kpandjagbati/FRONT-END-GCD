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
import DateField from "@/components/DateField";
import { IconChip, IconClose, IconPhone, IconPhoneOutgoing, IconSim } from "@/components/icons";
import MailInboxNotice from "@/components/MailInboxNotice";
import YasDataTable, { type YasColumn } from "@/components/YasDataTable";
import YasLoadingOverlay from "@/components/YasLoadingOverlay";
import { formatDateTime } from "@/lib/format-date";
import { APPELS_RESULT_META, searchAppelsMock, type AppelRow } from "@/lib/mock-appels";
import { resolvePdfMailAddress } from "@/lib/session";
import { useIsClient } from "@/lib/use-client";
import { useVoirSearch } from "@/lib/use-voir-search";

const CRITERIA = [
  {
    id: "numero",
    title: "Numero",
    desc: "Rechercher les appels d'un numéro.",
    image: "/illustrations/appels.svg",
    icon: IconPhone,
    placeholder: "Ex. 22870210044",
  },
  {
    id: "imei",
    title: "IMEI",
    desc: "Rechercher les appels d'un IMEI.",
    image: "/illustrations/ftth.svg",
    icon: IconChip,
    placeholder: "Ex. 86923604895075",
  },
  {
    id: "imsi",
    title: "IMSI",
    desc: "Rechercher les appels d'un IMSI.",
    image: "/illustrations/identification.svg",
    icon: IconSim,
    placeholder: "Ex. 615010115807151",
  },
  {
    id: "appele",
    title: "Numero appelé",
    desc: "Rechercher par numéro appelé.",
    image: "/illustrations/identites.svg",
    icon: IconPhoneOutgoing,
    placeholder: "Ex. 22890123456",
  },
] as const;

type CriteriaId = (typeof CRITERIA)[number]["id"];

function SensBadge({ value }: Readonly<{ value: string }>) {
  const incoming = value === "E";
  return (
    <span
      className={`inline-flex min-w-7 justify-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
        incoming ? "bg-[#e8f6ee] text-[#1f7a46]" : "bg-[#eef4ff] text-yas-navy"
      }`}
    >
      {value || "—"}
    </span>
  );
}

const RESULT_COLUMNS: YasColumn<AppelRow>[] = [
  { key: "appelant", label: "Appelant" },
  { key: "appele", label: "Appelé" },
  { key: "identiteAppelee", label: "Identite appelé" },
  { key: "date", label: "Date", render: (row) => formatDateTime(row.date) },
  { key: "heure", label: "Heure" },
  { key: "duree", label: "Duree" },
  {
    key: "type",
    label: "Type",
    render: (row) =>
      row.type ? (
        <span className="inline-flex rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-bold text-yas-navy">
          {row.type}
        </span>
      ) : (
        "—"
      ),
  },
  {
    key: "sens",
    label: "Sens",
    render: (row) => <SensBadge value={row.sens} />,
  },
  { key: "imsi", label: "IMSI" },
  { key: "imei", label: "IMEI" },
  {
    key: "localisation",
    label: "Localisation",
    className: "max-w-[160px] whitespace-normal break-words",
  },
];

export default function AppelsPage() {
  const [activeId, setActiveId] = useState<CriteriaId | null>(null);
  const [sendMail, setSendMail] = useState(false);
  const [mailInput, setMailInput] = useState("");
  const [mailNotice, setMailNotice] = useState<string | null>(null);
  const [mailNoticeKey, setMailNoticeKey] = useState(0);
  const isClient = useIsClient();
  const { loading, results, run, reset } = useVoirSearch(searchAppelsMock);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [searchPeriod, setSearchPeriod] = useState<{ debut: string; fin: string } | null>(null);
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

  function resetDates() {
    setDateDebut("");
    setDateFin("");
    setSearchPeriod(null);
  }

  function openCard(id: CriteriaId) {
    if (loading) return;
    reset();
    resetMail();
    resetDates();
    setActiveId(id);
  }

  function closeModal() {
    if (loading) return;
    setActiveId(null);
    resetMail();
    resetDates();
    reset();
  }

  async function handleVoir() {
    if (sendMail) {
      announcePdfMail(mailInput);
    }
    setSearchPeriod({ debut: dateDebut, fin: dateFin });
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
      resetDates();
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
    <section className="my-auto w-full min-w-0 py-3 sm:py-6">
      <YasLoadingOverlay open={loading} />
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-center lg:gap-8">
        <div className="w-full max-w-xs shrink-0 lg:max-w-sm">
          <h1 className="text-xl font-bold text-yas-navy sm:text-2xl">Appels Détaillés</h1>
          <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-600">
            Choisissez un critère. Chaque carte ouvre un formulaire illustré pour lancer la
            recherche.
          </p>
          <div className="mt-4 h-1.5 w-24 rounded-full bg-yas-yellow" />
          <img
            src="/illustrations/appels-hero.svg"
            alt=""
            className="mt-4 hidden h-auto w-full object-contain sm:block sm:mt-6"
          />
        </div>

        <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
          {CRITERIA.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openCard(item.id)}
                className="flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_12px_32px_rgba(1,55,125,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(1,55,125,0.12)]"
              >
                <span className="flex items-center justify-center px-3 pt-6 sm:pt-7">
                  <span className="grid size-16 place-items-center rounded-2xl bg-[#eef4ff] text-yas-navy">
                    <Icon className="size-8" />
                  </span>
                </span>
                <span className="flex flex-1 flex-col p-4 sm:p-5">
                  <span className="font-bold text-yas-navy">{item.title}</span>
                  <span className="mt-1 text-sm text-neutral-500">{item.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {isClient && active
        ? createPortal(
            <div
              className="yas-modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[#01377d]/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
              onClick={closeModal}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="appels-modal-title"
                className={`yas-modal-panel relative max-h-[92dvh] w-full min-w-0 overflow-y-auto rounded-t-3xl bg-white shadow-[0_28px_80px_rgba(1,55,125,0.22)] sm:rounded-3xl ${
                  results ? "max-w-6xl" : "max-w-3xl"
                }`}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  aria-label="Fermer"
                  onClick={closeModal}
                  className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-white/90 text-yas-navy shadow-sm hover:bg-white sm:right-4 sm:top-4"
                >
                  <IconClose className="size-5" />
                </button>

                <div
                  className={`yas-illustration-well flex items-center justify-center bg-[#eef4ff] px-4 sm:px-8 ${
                    results ? "h-16 sm:h-28" : "h-24 sm:h-44"
                  }`}
                >
                  <img
                    src={active.image}
                    alt=""
                    className={`yas-illustration w-auto max-w-full object-contain ${results ? "h-16 sm:h-24" : "h-28 sm:h-40"}`}
                  />
                </div>

                <form className="yas-bubbles p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-8" onSubmit={(event) => event.preventDefault()}>
                  <h2 id="appels-modal-title" className="pr-10 text-lg font-bold text-yas-navy sm:text-xl">
                    {active.title}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">{active.desc}</p>
                  <div className="mt-3 h-1.5 w-16 rounded-full bg-yas-yellow" />

                  <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
                      <DateField name="dateDebut" value={dateDebut} onChange={setDateDebut} />
                    </div>
                    <div>
                      <label className="yas-label">
                        Date fin <span className="text-red-500">*</span>
                      </label>
                      <DateField name="dateFin" value={dateFin} onChange={setDateFin} />
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

                  <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-4">
                    <VoirButton onClick={handleVoir} />
                    <PdfRedButton />
                    <PdfNavyButton />
                    <ExcelButton />
                    <WordButton />
                  </div>

                  {results ? (
                    <div className="mt-8 space-y-4">
                      <div className="rounded-2xl border border-neutral-100 bg-[#f7f9fc] px-4 py-4 sm:px-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-yas-navy">Résultats des appels</p>
                            <p className="mt-0.5 text-xs font-medium text-neutral-500">
                              {results.length} ligne{results.length > 1 ? "s" : ""} · {APPELS_RESULT_META.nom}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                            <span className="rounded-full bg-white px-2.5 py-1 text-neutral-600 shadow-sm">
                              E · Appel reçu
                            </span>
                            <span className="rounded-full bg-white px-2.5 py-1 text-neutral-600 shadow-sm">
                              S · Appel sortant
                            </span>
                          </div>
                        </div>
                        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                          <div>
                            <dt className="font-semibold text-neutral-400">Abonné</dt>
                            <dd className="mt-0.5 font-bold text-neutral-800">{APPELS_RESULT_META.abonne}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-neutral-400">Adresse</dt>
                            <dd className="mt-0.5 font-medium text-neutral-700">{APPELS_RESULT_META.adresse}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-neutral-400">Période</dt>
                            <dd className="mt-0.5 font-medium text-neutral-700">
                              {formatDateTime(searchPeriod?.debut || APPELS_RESULT_META.periodeDebut)} →{" "}
                              {formatDateTime(searchPeriod?.fin || APPELS_RESULT_META.periodeFin)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <YasDataTable columns={RESULT_COLUMNS} rows={results} embedded compact />
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
