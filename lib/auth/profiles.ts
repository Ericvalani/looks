export type ProfileSlug = "eric" | "mateus";

export const PROFILE_SLUGS: ProfileSlug[] = ["eric", "mateus"];

export const PROFILE_LABELS: Record<ProfileSlug, string> = {
  eric: "Eric",
  mateus: "Mateus",
};

export function isProfileSlug(value: unknown): value is ProfileSlug {
  return typeof value === "string" && PROFILE_SLUGS.includes(value as ProfileSlug);
}

/** Fixed internal Supabase Auth credentials, one per profile. Never sent to the client. */
export function credentialsFor(slug: ProfileSlug): { email: string; password: string } {
  const prefix = slug.toUpperCase();
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  if (!email || !password) {
    throw new Error(`Credenciais do perfil "${slug}" não configuradas.`);
  }
  return { email, password };
}
