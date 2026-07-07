import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createGateCookieValue, GATE_COOKIE } from "@/lib/auth/gate";

const schema = z.object({ password: z.string().min(1) });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Senha inválida." }, { status: 400 });
  }

  if (parsed.data.password !== process.env.APP_GATE_PASSWORD) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(GATE_COOKIE, createGateCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return response;
}
