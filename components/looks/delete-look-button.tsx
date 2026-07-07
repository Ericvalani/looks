"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteLook } from "@/lib/actions/looks";

export function DeleteLookButton({ id, className }: { id: string; className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Excluir este look?")) return;
    setPending(true);
    await deleteLook(id);
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="glass" onClick={handleDelete} disabled={pending} className={className}>
      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
      Excluir
    </Button>
  );
}
