import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#eef2f7] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="w-full max-w-md rounded-3xl bg-white px-6 py-8 text-center shadow-[0_24px_60px_rgba(1,55,125,0.10)] sm:px-10 sm:py-10">
        <img
          src="/logo-yas-yellow.svg"
          alt="Yas"
          width={64}
          height={58}
          className="mx-auto h-auto w-14 object-contain"
        />
        <img
          src="/illustrations/not-found.svg"
          alt=""
          className="mx-auto mt-6 h-auto w-[180px] object-contain sm:w-[220px]"
        />
        <p className="mt-6 text-sm font-bold tracking-[0.2em] text-neutral-400">404</p>
        <h1 className="mt-2 text-xl font-bold text-neutral-800 sm:text-2xl">Page introuvable</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-relaxed text-neutral-500">
          Cette adresse n&apos;existe pas dans GetCallDetail.
        </p>
        <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-yas-yellow" />
        <Link
          href="/accueil"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-yas-yellow px-6 text-sm font-semibold text-yas-navy transition hover:bg-[#f0ce00]"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
