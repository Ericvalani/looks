"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { PROFILE_LABELS, PROFILE_SLUGS, type ProfileSlug } from "@/lib/auth/profiles";

export default function ProfilePickerPage() {
  const router = useRouter();
  const [pending, setPending] = useState<ProfileSlug | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function selectProfile(profile: ProfileSlug) {
    setError(null);
    setPending(profile);

    const res = await fetch("/api/auth/select-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível entrar.");
      setPending(null);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-lg font-medium tracking-tight">Quem é você?</h1>
          <p className="mt-1 text-sm text-muted">Escolha seu perfil</p>
        </div>

        <div className="grid w-full grid-cols-2 gap-4">
          {PROFILE_SLUGS.map((slug) => (
            <button
              key={slug}
              onClick={() => selectProfile(slug)}
              disabled={pending !== null}
              className="group disabled:opacity-40"
            >
              <GlassCard className="flex flex-col items-center gap-3 px-4 py-8 transition-colors group-hover:bg-glass-strong">
                <div className="hairline flex h-14 w-14 items-center justify-center rounded-full">
                  <User className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium">
                  {pending === slug ? "Entrando..." : PROFILE_LABELS[slug]}
                </span>
              </GlassCard>
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </main>
  );
}
