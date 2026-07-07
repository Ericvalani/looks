import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { GATE_COOKIE, isGateCookieValid } from "@/lib/auth/gate";
import { PROFILE_SLUGS, credentialsFor } from "@/lib/auth/profiles";

const schema = z.object({ profile: z.enum(PROFILE_SLUGS as [string, ...string[]]) });

export async function POST(request: NextRequest) {
  if (!isGateCookieValid(request.cookies.get(GATE_COOKIE)?.value)) {
    return NextResponse.json({ error: "Portão não validado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Perfil inválido." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(
    credentialsFor(parsed.data.profile as "eric" | "mateus")
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
