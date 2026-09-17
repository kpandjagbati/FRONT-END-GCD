"use client";

import { VoirButton } from "@/components/ActionButtons";

export default function FtthLoginPage() {
  return (
    <section className="flex justify-center pt-8">
      <form
        className="w-full max-w-3xl rounded-sm bg-white px-10 py-8 shadow-md"
        onSubmit={(event) => event.preventDefault()}
      >
        <h1 className="yas-title mb-6 text-center">
          Veuillez renseigner le Numéro de la ligne
        </h1>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <label className="yas-label">Numéro de la ligne</label>
            <input className="yas-input" />
          </div>
          <div>
            <p className="yas-label">Le Login demandé est :</p>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <VoirButton blue />
        </div>
      </form>
    </section>
  );
}
