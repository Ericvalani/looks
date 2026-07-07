"use client";

import { useEffect, useRef } from "react";

interface GameOfLifeLoaderProps {
  cellColor?: string;
  cellRadius?: number;
  cellSize?: number;
  density?: number;
  fadeDuration?: number;
  maxOpacity?: number;
  stepInterval?: number;
  className?: string;
}

/**
 * Softly fading Conway's Game of Life rendered on a canvas that fills its
 * parent — used as an ambient loader while a look is generating.
 */
export function GameOfLifeLoader({
  cellColor = "rgb(96 165 250)",
  cellRadius = 3,
  cellSize = 14,
  density = 0.28,
  fadeDuration = 920,
  maxOpacity = 0.5,
  stepInterval = 620,
  className,
}: GameOfLifeLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cols = 0;
    let rows = 0;
    let alive = new Uint8Array(0);
    let opacity = new Float32Array(0);
    let dpr = 1;

    function seed() {
      for (let i = 0; i < alive.length; i++) {
        alive[i] = Math.random() < density ? 1 : 0;
      }
    }

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      cols = Math.max(1, Math.floor(rect.width / cellSize));
      rows = Math.max(1, Math.floor(rect.height / cellSize));
      alive = new Uint8Array(cols * rows);
      opacity = new Float32Array(cols * rows);
      seed();
    }

    function step() {
      const next = new Uint8Array(cols * rows);
      let population = 0;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let n = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = (x + dx + cols) % cols;
              const ny = (y + dy + rows) % rows;
              n += alive[ny * cols + nx];
            }
          }
          const idx = y * cols + x;
          const live = alive[idx] === 1;
          next[idx] = (live && (n === 2 || n === 3)) || (!live && n === 3) ? 1 : 0;
          population += next[idx];
        }
      }
      alive = next;
      // reseed if the simulation stagnates or dies out
      if (population < cols * rows * 0.02) seed();
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let lastStep = performance.now();
    let lastFrame = performance.now();
    let raf = 0;

    function draw(now: number) {
      const dt = now - lastFrame;
      lastFrame = now;

      if (now - lastStep >= stepInterval) {
        step();
        lastStep = now;
      }

      // exponential smoothing toward the target opacity
      const k = 1 - Math.exp(-dt / (fadeDuration / 3));
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.fillStyle = cellColor;

      const size = cellSize * dpr;
      const gap = Math.max(1, size * 0.14);
      const r = Math.min(cellRadius * dpr, (size - gap) / 2);

      for (let i = 0; i < alive.length; i++) {
        const target = alive[i] ? maxOpacity : 0;
        opacity[i] += (target - opacity[i]) * k;
        const a = opacity[i];
        if (a < 0.01) continue;
        const x = (i % cols) * size + gap / 2;
        const y = Math.floor(i / cols) * size + gap / 2;
        ctx!.globalAlpha = a;
        if (typeof ctx!.roundRect === "function") {
          ctx!.beginPath();
          ctx!.roundRect(x, y, size - gap, size - gap, r);
          ctx!.fill();
        } else {
          ctx!.fillRect(x, y, size - gap, size - gap);
        }
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [cellColor, cellRadius, cellSize, density, fadeDuration, maxOpacity, stepInterval]);

  return <canvas ref={canvasRef} className={className} />;
}
