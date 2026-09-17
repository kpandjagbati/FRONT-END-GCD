"use client";

import { PdfGrayButton, PdfRedButton, VoirButton } from "@/components/ActionButtons";

export default function IdentitePage() {
  return (
    <section className="flex justify-center pt-6">
      <form
        className="w-full max-w-3xl rounded-sm bg-white px-10 py-8 text-center shadow-md"
        onSubmit={(event) => event.preventDefault()}
      >
        <h1 className="yas-title mb-6">
          Veuillez renseigner le nom ou / et le prenoms
        </h1>
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
          <VoirButton />
          <PdfRedButton />
          <PdfGrayButton />
        </div>
      </form>
    </section>
  );
}
