"use client";

import { PdfGrayButton, PdfRedButton, VoirButton } from "@/components/ActionButtons";
import YasDataTable, { type YasColumn } from "@/components/YasDataTable";
import YasLoadingOverlay from "@/components/YasLoadingOverlay";
import YasModal from "@/components/YasModal";
import { searchIdentitesMock, type IdentiteRow } from "@/lib/mock-identite";
import { useVoirSearch } from "@/lib/use-voir-search";

const COLUMNS: YasColumn<IdentiteRow>[] = [
  { key: "nom", label: "Nom" },
  { key: "prenoms", label: "Prénoms" },
  { key: "naissance", label: "Date de naissance" },
  { key: "typePiece", label: "Type de pièce" },
  { key: "numPiece", label: "N° Pièce" },
  { key: "mobile", label: "Mobile" },
  { key: "dateCreation", label: "Date création" },
  { key: "dateActualisation", label: "Date actualisation" },
];

export default function IdentitePage() {
  const { loading, results, run, reset } = useVoirSearch(searchIdentitesMock);

  return (
    <section className="space-y-8">
      <YasLoadingOverlay open={loading} />
      <div className="grid items-center gap-6 rounded-3xl bg-white px-8 py-6 shadow-[0_12px_32px_rgba(1,55,125,0.06)] md:grid-cols-[1fr_1fr]">
        <div>
          <h1 className="text-2xl font-bold text-yas-navy">Identités</h1>
          <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-neutral-600">
            Retrouver un client par nom et prénoms.
          </p>
          <div className="mt-4 h-1.5 w-24 rounded-full bg-yas-yellow" />
        </div>
        <div className="flex justify-center md:justify-end">
          <span className="yas-illustration-well flex h-44 w-full max-w-md items-center justify-center rounded-2xl bg-[#eef4ff] px-4">
            <img
              src="/illustrations/identites.svg"
              alt=""
              className="yas-illustration h-40 w-auto max-w-full object-contain"
            />
          </span>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <form className="yas-card w-full max-w-3xl text-center" onSubmit={(event) => event.preventDefault()}>
          <h2 className="yas-title mb-6">
            Veuillez renseigner le nom ou / et le prenoms
          </h2>
          <div className="mx-auto grid max-w-xl gap-6 md:grid-cols-2">
            <div className="text-left">
              <label className="yas-label">Nom</label>
              <input className="yas-input" name="nom" />
            </div>
            <div className="text-left">
              <label className="yas-label">Prenoms</label>
              <input className="yas-input" name="prenoms" />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <VoirButton onClick={run} />
            <PdfRedButton />
            <PdfGrayButton />
          </div>
        </form>
      </div>

      <YasModal open={Boolean(results)} title="Résultats identités" onClose={reset} wide>
        {results ? <YasDataTable columns={COLUMNS} rows={results} embedded /> : null}
      </YasModal>
    </section>
  );
}
