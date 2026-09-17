"use client";

import { PdfGrayButton, PdfRedButton, VoirButton } from "@/components/ActionButtons";
import PageHero from "@/components/PageHero";
import YasDataTable, { type YasColumn } from "@/components/YasDataTable";
import YasLoadingOverlay from "@/components/YasLoadingOverlay";
import YasModal from "@/components/YasModal";
import { searchMixxMock, type MixxRow } from "@/lib/mock-mixx";
import { useVoirSearch } from "@/lib/use-voir-search";

const COLUMNS: YasColumn<MixxRow>[] = [
  { key: "date", label: "Date" },
  { key: "heure", label: "Heure" },
  { key: "numero", label: "Numero" },
  { key: "reference", label: "Référence" },
  { key: "type", label: "Type" },
  { key: "montant", label: "Montant" },
  { key: "statut", label: "Statut" },
];

export default function TmoneyPage() {
  const { loading, results, run, reset } = useVoirSearch(searchMixxMock);

  return (
    <section className="space-y-8">
      <YasLoadingOverlay open={loading} />
      <PageHero
        title="Mixx by Yas"
        description="Rechercher une transaction par numéro et période."
        image="/logo-mixx.svg"
        imageClassName="mixx-page-logo h-16 w-auto max-w-full object-contain"
      />

      <div className="flex justify-center pt-4">
        <form
          className="yas-card mixx-page-card w-full max-w-5xl"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="yas-label">
                Numero<span className="text-red-500">*</span>
              </label>
              <input className="yas-input" />
            </div>
            <div>
              <label className="yas-label">
                Date debut<span className="text-red-500">*</span>
              </label>
              <input type="text" placeholder="jj/mm/aaaa" className="yas-input" />
            </div>
            <div>
              <label className="yas-label">
                Date fin<span className="text-red-500">*</span>
              </label>
              <input type="text" placeholder="jj/mm/aaaa" className="yas-input" />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <VoirButton onClick={run} />
            <PdfRedButton />
            <PdfGrayButton />
          </div>
        </form>
      </div>

      <YasModal open={Boolean(results)} title="Transactions Mixx by Yas" onClose={reset} wide>
        {results ? <YasDataTable columns={COLUMNS} rows={results} embedded /> : null}
      </YasModal>
    </section>
  );
}
