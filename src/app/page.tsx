"use client";

import { useRouter } from "next/navigation";
import { IconEye, IconLock, IconUser } from "@/components/icons";
import { saveSessionPassword } from "@/lib/downloads";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    saveSessionPassword(String(formData.get("password") ?? ""));
    router.push("/accueil");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-yas-login p-6">
      <div className="grid w-full max-w-[920px] overflow-hidden bg-white shadow-xl md:grid-cols-2">
        <div className="flex min-h-[420px] items-center justify-center bg-yas-navy p-10">
          <img
            src="/logo-yas-yellow.svg"
            alt="Yas"
            width={280}
            height={252}
            className="h-auto w-[260px] object-contain"
          />
        </div>

        <form onSubmit={onSubmit} className="flex flex-col justify-center px-10 py-12">
          <h1 className="text-xl font-semibold text-neutral-800">Connexion</h1>
          <p className="mt-1 text-sm text-neutral-500">Bienvenue veuillez vous connecter</p>

          <label className="mt-8 flex h-11 items-center gap-2 rounded-sm border border-[#01377d] px-3">
            <IconUser className="size-4 shrink-0 text-neutral-400" />
            <input
              type="text"
              name="username"
              placeholder="Votre nom d'utilisateur"
              className="h-full w-full bg-transparent text-sm outline-none"
              autoComplete="username"
            />
          </label>

          <label className="mt-4 flex h-11 items-center gap-2 rounded-sm border border-neutral-300 px-3">
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
            <button type="submit" className="btn btn-primary h-10 min-h-10 rounded-md px-6">
              Connexion
              <span aria-hidden>→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
