/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { FormEvent, useEffect, useRef, useState, type ReactNode } from "react";
import { IconEye, IconUser } from "@/components/icons";
import PageHero from "@/components/PageHero";
import { formatDateTime } from "@/lib/format-date";
import { querySubscriber } from "@/lib/gcd-api";
import { consumePrefill, rememberSearch, subscribePrefill } from "@/lib/recent-searches";
import { SearchAlert } from "@/components/SearchFeedback";

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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) return asRecord(value[0]);
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function nested(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const found = Object.entries(row).find(([name]) => name.toLowerCase() === key.toLowerCase());
    if (!found) continue;
    const record = asRecord(found[1]);
    if (record) return record;
  }
  return null;
}

function subscriberRow(data: unknown): Record<string, unknown> | null {
  const row = asRecord(data);
  if (!row) return null;
  const merged: Record<string, unknown> = { ...row };
  for (const [key, value] of Object.entries(row)) {
    if (nested(row, ["address", "adresse", "addresses", "adresses"]) && /address|adresse/i.test(key)) {
      continue;
    }
    const record = asRecord(value);
    if (record) Object.assign(merged, record);
  }
  return merged;
}

function norm(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function pick(row: Record<string, unknown>, keys: string[]) {
  const entries = Object.entries(row);
  for (const key of keys) {
    const wanted = norm(key);
    const found = entries.find(([name]) => norm(name) === wanted);
    if (!found || found[1] == null || typeof found[1] === "object") continue;
    const value = String(found[1]).trim();
    if (value) return value;
  }
  return "";
}

function leafStrings(value: unknown, key = ""): { key: string; value: string }[] {
  if (Array.isArray(value)) return value.flatMap((item, index) => leafStrings(item, `${key}${index}`));
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([childKey, child]) => leafStrings(child, childKey));
  }
  if (value == null) return [];
  const text = String(value).trim();
  if (!text || text.toUpperCase() === "N/A") return [];
  return [{ key, value: text }];
}

function addressFrom(source: Record<string, unknown>) {
  const leaves = leafStrings(source);
  const match = (parts: string[], exclude: string[] = []) =>
    leaves.find((item) => {
      const key = norm(item.key);
      if (exclude.some((part) => key.includes(part))) return false;
      return parts.some((part) => key.includes(part));
    })?.value ?? "";

  const streetNo = match(["streetno", "streetnumber", "houseno", "buildingno", "housenumber"]);
  const street = match(["address1", "adresse1", "addressline1", "streetname", "street", "road", "residence"], ["id", "code"]);
  const address1 = [streetNo, street].filter(Boolean).join(" ") || match(["address", "adresse"], ["id", "code", "type"]);
  const address2 = match(["address2", "adresse2", "addressline2", "city", "town", "quartier", "district", "area", "region"]);
  const addressId = match(["addressid", "adresseid", "addrid"]);
  return { address1, address2, addressId };
}

function displayValue(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.toUpperCase() === "N/A") return "—";
  return trimmed;
}

function addressLine(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.toUpperCase() === "N/A" || trimmed.toUpperCase() === "NA") return "NA";
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
  const [formError, setFormError] = useState<string | null>(null);
  const [replay, setReplay] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [profile, setProfile] = useState(SAMPLE);
  const resultRef = useRef<HTMLElement>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8) {
      setFormError("Renseignez le numéro sans le 228.");
      setShowResult(false);
      return;
    } 
    setFormError(null);
    rememberSearch({
      module: "identification",
      href: "/identification",
      summary: `Identification · ${digits}`,
      payload: { phone: digits },
    });
    try {
      const data = await querySubscriber(digits);
      const source = asRecord(data);
      const row = subscriberRow(data);
      if (!source || !row) {
        setFormError("Aucun abonné pour ce numéro.");
        setShowResult(false);
        return;
      }
      const address = addressFrom(source);
      setProfile({
        profileId: pick(row, ["profileId", "subscriberId", "id"]),
        login: pick(row, ["login", "userName"]),
        accountId: pick(row, ["accountId", "accountNo", "customerId"]),
        serviceId: pick(row, ["serviceId", "serviceType"]),
        serviceCode: pick(row, ["serviceCode", "service"]),
        lastName: pick(row, ["lastName", "nom", "surname", "familyName"]),
        firstName: pick(row, ["firstName", "prenoms", "prenom", "givenName"]),
        smsNumber: pick(row, ["smsNumber", "msisdn", "phone"]) || `228${digits}`,
        emailId: pick(row, ["emailId", "email"]),
        activationDate: pick(row, ["activationDate", "activeDate", "createdAt"]),
        address1: address.address1,
        address2: address.address2,
        addressId: address.addressId,
      });
      setShowResult(true);
    } catch (cause) {
      setShowResult(false);
      setFormError(cause instanceof Error ? cause.message : "L'identification a échoué.");
    }
  }

  useEffect(() => {
    function apply() {
      const payload = consumePrefill("identification");
      if (!payload?.phone) return;
      setPhone(payload.phone);
      setReplay(true);
    }
    apply();
    return subscribePrefill("identification", apply);
  }, []);

  useEffect(() => {
    if (!replay) return;
    setReplay(false);
    void onSubmit({ preventDefault() {} } as FormEvent<HTMLFormElement>);
  }, [replay]);

  useEffect(() => {
    if (!showResult) return;
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showResult]);

  const fullName = `${profile.firstName} ${profile.lastName}`.replace(/\s+/g, " ").trim();
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
          <SearchAlert message={formError} />
          <div className="mt-6">
            <button
              type="submit"
              className="btn btn-sm h-9 min-h-9 rounded-xl border-none bg-yas-yellow px-6 font-semibold text-yas-navy hover:bg-[#f0ce00]"
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
                {initials(profile.firstName, profile.lastName) || <IconUser className="size-7" />}
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
                {profile.serviceCode}
              </span>
              <span className="rounded-full bg-yas-yellow px-3 py-1 text-xs font-semibold text-yas-navy">
                {profile.serviceId.replaceAll("_", " ")}
              </span>
            </div>
          </header>
          <div className="mt-4 h-1.5 w-24 rounded-full bg-yas-yellow" />

          <div className="mt-6 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoSection title="Identifiants principaux">
              <InfoRow label="ID de profil" value={displayValue(profile.profileId)} />
              <InfoRow label="Login" value={displayValue(profile.login)} />
              <InfoRow label="ID de compte" value={displayValue(profile.accountId)} />
              <InfoRow label="ID de service" value={displayValue(profile.serviceId)} />
              <InfoRow label="Code de service" value={displayValue(profile.serviceCode)} />
            </InfoSection>

            <InfoSection title="Informations personnelles">
              <InfoRow label="Nom" value={displayValue(profile.lastName)} />
              <InfoRow label="Prénom" value={displayValue(profile.firstName)} />
              <InfoRow label="Numéro SMS" value={displayValue(profile.smsNumber)} />
              <InfoRow label="E-mail" value={displayValue(profile.emailId)} />
              <InfoRow label="Activation" value={formatDateTime(profile.activationDate)} />
            </InfoSection>

            <InfoSection title="Adresse">
              <InfoRow label="Adresse 1" value={addressLine(profile.address1)} />
              <InfoRow label="Adresse 2" value={addressLine(profile.address2)} />
              <InfoRow label="ID d'adresse" value={displayValue(profile.addressId)} />
            </InfoSection>
          </div>
        </article>
      ) : null}
    </section>
  );
}
