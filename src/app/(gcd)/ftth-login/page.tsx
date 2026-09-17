"use client";

import { VoirButton } from "@/components/ActionButtons";
import PageHero from "@/components/PageHero";
import YasDataTable, { type YasColumn } from "@/components/YasDataTable";
import YasLoadingOverlay from "@/components/YasLoadingOverlay";
import YasModal from "@/components/YasModal";
import { searchFtthMock, type FtthRow } from "@/lib/mock-ftth";
import { useVoirSearch } from "@/lib/use-voir-search";

const COLUMNS: YasColumn<FtthRow>[] = [
  { key: "ligne", label: "Numéro de la ligne" },
  { key: "login", label: "Login" },
  { key: "offre", label: "Offre" },
  { key: "statut", label: "Statut" },
  { key: "dateCreation", label: "Date création" },
];

export default function FtthLoginPage() {
  const { loading, results, run, reset } = useVoirSearch(searchFtthMock);
  const login = results?.[0]?.login ?? "";

  return (
    <section className="space-y-8">
      <YasLoadingOverlay open={loading} />
      <PageHero
        title="FTTH Login"
        description="Récupérer le login d'une ligne fibre."
        image="/illustrations/ftth.svg"
      />

      <div className="flex justify-center pt-4">
        <form className="yas-card w-full max-w-3xl" onSubmit={(event) => event.preventDefault()}>
          <h2 className="yas-title mb-6 text-center">
            Veuillez renseigner le Numéro de la ligne
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <label className="yas-label">Numéro de la ligne</label>
              <input className="yas-input" />
            </div>
            <div>
              <p className="yas-label">Le Login demandé est :</p>
              <p className="mt-2 text-sm font-semibold text-yas-navy">{login || "—"}</p>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <VoirButton blue onClick={run} />
          </div>
        </form>
      </div>

      <YasModal open={Boolean(results)} title="Login fibre" onClose={reset} wide>
        {results ? <YasDataTable columns={COLUMNS} rows={results} embedded /> : null}
      </YasModal>
    </section>
  );
}
