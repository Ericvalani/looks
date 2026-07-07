"use client";

import { ProgressiveFluxLoader } from "./progressive-flux-loader";
import { GameOfLifeLoader } from "./game-of-life-loader";

const PHASES = [
  { at: 0, label: "Preparando" },
  { at: 18, label: "Analisando referências" },
  { at: 42, label: "Vestindo o look" },
  { at: 68, label: "Iluminando a cena" },
  { at: 92, label: "Finalizando" },
];

export function GenerationModal({ progress }: { progress: number }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm">
      <div className="w-full max-w-[300px]">
        <ProgressiveFluxLoader value={progress} phases={PHASES}>
          <GameOfLifeLoader className="h-full w-full" maxOpacity={0.4} />
        </ProgressiveFluxLoader>
        <p className="mt-5 text-center text-sm text-muted">Gerando sua foto…</p>
      </div>
    </div>
  );
}
