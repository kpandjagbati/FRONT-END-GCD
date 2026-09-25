"use client";

import { PdfGrayButton, PdfRedButton, VoirButton } from "@/components/ActionButtons";
import PageHero from "@/components/PageHero";
import YasDataTable, { type YasColumn } from "@/components/YasDataTable";
import YasLoadingOverlay from "@/components/YasLoadingOverlay";
import YasModal from "@/components/YasModal";
import { formatDateTime } from "@/lib/format-date";
import { searchIdentitesMock, type IdentiteRow } from "@/lib/mock-identite";
import { useVoirSearch } from "@/lib/use-voir-search";

const COLUMNS: YasColumn<IdentiteRow>[] = [
  { key: "nom", label: "Nom" },
  { key: "prenoms", label: "Prénoms" },
  { key: "naissance", label: "Date de naissance", render: (row) => formatDateTime(row.naissance) },
  { key: "typePiece", label: "Type de pièce" },
  { key: "numPiece", label: "N° Pièce" },
  { key: "mobile", label: "Mobile" },
  { key: "dateCreation", label: "Date création", render: (row) => formatDateTime(row.dateCreation) },
  {
    key: "dateActualisation",
    label: "Date actualisation",
    render: (row) => formatDateTime(row.dateActualisation),
  },
];

export default function IdentitePage() {
  const { loading, results, run, reset } = useVoirSearch(searchIdentitesMock);

  return (
    <section className="my-auto w-full min-w-0 py-3 sm:py-6">
      <YasLoadingOverlay open={loading} />
      <PageHero
        title="Identités"
        description="Retrouver un client par nom et prénoms."
        image="/illustrations/identites.svg"
      >
        <form
          className="yas-card w-full max-w-xl text-center"
          onSubmit={(event) => event.preventDefault()}
        >
          <h2 className="yas-title mb-6">Veuillez renseigner le nom ou / et le prenoms</h2>
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
          <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-4">
            <VoirButton onClick={run} />
            <PdfRedButton />
            <PdfGrayButton />
          </div>
        </form>
      </PageHero>

      <YasModal open={Boolean(results)} title="Résultats identités" onClose={reset} wide>
        {results ? <YasDataTable columns={COLUMNS} rows={results} embedded /> : null}
      </YasModal>
    </section>
  );
}
