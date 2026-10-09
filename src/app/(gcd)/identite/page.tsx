/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { PdfGrayButton, PdfRedButton, VoirButton } from "@/components/ActionButtons";
import PageHero from "@/components/PageHero";
import { EmptyResults, SearchAlert } from "@/components/SearchFeedback";
import YasDataTable, { type YasColumn } from "@/components/YasDataTable";
import YasLoadingOverlay from "@/components/YasLoadingOverlay";
import YasModal from "@/components/YasModal";
import { EXPORT_TOAST, useYasToast, YasToast } from "@/components/YasToast";
import { formatDateTime } from "@/lib/format-date";
import { saveBlob } from "@/lib/downloads";
import { asRecords, downloadFile, field, flattenRow, generateIdentitiesFile, generatedFileName, searchIdentities } from "@/lib/gcd-api";
import { type IdentiteRow } from "@/lib/types-identite";
import { consumePrefill, rememberSearch, subscribePrefill } from "@/lib/recent-searches";
import { validateRequired } from "@/lib/search-guards";
import { useVoirSearch } from "@/lib/use-voir-search";

const COLUMNS: YasColumn<IdentiteRow>[] = [
  { key: "nom", label: "Nom", emphasis: true },
  { key: "prenoms", label: "Prénoms", emphasis: true },
  { key: "naissance", label: "Date de naissance", render: (row) => formatDateTime(row.naissance) },
  { key: "typePiece", label: "Type de pièce" },
  { key: "numPiece", label: "N° Pièce", emphasis: true },
  { key: "mobile", label: "Mobile", emphasis: true },
  { key: "dateCreation", label: "Date création", render: (row) => formatDateTime(row.dateCreation) },
  {
    key: "dateActualisation",
    label: "Date d'activation",
    render: (row) => formatDateTime(row.dateActualisation),
  },
];

function loose(row: Record<string, unknown>, parts: string[], exclude: string[] = []) {
  for (const [name, value] of Object.entries(row)) {
    if (value == null || typeof value === "object") continue;
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (exclude.some((part) => key.includes(part))) continue;
    if (!parts.some((part) => key.includes(part))) continue;
    const text = String(value).trim();
    if (text && text.toUpperCase() !== "N/A") return text;
  }
  return "";
}

function toIdentiteRow(source: Record<string, unknown>, index: number): IdentiteRow {
  const row = flattenRow(source);
  return {
    id: field(row, ["id"]) || String(index + 1),
    nom: field(row, ["nom", "lastName", "lastname", "surname"]),
    prenoms: field(row, ["prenoms", "prenom", "firstName", "firstname", "givenName"]),
    naissance: field(row, ["naissance", "birthDate", "dateOfBirth", "dateNaissance", "dob"]),
    typePiece: field(row, [
      "typePiece",
      "idType",
      "documentType",
      "pieceType",
      "identityType",
      "cardType",
      "typeIdentite",
      "typeDocument",
    ]),
    numPiece: field(row, [
      "numPiece",
      "idNumber",
      "documentNumber",
      "pieceNumber",
      "identityNumber",
      "cardNumber",
      "numeroPiece",
      "numeroIdentite",
      "cin",
    ]),
    mobile:
      field(row, ["mobile", "msisdn", "phone", "phoneNumber", "mobileNumber", "telephone", "numero", "gsm"]) ||
      loose(row, ["mobile", "msisdn", "phone", "telephone", "gsm"], ["piece", "identit", "document", "naissance", "birth"]),
    dateCreation:
      field(row, [
        "dateCreation",
        "creationDate",
        "createdAt",
        "createdDate",
        "registrationDate",
        "dateEnregistrement",
        "dateOuverture",
        "subscriptionDate",
      ]) ||
      loose(row, ["creation", "created", "enregistre", "registration", "ouverture", "souscript"], ["activ", "naiss", "birth", "update", "actual"]),
    dateActualisation: field(row, [
      "dateActivation",
      "activationDate",
      "activatedAt",
      "activeDate",
      "dateActualisation",
      "updateDate",
    ]),
  };
}

