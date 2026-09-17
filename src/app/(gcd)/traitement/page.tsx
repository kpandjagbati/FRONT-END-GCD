"use client";

const CSV_ROWS = [
  ["msisdn", "22892XXXXXX", "05/04/2022", "15/04/2022"],
  ["msisdn", "22890XXXXXX", "10/04/2022", "20/04/2022"],
  ["imei", "652XXXX123654X", "10/04/2022", "22/04/2022"],
  ["imsi", "123XXXX896354X", "11/04/2022", "22/04/2022"],
];

export default function TraitementPage() {
  return (
    <section className="flex justify-center pt-2">
      <div className="yas-card w-full max-w-4xl text-center">
        <div className="mx-auto max-w-2xl rounded-2xl bg-[#c45c5c] px-6 py-4 text-sm leading-relaxed text-white">
          <p className="font-semibold">!!! INFO !!!</p>
          <p>
            Les fichiers à renseigner sont exclusivement de format CSV et doit contenir
            respectivement des colonnes type (msisdn, imei, imsi), valeur (valeur de msisdn, valeur
            de imei, valeur de imsi),date_debut et date_fin
          </p>
        </div>

        <p className="mt-6 text-sm font-medium text-neutral-800">Exemple de fichier CSV:</p>
        <div className="mx-auto mt-2 max-w-xl overflow-x-auto">
          <table className="table table-xs border border-neutral-400">
            <thead>
              <tr className="border-neutral-400 font-semibold text-neutral-800">
                <th className="border border-neutral-400">type</th>
                <th className="border border-neutral-400">valeur</th>
                <th className="border border-neutral-400">date_debut</th>
                <th className="border border-neutral-400">date_fin</th>
              </tr>
            </thead>
            <tbody>
              {CSV_ROWS.map((row) => (
                <tr key={row.join("-")} className="border-neutral-400">
                  {row.map((cell) => (
                    <td key={cell} className="border border-neutral-400">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="yas-title mt-8">Veuillez sélectionner le fichier à traiter</p>
        <div className="mt-3 flex items-center justify-center gap-3 text-sm">
          <input
            type="file"
            accept=".csv"
            className="max-w-xs text-sm file:mr-3 file:rounded-md file:border file:border-neutral-400 file:bg-white file:px-2 file:py-0.5"
          />
        </div>

        <div className="mt-8 flex justify-end">
          <button type="button" className="btn h-10 min-h-10 rounded-xl border-none bg-yas-navy px-5 font-semibold text-white">
            Proceder au traitement
          </button>
        </div>
      </div>
    </section>
  );
}
