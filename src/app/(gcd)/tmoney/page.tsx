/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { PdfGrayButton, PdfRedButton, VoirButton } from "@/components/ActionButtons";
import DateField from "@/components/DateField";
import PageHero from "@/components/PageHero";
import { EmptyResults, SearchAlert } from "@/components/SearchFeedback";
import YasDataTable, { type YasColumn } from "@/components/YasDataTable";
import YasLoadingOverlay from "@/components/YasLoadingOverlay";
import YasModal from "@/components/YasModal";
import { formatDateTime } from "@/lib/format-date";
import { saveBlob } from "@/lib/downloads";
import { asRecords, downloadFile, field, generateTmoneyFile, generatedFileName, searchTmoney } from "@/lib/gcd-api";
import { type MixxRow } from "@/lib/types-mixx";
import { consumePrefill, rememberSearch, subscribePrefill } from "@/lib/recent-searches";
import { validatePeriod, validateRequired } from "@/lib/search-guards";
import { useVoirSearch } from "@/lib/use-voir-search";

const COLUMNS: YasColumn<MixxRow>[] = [
  { key: "date", label: "Date", render: (row) => formatDateTime(row.date) },
  { key: "heure", label: "Heure" },
  { key: "numero", label: "Numero", emphasis: true },
  { key: "reference", label: "Référence", emphasis: true },
  { key: "type", label: "Type" },
  { key: "montant", label: "Montant", emphasis: true, align: "right" },
  { key: "statut", label: "Statut", emphasis: true },
];

function toMixxRow(row: Record<string, unknown>, index: number): MixxRow {
  return {
    id: field(row, ["id"]) || String(index + 1),
    date: field(row, ["date", "transactionDate"]),
    heure: field(row, ["heure", "time"]),
    numero: field(row, ["numero", "msisdn", "phone"]),
    reference: field(row, ["reference", "ref", "transactionId"]),
    type: field(row, ["type", "transactionType"]),
    montant: field(row, ["montant", "amount"]),
    statut: field(row, ["statut", "status"]),
  };
}

export default function TmoneyPage() {
  const [numero, setNumero] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"pdf-red" | "pdf-gray" | null>(null);
  const [replay, setReplay] = useState(false);
  const loadMixx = useCallback(
    () =>
      searchTmoney(numero, dateDebut, dateFin).then((data) => asRecords(data).map(toMixxRow)),
    [dateDebut, dateFin, numero],
  );
  const { loading, results, error, run, reset } = useVoirSearch(loadMixx);

  useEffect(() => {
    function apply() {
      const payload = consumePrefill("mixx");
      if (!payload) return;
      setNumero(payload.numero ?? "");
      setDateDebut(payload.dateDebut ?? "");
      setDateFin(payload.dateFin ?? "");
      setReplay(true);
    }
    apply();
    return subscribePrefill("mixx", apply);
  }, []);

  useEffect(() => {
    if (!replay) return;
    setReplay(false);
    void handleVoir();
  }, [replay]);

  async function handleVoir() {
    const problem = validateRequired(numero, "Renseignez le numéro.") || validatePeriod(dateDebut, dateFin);
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError(null);
    rememberSearch({
      module: "mixx",
      href: "/tmoney",
      summary: `Mixx · ${numero.trim()} · ${dateDebut} → ${dateFin}`,
      payload: { numero, dateDebut, dateFin },
    });
    await run();
  }

  async function handleGenerate(secureFile: boolean) {
    const problem = validateRequired(numero, "Renseignez le numéro.") || validatePeriod(dateDebut, dateFin);
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError(null);
    setExporting(secureFile ? "pdf-red" : "pdf-gray");
    try {
      const body = {
        searchValue: numero.trim(),
        startDate: dateDebut,
        endDate: dateFin,
        ...(secureFile ? { secureFile: true } : {}),
      };
      const generated = await generateTmoneyFile(numero, dateDebut, dateFin, secureFile);
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
      <PageHero
        title="Mixx by Yas"
        description="Rechercher une transaction par numéro et période."
        image="/illustrations/welcome.svg"
      >
        <form
          className="yas-card mixx-page-card w-full max-w-xl"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="grid gap-5">
            <div>
              <label className="yas-label">
                Numero<span className="text-red-500">*</span>
              </label>
              <input className="yas-input" value={numero} onChange={(event) => setNumero(event.target.value)} />
            </div>
            <div>
              <label className="yas-label">
                Date debut<span className="text-red-500">*</span>
              </label>
              <DateField name="dateDebut" value={dateDebut} onChange={setDateDebut} />
            </div>
            <div>
              <label className="yas-label">
                Date fin<span className="text-red-500">*</span>
              </label>
              <DateField name="dateFin" value={dateFin} onChange={setDateFin} />
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

      <YasModal open={Boolean(results)} title="Transactions Mixx by Yas" onClose={reset} wide>
        {results ? (
          results.length === 0 ? (
            <EmptyResults message="Aucune transaction pour cette recherche." />
          ) : (
            <YasDataTable columns={COLUMNS} rows={results} embedded />
          )
        ) : null}
      </YasModal>
    </section>
  );
}
