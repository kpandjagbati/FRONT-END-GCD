"use client";

import { useRouter } from "next/navigation";
import { IconEye, IconLock, IconUser } from "@/components/icons";
import { saveSession } from "@/lib/session";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    saveSession(String(formData.get("username") ?? ""), String(formData.get("password") ?? ""));
    router.push("/accueil");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-yas-page p-6">
      <div className="relative grid w-full max-w-[960px] overflow-hidden rounded-3xl bg-yas-surface shadow-[0_24px_60px_rgba(1,55,125,0.10)] md:grid-cols-2">
        <div className="flex min-h-[440px] flex-col items-center justify-center bg-yas-navy p-10 text-center">
          <img
            src="/logo-yas-yellow.svg"
            alt="Yas"
            width={280}
            height={252}
            className="h-auto w-[220px] object-contain"
          />
          <p className="mt-6 text-sm font-semibold text-yas-yellow">GetCallDetail · Yas Togo</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col justify-center px-10 py-12">
          <h1 className="text-2xl font-bold text-yas-navy">Connexion</h1>
          <p className="mt-1 text-sm text-neutral-500">Bienvenue, veuillez vous connecter</p>

          <label className="mt-8 flex h-12 items-center gap-2 rounded-xl border border-yas-navy px-3">
            <IconUser className="size-4 shrink-0 text-neutral-400" />
            <input
              type="text"
              name="username"
              placeholder="Votre nom d'utilisateur"
              className="h-full w-full bg-transparent text-sm outline-none"
              autoComplete="username"
              required
            />
          </label>

          <label className="mt-4 flex h-12 items-center gap-2 rounded-xl border border-neutral-300 px-3">
            <IconLock className="size-4 shrink-0 text-neutral-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Votre mot de passe"
              className="h-full w-full bg-transparent text-sm outline-none"
              autoComplete="current-password"
            />
            <button
              type="button"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              onClick={() => setShowPassword((value) => !value)}
              className="text-neutral-400"
            >
              <IconEye className="size-4" />
            </button>
          </label>

          <div className="mt-8 flex justify-end">
            <button type="submit" className="btn h-11 min-h-11 rounded-xl border-none bg-yas-navy px-7 font-semibold text-white hover:bg-[#012d66]">
              Connexion
              <span aria-hidden>→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
