"use client";

import { FormEvent, useEffect, useRef, useState, type ReactNode } from "react";
import { IconEye, IconUser } from "@/components/icons";
import PageHero from "@/components/PageHero";
import { formatDateTime } from "@/lib/format-date";

const SAMPLE = {
  profileId: "13808874",
  login: "",
  accountId: "1005146852",
  serviceId: "CS_PREPAID",
  serviceCode: "GSM",
  lastName: "TEST KITDATA DEV",
  firstName: "TEST KITDATA DEV",
  smsNumber: "",
  emailId: "N/A",
  activationDate: "2026-04-30 02:24:59",
  address1: "10",
  address2: "rue gta",
  addressId: "50769677",
};

function displayValue(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.toUpperCase() === "N/A") return "—";
  return trimmed;
}

function initials(firstName: string, lastName: string) {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "?";
}

function InfoRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-100 py-2.5 last:border-b-0 last:pb-0">
      <dt className="shrink-0 text-xs font-medium text-neutral-500">{label}</dt>
      <dd className="min-w-0 break-words text-right text-sm font-semibold text-yas-navy">{value}</dd>
    </div>
  );
}

function InfoSection({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <section className="rounded-2xl border border-neutral-100 bg-[#f7f9fc] p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-bold text-yas-navy">{title}</h3>
      <dl>{children}</dl>
    </section>
  );
}

export default function IdentificationPage() {
  const [phone, setPhone] = useState("");
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef<HTMLElement>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowResult(true);
  }

  useEffect(() => {
    if (!showResult) return;
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showResult]);

  const fullName = `${SAMPLE.firstName} ${SAMPLE.lastName}`.replace(/\s+/g, " ").trim();
  const searchedNumber = phone.trim() ? `228 ${phone.trim()}` : "—";

  return (
    <section className="my-auto w-full min-w-0 space-y-6 py-3 sm:space-y-8 sm:py-6">
      <PageHero
        title="Identification"
        description="Identifier un profil à partir du numéro."
        image="/illustrations/identification.svg"
      >
        <form onSubmit={onSubmit} className="yas-card w-full max-w-xl text-center">
          <h2 className="yas-title mb-6 text-balance">Veuillez renseigner le numéro de téléphone sans 228</h2>
          <div className="mx-auto max-w-sm text-left">
            <label className="yas-label">Numéro de téléphone</label>
            <input
              className="yas-input"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="btn btn-sm h-9 min-h-9 rounded-xl border-none bg-yas-yellow px-6 font-semibold text-neutral-800 hover:bg-[#f0ce00]"
            >
              Valider
              <IconEye className="size-4" />
            </button>
          </div>
        </form>
      </PageHero>

      {showResult ? (
        <article
          ref={resultRef}
          className="yas-card mx-auto w-full max-w-5xl overflow-hidden"
        >
          <header className="flex flex-col gap-4 border-b border-neutral-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-sm font-bold text-yas-navy sm:size-16 sm:text-lg">
                {initials(SAMPLE.firstName, SAMPLE.lastName) || <IconUser className="size-7" />}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Information des identités
                </p>
                <h2 className="mt-0.5 break-words text-base font-bold text-yas-navy sm:text-xl">{fullName}</h2>
                <p className="mt-1 text-sm font-medium text-neutral-500">{searchedNumber}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-yas-navy px-3 py-1 text-xs font-semibold text-white">
                {SAMPLE.serviceCode}
              </span>
              <span className="rounded-full bg-yas-yellow px-3 py-1 text-xs font-semibold text-neutral-800">
                {SAMPLE.serviceId.replaceAll("_", " ")}
              </span>
            </div>
          </header>
          <div className="mt-4 h-1.5 w-24 rounded-full bg-yas-yellow" />

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <InfoSection title="Identifiants principaux">
              <InfoRow label="ID de profil" value={displayValue(SAMPLE.profileId)} />
              <InfoRow label="Login" value={displayValue(SAMPLE.login)} />
              <InfoRow label="ID de compte" value={displayValue(SAMPLE.accountId)} />
              <InfoRow label="ID de service" value={displayValue(SAMPLE.serviceId)} />
              <InfoRow label="Code de service" value={displayValue(SAMPLE.serviceCode)} />
            </InfoSection>

            <InfoSection title="Informations personnelles">
              <InfoRow label="Nom" value={displayValue(SAMPLE.lastName)} />
              <InfoRow label="Prénom" value={displayValue(SAMPLE.firstName)} />
              <InfoRow label="Numéro SMS" value={displayValue(SAMPLE.smsNumber)} />
              <InfoRow label="E-mail" value={displayValue(SAMPLE.emailId)} />
              <InfoRow label="Activation" value={formatDateTime(SAMPLE.activationDate)} />
            </InfoSection>

            <InfoSection title="Adresse">
              <InfoRow label="Adresse 1" value={displayValue(SAMPLE.address1)} />
              <InfoRow label="Adresse 2" value={displayValue(SAMPLE.address2)} />
              <InfoRow label="ID d'adresse" value={displayValue(SAMPLE.addressId)} />
            </InfoSection>
          </div>
        </article>
      ) : null}
    </section>
  );
}
