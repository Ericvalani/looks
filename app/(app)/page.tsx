import Link from "next/link";
import { Plus } from "lucide-react";
import { listLooks } from "@/lib/actions/looks";
import { GlassCard } from "@/components/ui/glass-card";

export default async function HomePage() {
  const looks = await listLooks();

  return (
    <main className="mx-auto h-full w-full max-w-2xl overflow-y-auto p-4 sm:p-6">
      <Link href="/new">
        <GlassCard className="flex items-center justify-center gap-2 p-6 text-center hover:bg-glass-strong">
          <Plus className="h-5 w-5" strokeWidth={1.5} />
          <span className="text-sm font-medium">Novo look</span>
        </GlassCard>
      </Link>

      <h2 className="mb-3 mt-8 text-xs tracking-wide text-muted">RECENTES</h2>

      {looks.length === 0 ? (
        <p className="text-sm text-muted">Nenhum look gerado ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {looks.map((look) => (
            <Link key={look.id} href={`/look/${look.id}`}>
              <GlassCard className="aspect-[9/16] overflow-hidden p-0">
                {look.signedUrl ? (
                  <img src={look.signedUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                    {look.status === "failed" ? "Falhou" : "..."}
                  </div>
                )}
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
