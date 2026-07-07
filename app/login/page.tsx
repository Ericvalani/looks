"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

export default function LoginGatePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const res = await fetch("/api/auth/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setPending(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível entrar.");
      return;
    }

    router.push("/login/profile");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <GlassCard className="w-full max-w-sm p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="hairline flex h-12 w-12 items-center justify-center rounded-full">
            <Lock className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <h1 className="text-lg font-medium tracking-tight">Looks</h1>
          <p className="text-sm text-muted">Digite a senha para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="hairline w-full rounded-2xl bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-line-strong"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" disabled={pending || !password}>
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </GlassCard>
    </main>
  );
}