export default function IdentitePage() {
  const [nom, setNom] = useState("");
  const [prenoms, setPrenoms] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"pdf-red" | "pdf-gray" | null>(null);
  const [replay, setReplay] = useState(false);
  const { toast, showToast, hideToast } = useYasToast();
  const loadIdentites = useCallback(
    () => searchIdentities(nom, prenoms).then((data) => asRecords(data).map(toIdentiteRow)),
    [nom, prenoms],
  );
  const { loading, results, error, run, reset } = useVoirSearch(loadIdentites);

  useEffect(() => {
    function apply() {
      const payload = consumePrefill("identites");
      if (!payload) return;
      setNom(payload.nom ?? "");
      setPrenoms(payload.prenoms ?? "");
      setReplay(true);
    }
    apply();
    return subscribePrefill("identites", apply);
  }, []);

  useEffect(() => {
    if (!replay) return;
    setReplay(false);
    void handleVoir();
  }, [replay]);

  async function handleVoir() {
    const problem = validateRequired(`${nom}${prenoms}`, "Renseignez le nom ou les prénoms.");
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError(null);
    rememberSearch({
      module: "identites",
      href: "/identite",
      summary: `Identités · ${[nom, prenoms].filter(Boolean).join(" ")}`,
      payload: { nom, prenoms },
    });
    await run();
  }

  async function handleGenerate(secureFile: boolean) {
    const problem = validateRequired(`${nom}${prenoms}`, "Renseignez le nom ou les prénoms.");
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError(null);
    const target = secureFile ? "pdf-red" : "pdf-gray";
    const notice = EXPORT_TOAST[target];
    showToast(notice.title, notice.message);
    setExporting(target);
    try {
      const body = { lastName: nom.trim(), firstName: prenoms.trim(), ...(secureFile ? { secureFile: true } : {}) };
      const generated = await generateIdentitiesFile(nom, prenoms, secureFile);
      const filename = generatedFileName(generated);
      if (!filename) throw new Error("Le serveur n'a pas renvoyé de fichier.");
      saveBlob(filename, await downloadFile(filename, body));
      if (generated?.passwordFileName) {
        saveBlob(generated.passwordFileName, await downloadFile(generated.passwordFileName, body));
      }
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "La génération du fichier a échoué.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <section className="my-auto w-full min-w-0 py-3 sm:py-6">
      <YasLoadingOverlay open={loading || Boolean(exporting)} />
      <YasToast
        open={Boolean(toast)}
        title={toast?.title ?? ""}
        message={toast?.message}
        tone={toast?.tone}
        onClose={hideToast}
      />
      <PageHero
        title="Identités"
        description="Retrouver un client par nom et prénoms."
        image="/illustrations/identites.svg"
      >
        <form
          className="yas-card w-full max-w-xl text-center"
          onSubmit={(event) => event.preventDefault()}
        >
          <h2 className="yas-title mb-4 text-balance sm:mb-6">
            Veuillez renseigner le nom ou / et le prenoms
          </h2>
          <div className="mx-auto grid max-w-xl gap-4 sm:gap-6 md:grid-cols-2">
            <div className="text-left">
              <label className="yas-label">Nom</label>
              <input className="yas-input" name="nom" value={nom} onChange={(event) => setNom(event.target.value)} />
            </div>
            <div className="text-left">
              <label className="yas-label">Prenoms</label>
              <input
                className="yas-input"
                name="prenoms"
                value={prenoms}
                onChange={(event) => setPrenoms(event.target.value)}
              />
            </div>
          </div>
          <SearchAlert message={formError || error} />
          <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-4">
            <VoirButton onClick={handleVoir} />
            <PdfRedButton disabled={Boolean(exporting)} onClick={() => void handleGenerate(true)} />
            <PdfGrayButton disabled={Boolean(exporting)} onClick={() => void handleGenerate(false)} />
          </div>
        </form>
      </PageHero>

      <YasModal open={Boolean(results)} title="Résultats identités" onClose={reset} wide>
        {results ? (
          results.length === 0 ? (
            <EmptyResults message="Aucune identité pour cette recherche." />
          ) : (
            <YasDataTable columns={COLUMNS} rows={results} embedded />
          )
        ) : null}
      </YasModal>
    </section>
  );
}
