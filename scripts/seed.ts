/**
 * Roda uma única vez (localmente) para criar as 2 contas fixas do app.
 * Único lugar que usa a service-role key — nunca importado pelo app em produção.
 *
 *   npm run seed
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/supabase/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local antes de rodar o seed."
  );
}

const PROFILES = [
  { slug: "eric", displayName: "Eric", accent: "#9db4ff" },
  { slug: "mateus", displayName: "Mateus", accent: "#ffd39d" },
] as const;

async function main() {
  const admin = createClient<Database>(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const profile of PROFILES) {
    const prefix = profile.slug.toUpperCase();
    const email = process.env[`${prefix}_EMAIL`];
    const password = process.env[`${prefix}_PASSWORD`];

    if (!email || !password) {
      throw new Error(
        `Defina ${prefix}_EMAIL e ${prefix}_PASSWORD no .env.local antes de rodar o seed.`
      );
    }

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    let userId = created?.user?.id;

    if (createError) {
      const alreadyExists = createError.message
        .toLowerCase()
        .includes("already been registered");
      if (!alreadyExists) throw createError;

      console.log(`Usuário ${email} já existe, buscando id...`);
      const { data: list, error: listError } =
        await admin.auth.admin.listUsers();
      if (listError) throw listError;
      const existing = list.users.find((u) => u.email === email);
      if (!existing)
        throw new Error(`Não encontrei o usuário existente para ${email}.`);
      userId = existing.id;
    }

    if (!userId) throw new Error(`Sem user id para ${email}.`);

    const { error: upsertError } = await admin.from("profiles").upsert({
      id: userId,
      display_name: profile.displayName,
      slug: profile.slug,
      accent_color: profile.accent,
    });

    if (upsertError) throw upsertError;

    console.log(`OK: ${profile.displayName} (${email}) -> ${userId}`);
  }
}

main()
  .then(() => {
    console.log("Seed concluído.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
