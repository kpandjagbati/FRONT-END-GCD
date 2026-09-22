"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { IconEye, IconEyeOff, IconLock, IconUser } from "@/components/icons";
import { saveSession } from "@/lib/session";

gsap.registerPlugin(useGSAP);

export default function LoginPage() {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".login-card", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 })
        .fromTo(".login-brand", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 }, "-=0.25")
        .fromTo(
          ".login-art",
          { y: 16, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.45 },
          "-=0.2",
        )
        .fromTo(
          ".login-field",
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.4 },
          "-=0.2",
        );
    },
    { scope: root },
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    saveSession(String(formData.get("username") ?? ""), String(formData.get("password") ?? ""));
    router.push("/accueil");
  }

  return (
    <div
      ref={root}
      className="relative flex h-dvh items-center justify-center overflow-hidden bg-[#eef2f7] p-3 sm:p-4"
    >
      <div className="pointer-events-none absolute -right-16 bottom-0 size-80 rounded-full bg-black/5 blur-3xl" />

      <div className="login-card relative grid max-h-[calc(100dvh-1.5rem)] w-full max-w-[960px] overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_rgba(1,55,125,0.10)] md:grid-cols-2">
        <div className="login-brand relative flex flex-col items-center justify-center overflow-hidden bg-yas-yellow px-10 py-10 text-center text-yas-navy">
          <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-yas-navy/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-yas-navy/5" />

          <div className="relative">
            <img
              src="/logo-yas.svg"
              alt="Yas"
              width={220}
              height={198}
              className="mx-auto h-auto w-[200px] object-contain"
            />
            <h1 className="mt-5 text-2xl font-bold tracking-tight">GetCallDetail</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-relaxed text-yas-navy/70">
              Consultez les appels, identités, traitements CSV et logins fibre depuis un seul espace Yas
              Togo.
            </p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="yas-bubbles flex h-full flex-col justify-center bg-[#f7f9fc] px-10 py-8"
        >
          <div>
          <img
            src="/illustrations/welcome.svg"
            alt=""
            className="login-art mx-auto mb-4 h-auto w-[168px] object-contain"
          />
          <h2 className="text-center text-2xl font-bold text-yas-navy">Connexion</h2>
          <p className="mt-1 text-center text-sm font-medium text-neutral-500">
            Bienvenue, veuillez vous connecter
          </p>

          <div className="login-field mt-5">
            <label className="yas-label" htmlFor="login-username">
              Nom d&apos;utilisateur
            </label>
            <div className="login-field-box flex h-11 items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3 transition-shadow focus-within:border-yas-navy focus-within:shadow-[0_0_0_3px_rgba(1,55,125,0.12)]">
              <IconUser className="size-4 shrink-0 text-yas-navy/45" />
              <input
                id="login-username"
                type="text"
                name="username"
                placeholder="Votre nom d'utilisateur"
                className="h-full w-full bg-transparent text-sm outline-none placeholder:italic placeholder:text-neutral-400"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="login-field mt-3.5">
            <label className="yas-label" htmlFor="login-password">
              Mot de passe
            </label>
            <div className="login-field-box flex h-11 items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3 transition-shadow focus-within:border-yas-navy focus-within:shadow-[0_0_0_3px_rgba(1,55,125,0.12)]">
              <IconLock className="size-4 shrink-0 text-yas-navy/45" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Votre mot de passe"
                className="h-full w-full bg-transparent text-sm outline-none placeholder:italic placeholder:text-neutral-400"
                autoComplete="current-password"
              />
              <button
                type="button"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                onClick={() => setShowPassword((value) => !value)}
                className="text-neutral-400 hover:text-yas-navy"
              >
                {showPassword ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="login-field mt-6 flex justify-end">
            <button
              type="submit"
              className="flex h-11 items-center gap-2 rounded-xl bg-yas-yellow px-7 text-sm font-semibold text-yas-navy transition hover:bg-[#f0ce00]"
            >
              Connexion
              <span aria-hidden>→</span>
            </button>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
}
