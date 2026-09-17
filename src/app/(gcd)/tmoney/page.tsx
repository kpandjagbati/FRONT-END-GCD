
"use client";

import { PdfGrayButton, PdfRedButton, VoirButton } from "@/components/ActionButtons";

export default function TmoneyPage() {
  return (
    <section className="flex justify-center pt-8">
      <form
        className="w-full max-w-5xl rounded-sm bg-white px-10 py-8 shadow-md"
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
          <VoirButton />
          <PdfRedButton />
          <PdfGrayButton />
        </div>
      </form>
    </section>
  );
}
