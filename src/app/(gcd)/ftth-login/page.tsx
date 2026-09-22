"use client";

import { FormEvent, useState } from "react";
import { VoirButton } from "@/components/ActionButtons";
import PageHero from "@/components/PageHero";
import YasLoadingOverlay from "@/components/YasLoadingOverlay";
import YasModal from "@/components/YasModal";
import { IconCopy, IconLogin, IconPhone } from "@/components/icons";
import { searchFtthMock } from "@/lib/mock-ftth";
import { useVoirSearch } from "@/lib/use-voir-search";

function formatLigne(value: string) {
  return value.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

export default function FtthLoginPage() {
  const [ligne, setLigne] = useState("");
  const [copied, setCopied] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { loading, results, run, reset } = useVoirSearch(() => searchFtthMock(ligne));
  const match = results?.[0];

  function onLigneChange(value: string) {
    setLigne(value.replace(/\D/g, "").slice(0, 8));
    setCopied(false);
    if (results) reset();
    setDetailsOpen(false);
  }

  async function handleVoir() {
    setCopied(false);
    await run();
    setDetailsOpen(true);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleVoir();
  }

  async function copyLogin() {
    if (!match?.login) return;
    await navigator.clipboard.writeText(match.login);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const displayedLigne = formatLigne(ligne || match?.ligne.replace(/^228/, "") || "");

  return (
    <section className="my-auto w-full py-6">
      <YasLoadingOverlay open={loading} />
      <PageHero
        title="FTTH Login"
        description="Récupérer le login d'une ligne fibre."
        image="/illustrations/ftth-hero.svg"
      >
        <form className="yas-card w-full max-w-xl" onSubmit={onSubmit}>
          <h2 className="yas-title text-center">Numéro de la ligne</h2>
          <p className="mx-auto mt-2 max-w-sm text-center text-sm font-medium leading-relaxed text-neutral-500">
            Saisissez le numéro pour afficher le login fibre associé.
          </p>

          <label className="yas-label mt-6" htmlFor="ftth-ligne">
            Numéro de la ligne
          </label>
          <div className="flex overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow focus-within:border-yas-navy focus-within:shadow-[0_0_0_3px_rgba(1,55,125,0.12)]">
            <span className="flex items-center gap-1.5 border-r border-neutral-200 bg-[#f7f9fc] px-3 text-sm font-semibold text-yas-navy">
              <IconPhone className="size-4" />
              228
            </span>
            <input
              id="ftth-ligne"
              className="h-11 w-full border-0 bg-transparent px-3 text-sm text-neutral-800 outline-none placeholder:italic placeholder:text-neutral-400"
              inputMode="numeric"
              autoComplete="off"
              placeholder="90 12 34 56"
              value={formatLigne(ligne)}
              onChange={(event) => onLigneChange(event.target.value)}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-[#f7f9fc] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              Login demandé
            </p>
            {match ? (
              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-lg font-bold text-yas-navy">{match.login}</p>
                  <p className="mt-1 text-xs font-medium text-neutral-500">228 {displayedLigne}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyLogin()}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-yas-navy hover:bg-neutral-50"
                >
                  <IconCopy className="size-3.5" />
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-yas-navy shadow-[0_1px_0_rgba(1,55,125,0.06)]">
                  <IconLogin className="size-5" />
                </span>
                <p className="text-sm font-medium text-neutral-500">
                  Le login s’affichera ici après la recherche.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <VoirButton blue onClick={() => void handleVoir()} />
          </div>
        </form>
      </PageHero>

      <YasModal open={detailsOpen && Boolean(match)} title="Login fibre" onClose={() => setDetailsOpen(false)}>
        {match ? (
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Login</p>
            <p className="mt-3 break-all font-mono text-2xl font-bold text-yas-navy sm:text-3xl">
              {match.login}
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-500">228 {displayedLigne}</p>
            <button
              type="button"
              onClick={() => void copyLogin()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yas-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#012d66]"
            >
              <IconCopy className="size-4" />
              {copied ? "Copié" : "Copier le login"}
            </button>
          </div>
        ) : null}
      </YasModal>
    </section>
  );
}
