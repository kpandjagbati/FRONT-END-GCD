"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { IconArrowRight } from "@/components/icons";
import { useSessionDisplayName } from "@/lib/use-client";

gsap.registerPlugin(useGSAP);

const SLIDES = [
  { src: "/illustrations/welcome.svg", label: "GetCallDetail" },
  { src: "/illustrations/appels-hero.svg", label: "Appels Détaillés" },
  { src: "/illustrations/identites.svg", label: "Identités" },
  { src: "/illustrations/identification.svg", label: "Identification" },
  { src: "/illustrations/traitements.svg", label: "Traitements" },
  { src: "/illustrations/ftth-hero.svg", label: "FTTH Login" },
];

type HomeModule = {
  href: string;
  title: string;
  desc: string;
  image: string;
  imageDark?: string;
};

const MODULES: HomeModule[] = [
  {
    href: "/tmoney",
    title: "Mixx by Yas",
    desc: "Transactions par numéro et période.",
    image: "/logo-mixx.svg",
    imageDark: "/logo-mixx-on-blue.svg",
  },
  {
    href: "/appels",
    title: "Appels Détaillés",
    desc: "Numéro, IMEI, IMSI ou appelé.",
    image: "/illustrations/appels.svg",
  },
  {
    href: "/identite",
    title: "Identités",
    desc: "Client par nom et prénoms.",
    image: "/illustrations/identites.svg",
  },
  {
    href: "/identification",
    title: "Identification",
    desc: "Profil à partir du numéro.",
    image: "/illustrations/identification.svg",
  },
  {
    href: "/traitement",
    title: "Traitements",
    desc: "Traitement CSV en masse.",
    image: "/illustrations/traitements.svg",
  },
  {
    href: "/ftth-login",
    title: "FTTH Login",
    desc: "Login d'une ligne fibre.",
    image: "/illustrations/ftth.svg",
  },
];

const LEFT_MODULES = MODULES.slice(0, 3);
const RIGHT_MODULES = MODULES.slice(3);

function ModuleCard({
  item,
  wide = false,
}: Readonly<{
  item: (typeof MODULES)[number];
  wide?: boolean;
}>) {
  return (
    <Link
      href={item.href}
      className={`dash-card group flex h-full overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_rgba(1,55,125,0.06)] ${
        wide ? "min-h-[8.5rem] flex-row items-center gap-4 px-5 py-4 sm:min-h-[9.5rem] sm:gap-5 sm:px-6 sm:py-5" : "flex-col p-3.5 sm:p-4"
      }`}
    >
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden ${
          wide ? "size-[5.5rem] sm:size-[6.75rem]" : "h-[4.75rem] w-full sm:h-[5.25rem]"
        }`}
      >
        <img
          src={item.image}
          alt=""
          className={`w-auto max-w-full object-contain ${wide ? "h-[4.75rem] sm:h-[5.5rem]" : "h-16 sm:h-[4.25rem]"} ${
            item.imageDark ? "dark:hidden" : ""
          }`}
        />
        {item.imageDark ? (
          <img
            src={item.imageDark}
            alt=""
            className={`hidden w-auto max-w-full object-contain dark:block ${wide ? "h-[4.75rem] sm:h-[5.5rem]" : "h-16 sm:h-[4.25rem]"}`}
          />
        ) : null}
      </span>
      <span className={`min-w-0 ${wide ? "flex-1" : "pt-1"}`}>
        <h3 className={`font-bold text-yas-navy ${wide ? "text-lg sm:text-xl" : "text-sm sm:text-base"}`}>{item.title}</h3>
        <p className={`mt-0.5 leading-snug text-neutral-500 ${wide ? "text-sm" : "text-xs sm:text-sm"}`}>{item.desc}</p>
        <span className={`mt-2 inline-flex items-center gap-1 font-semibold text-yas-navy ${wide ? "text-sm" : "text-xs"}`}>
          Ouvrir
          <IconArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </span>
    </Link>
  );
}

function ModuleColumn({ items }: Readonly<{ items: Array<(typeof MODULES)[number]> }>) {
  const [first, second, third] = items;

  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-2.5 sm:gap-3.5">
      <ModuleCard key={first.href} item={first} />
      <ModuleCard key={second.href} item={second} />
      <div className="col-span-2">
        <ModuleCard key={third.href} item={third} wide />
      </div>
    </div>
  );
}

export default function AccueilPage() {
  const displayName = useSessionDisplayName();
  const root = useRef<HTMLElement>(null);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % SLIDES.length);
    }, 3400);
    return () => window.clearInterval(timer);
  }, []);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const slides = gsap.utils.toArray<HTMLElement>(".dash-slide");

      slides.forEach((node, index) => {
        gsap.to(node, {
          autoAlpha: index === slide ? 1 : 0,
          y: index === slide ? 0 : 16,
          duration: reduce ? 0 : 0.55,
          ease: "power2.out",
        });
      });
    },
    { scope: root, dependencies: [slide] },
  );

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      gsap.from(".dash-intro", { y: 16, opacity: 0, duration: 0.5, ease: "power3.out" });
      gsap.from(".dash-bar", {
        scaleX: 0,
        duration: 0.45,
        delay: 0.15,
        transformOrigin: "center",
        ease: "power3.out",
      });
      gsap.from(".dash-card", {
        y: 24,
        opacity: 0,
        stagger: 0.06,
        duration: 0.45,
        delay: 0.12,
        ease: "power3.out",
      });

      const cards = gsap.utils.toArray<HTMLElement>(".dash-card");
      const cleanups = cards.map((card) => {
        const enter = () => gsap.to(card, { y: -5, duration: 0.28, ease: "power2.out" });
        const leave = () => gsap.to(card, { y: 0, duration: 0.35, ease: "power3.out" });
        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        return () => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
        };
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: root },
  );

  return (
    <section ref={root} className="my-auto w-full min-w-0 py-3 sm:py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-center lg:gap-6">
        <div className="dash-intro order-1 w-full max-w-sm shrink-0 px-1 text-center lg:order-2">
          <h1 className="text-xl font-bold text-yas-navy sm:text-2xl">
            {displayName ? `Bonjour ${displayName}` : "Bienvenue"}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-relaxed text-neutral-600">
            Choisissez un module pour lancer une recherche, un traitement CSV ou un login fibre.
          </p>
          <div className="dash-bar mx-auto mt-4 h-1.5 w-24 origin-center rounded-full bg-yas-yellow" />

          <div className="relative mt-4 h-36 w-full sm:mt-5 sm:h-60">
            {SLIDES.map((item, index) => (
              <div
                key={item.src}
                className="dash-slide absolute inset-0 flex flex-col items-center justify-center"
                style={{ visibility: index === 0 ? "visible" : "hidden" }}
              >
                <img src={item.src} alt="" className="h-full max-h-52 w-full object-contain" />
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-yas-navy">{SLIDES[slide].label}</p>
        </div>

        <div className="order-2 w-full max-w-md lg:order-1">
          <ModuleColumn items={LEFT_MODULES} />
        </div>

        <div className="order-3 w-full max-w-md">
          <ModuleColumn items={RIGHT_MODULES} />
        </div>
      </div>
    </section>
  );
}
