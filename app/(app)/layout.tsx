import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/actions/profile";
import { TopBar } from "@/components/nav/top-bar";
import { LiquidMorphMenu } from "@/components/nav/liquid-morph-menu";
import { GlowHorizonIntro } from "@/components/ui/glow-horizon-intro";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login/profile");

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <GlowHorizonIntro />
      <TopBar displayName={profile.displayName} />
      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      <LiquidMorphMenu displayName={profile.displayName} />
    </div>
  );
}
