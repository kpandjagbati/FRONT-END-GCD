"use client";

import Link from "next/link";
import { useSessionDisplayName } from "@/lib/use-client";

const MODULES = [
  {
    href: "/appels",
    title: "Appels Détaillés",
    desc: "Rechercher un numéro, IMEI, IMSI ou appelé.",
    image: "/illustrations/appels.svg",
  },
  {
    href: "/identite",
    title: "Identités",
    desc: "Retrouver un client par nom et prénoms.",
    image: "/illustrations/identites.svg",
  },
  {
    href: "/identification",
    title: "Identification",
    desc: "Identifier un profil à partir du numéro.",
    image: "/illustrations/identification.svg",
  },
  {
    href: "/traitement",
    title: "Traitements",
    desc: "Lancer un traitement CSV en masse.",
    image: "/illustrations/traitements.svg",
  },
  {
    href: "/ftth-login",
    title: "FTTH Login",
    desc: "Récupérer le login d'une ligne fibre.",
    image: "/illustrations/ftth.svg",
  },
];

const cardClass =
  "flex items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_12px_32px_rgba(1,55,125,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(1,55,125,0.12)]";

function Illustration({ src }: { src: string }) {
  return (
    <span className="yas-illustration-well flex h-[76px] w-[96px] shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff]">
      <img src={src} alt="" className="yas-illustration h-14 w-[84px] object-contain" />
    </span>
  );
}

export default function AccueilPage() {
  const displayName = useSessionDisplayName();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-yas-navy md:text-3xl">
          {displayName
            ? `Bonjour ${displayName}, bienvenue sur le dashboard`
            : "Bienvenue sur le dashboard"}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Consultez les appels, identités, identifications et transactions Mixx by Yas.
        </p>
      </div>

      <div className="grid items-center gap-6 rounded-3xl bg-white px-8 py-6 shadow-[0_12px_32px_rgba(1,55,125,0.06)] md:grid-cols-[1fr_1fr]">
        <div>
          <p className="max-w-md text-sm font-medium leading-relaxed text-neutral-600">
            Tous les outils GetCallDetail au même endroit : appels, identités, Mixx by Yas,
            traitements CSV et login fibre.
          </p>
          <div className="mt-4 h-1.5 w-24 rounded-full bg-yas-yellow" />
        </div>
        <div className="hidden justify-end md:flex">
          <span className="yas-illustration-well flex h-44 w-full max-w-md items-center justify-center rounded-2xl bg-[#eef4ff] px-4">
            <img
              src="/illustrations/welcome.svg"
              alt=""
              className="yas-illustration h-40 w-auto max-w-full object-contain"
            />
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link href="/tmoney" className={`mixx-card border-l-[5px] border-yas-mixx ${cardClass}`}>
          <span className="yas-illustration-well flex h-[76px] w-[96px] shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff]">
            <img
              src="/logo-mixx.svg"
              alt=""
              className="mixx-card-logo h-8 w-auto object-contain"
            />
          </span>
          <div>
            <h3 className="font-bold text-yas-navy">Mixx by Yas</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Rechercher une transaction par numéro et période.
            </p>
          </div>
        </Link>
        {MODULES.map((item) => (
          <Link key={item.href} href={item.href} className={cardClass}>
            <Illustration src={item.image} />
            <div>
              <h3 className="font-bold text-yas-navy">{item.title}</h3>
              <p className="mt-1 text-sm text-neutral-500">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
