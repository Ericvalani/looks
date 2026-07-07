"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadUrl } from "@/lib/image/download";

export function DownloadButton({
  url,
  filename,
  className,
}: {
  url: string;
  filename: string;
  className?: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleDownload() {
    setPending(true);
    try {
      await downloadUrl(url, filename);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="primary" onClick={handleDownload} disabled={pending} className={className}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
      ) : (
        <Download className="h-4 w-4" strokeWidth={1.5} />
      )}
      Baixar
    </Button>
  );
}
