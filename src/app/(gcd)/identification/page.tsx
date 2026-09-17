"use client";

import { FormEvent, useState } from "react";
import { IconEye } from "@/components/icons";

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

export default function IdentificationPage() {
  const [phone, setPhone] = useState("");
  const [showResult, setShowResult] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowResult(true);
  }

  return (
    <section className="space-y-6 pt-4">
      <form
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-3xl rounded-sm bg-white px-10 py-8 text-center shadow-md"
      >
        <h1 className="yas-title mb-6">
          Veuillez renseigner le numéro de téléphone sans 228
        </h1>
        <div className="mx-auto max-w-sm text-left">
          <label className="yas-label">Numéro de téléphone</label>
          <input
            className="yas-input"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
        <div className="mt-6">
          <button type="submit" className="btn btn-sm h-9 min-h-9 rounded-md border-none bg-[#fcd90b] px-6 text-neutral-800 hover:bg-[#f0ce00]">
            Valider
            <IconEye className="size-4" />
          </button>
        </div>
      </form>

      {showResult ? (
        <article className="rounded-sm bg-white p-8 shadow-sm">
          <h2 className="yas-title mb-6">Information des identités</h2>
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <h3 className="font-semibold text-neutral-800">Identifiants principaux</h3>
              <p>ID de profil:{SAMPLE.profileId}</p>
              <p>Login: {SAMPLE.login}</p>
              <p>ID de compte:{SAMPLE.accountId}</p>
              <p>ID de service:{SAMPLE.serviceId}</p>
              <p>Code de service:{SAMPLE.serviceCode}</p>
            </div>
            <div className="space-y-2 text-sm">
              <h3 className="font-semibold text-neutral-800">Informations personnelles</h3>
              <p>Nom: {SAMPLE.lastName}</p>
              <p>Prénom: {SAMPLE.firstName}</p>
              <p>Numéro SMS: {SAMPLE.smsNumber}</p>
              <p>Id de notification d&apos;email: {SAMPLE.emailId}</p>
              <p>Date d&apos;activation: {SAMPLE.activationDate}</p>
              <p className="pt-2 font-semibold underline">Adresse</p>
              <p>Adresse 1: {SAMPLE.address1}</p>
              <p>Adresse 2: {SAMPLE.address2}</p>
              <p>ID d&apos;adresse: {SAMPLE.addressId}</p>
            </div>
          </div>
        </article>
      ) : null}
    </section>
  );
}
