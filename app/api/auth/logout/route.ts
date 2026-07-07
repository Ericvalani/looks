import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Clears only the Supabase session — the shared gate cookie stays, so
 * switching profiles on the same trusted device doesn't require the
 * password again. */
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
