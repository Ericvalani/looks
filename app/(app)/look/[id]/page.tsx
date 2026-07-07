import { notFound } from "next/navigation";
import Link from "next/link";
import { getLook } from "@/lib/actions/looks";
import { GlassCard } from "@/components/ui/glass-card";
import { DownloadButton } from "@/components/looks/download-button";
import { DeleteLookButton } from "@/components/looks/delete-look-button";

export default async function LookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const look = await getLook(id);
  if (!look) notFound();

  return (
    <main className="mx-auto flex h-full w-full max-w-md flex-col items-center gap-6 overflow-y-auto p-6">
      {look.status === "completed" && look.signedUrl && (
        <>
          <GlassCard className="aspect-[9/16] w-full overflow-hidden p-0">
            <img src={look.signedUrl} alt="Look gerado" className="h-full w-full object-cover" />
          </GlassCard>
          <div className="flex w-full gap-3">
            <DownloadButton
              url={look.signedUrl}
              filename={`look-${look.id}.png`}
              className="flex-1"
            />
            <DeleteLookButton id={look.id} className="flex-1" />
          </div>
          <Link href="/new" className="text-sm text-muted underline underline-offset-4">
            Gerar outro look
          </Link>
        </>
      )}

      {look.status === "failed" && (
        <GlassCard className="w-full p-6 text-center">
          <p className="text-sm font-medium">Não foi possível gerar este look.</p>
          {look.errorMessage && (
            <p className="mt-2 text-xs text-muted">{look.errorMessage}</p>
          )}
          <Link
            href="/new"
            className="mt-4 inline-block text-sm text-muted underline underline-offset-4"
          >
            Tentar novamente
          </Link>
        </GlassCard>
      )}

      {(look.status === "pending" || look.status === "processing") && (
        <GlassCard className="w-full p-6 text-center">
          <p className="text-sm">Ainda processando...</p>
        </GlassCard>
      )}
    </main>
  );
}
