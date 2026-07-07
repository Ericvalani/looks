"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Plus, Images, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { LetterRoll } from "./letter-roll";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const items = [
  { href: "/", label: "Início", icon: Home },
  { href: "/new", label: "Novo look", icon: Plus },
  { href: "/library", label: "Biblioteca", icon: Images },
];

/**
 * Floating navigation anchored top-right: a pill/FAB that morphs open into a
 * dark menu, items dropping down with a staggered springy (organic) motion and
 * letter-roll labels. Appears after the entrance animation.
 */
export function LiquidMorphMenu({ displayName }: { displayName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  async function logout() {
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login/profile");
    router.refresh();
  }

  const rows = [
    ...items.map((it) => ({ kind: "link" as const, ...it })),
    { kind: "logout" as const, label: "Trocar perfil", icon: LogOut, href: "" },
  ];

  return (
    <>
      {/* backdrop */}
      <button
        aria-hidden={!open}
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className={cx(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <div
        className="animate-rise fixed right-6 top-6 z-50 sm:right-8 sm:top-8"
        style={{ animationDelay: "2s" }}
      >
        {/* items drop down from the toggle */}
        <div className="absolute right-0 top-[60px] flex flex-col items-end gap-2.5">
          {rows.map((row, i) => {
            const active = row.kind === "link" && row.href === pathname;
            const Icon = row.icon;
            return (
              <button
                key={row.label}
                onClick={() => (row.kind === "link" ? go(row.href) : logout())}
                style={{ transitionDelay: `${open ? i * 55 : (rows.length - 1 - i) * 40}ms` }}
                className={cx(
                  "glass-card flex w-56 items-center gap-3 px-5 py-3 text-left transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                  open
                    ? "translate-y-0 scale-100 opacity-100 blur-none"
                    : "pointer-events-none -translate-y-4 scale-95 opacity-0 blur-sm",
                  active && "ring-1 ring-[#60a5fa]"
                )}
              >
                <span
                  className={cx(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    active ? "bg-[rgba(59,130,246,0.22)] text-foreground" : "text-muted"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <span className="text-sm font-medium">
                  <LetterRoll text={row.label} />
                </span>
              </button>
            );
          })}
        </div>

        {/* morphing toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          title={displayName}
          className="glass-card relative flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 active:scale-95"
          style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.5), 0 0 22px rgba(96,165,250,0.28)" }}
        >
          <span className="relative block h-4 w-5">
            <span
              className={cx(
                "absolute left-0 h-0.5 w-5 rounded-full bg-foreground transition-all duration-300",
                open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
              )}
            />
            <span
              className={cx(
                "absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 rounded-full bg-foreground transition-all duration-200",
                open ? "opacity-0" : "opacity-100"
              )}
            />
            <span
              className={cx(
                "absolute left-0 h-0.5 w-5 rounded-full bg-foreground transition-all duration-300",
                open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
              )}
            />
          </span>
        </button>
      </div>

      {/* keep Next prefetching the routes */}
      <div className="hidden">
        {items.map((item) => (
          <Link key={item.href} href={item.href} prefetch />
        ))}
      </div>
    </>
  );
}
