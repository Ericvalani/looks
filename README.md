# Looks

Gerador de looks com IA para uso pessoal (Eric & Mateus). Sobe uma foto de **rosto** e uma de **corpo** da modelo (referências separadas, para máxima consistência de identidade e proporções), escolhe o **cenário** — uma foto real que você sobe (quarto, elevador, sala...) **ou** um cenário pronto por texto (restaurante chique, cafeteria, parque municipal...) —, escolhe **pose, iluminação, expressão, direção, ambiente, o objeto/gesto da mão livre** (bolsa, mochila, garrafa Stanley, sinal de paz...) e o **tipo de foto** (selfie de espelho — o padrão —, selfie na mão, apoiada na mesa, traseira 0.5x, de cima para baixo...), monta o look pelo boneco (7 zonas: cabeça, casaco, conjunto, topo, inferior, calçado, acessório) e gera uma foto vertical 9:16 ultra-realista estilo **iPhone 16 Pro Max** via **gpt-image-2**, salvando tudo no Supabase.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind v4 + Supabase (Postgres/Auth/Storage) + OpenAI `gpt-image-2`.

## Configuração inicial (obrigatória antes de rodar)

### 1. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → API**, copie `Project URL`, `anon public key` e `service_role key`.
3. Em **SQL Editor**, rode em ordem o conteúdo de:
   - [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — cria as tabelas, RLS e o bucket de storage.
   - [`supabase/migrations/0002_model_face_body.sql`](supabase/migrations/0002_model_face_body.sql) — separa a foto de modelo em rosto/corpo.
   - [`supabase/migrations/0003_scene_photos.sql`](supabase/migrations/0003_scene_photos.sql) — troca os presets de cenário (texto) por fotos reais de ambientes enviadas por você.
   - [`supabase/migrations/0004_pose_presets.sql`](supabase/migrations/0004_pose_presets.sql) — adiciona os presets de pose (texto) selecionáveis na tela de novo look.
   - [`supabase/migrations/0005_multi_angle_garments.sql`](supabase/migrations/0005_multi_angle_garments.sql) — permite anexar mais de uma foto (ângulos) da mesma peça em um look.
   - [`supabase/migrations/0006_conjunto_zone.sql`](supabase/migrations/0006_conjunto_zone.sql) — adiciona a zona "Conjunto" (topo + inferior na mesma foto).
   - [`supabase/migrations/0007_lighting_presets.sql`](supabase/migrations/0007_lighting_presets.sql) — adiciona os presets de iluminação (Dia, Noite luz quente, Noite luz fria).
   - [`supabase/migrations/0008_expression_direction_environment.sql`](supabase/migrations/0008_expression_direction_environment.sql) — adiciona os presets de expressão (rosto), direção (frente/costas) e ambiente (arrumado, bagunçado, pessoas ao fundo...).
   - [`supabase/migrations/0009_hand_and_shot_presets.sql`](supabase/migrations/0009_hand_and_shot_presets.sql) — adiciona os presets de objeto/gesto da mão livre (bolsa, mochila, livros, garrafa Stanley rosa, sinal de paz...) e de tipo de foto (selfie no espelho [padrão], selfie na mão, apoiada na mesa, traseira 0.5x, de cima para baixo...).
   - [`supabase/migrations/0010_scene_presets_and_env_como_esta.sql`](supabase/migrations/0010_scene_presets_and_env_como_esta.sql) — adiciona a opção "Como está" no ambiente (mantém o cenário como está) e os cenários por texto (restaurante chique, cafeteria, elevador, parque municipal, shopping, praia...), que podem ser escolhidos no lugar de uma foto real de cenário.

### 2. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```bash
cp .env.local.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — do passo 1.
- `APP_GATE_PASSWORD` — a senha única de entrada no app.
- `APP_GATE_SECRET` — string aleatória longa (`openssl rand -hex 32`).
- `ERIC_PASSWORD` / `MATEUS_PASSWORD` — senhas das duas contas fixas (os emails podem ficar como `eric@internal.app` / `mateus@internal.app`, nunca aparecem na UI).
- `OPENAI_API_KEY` — chave da OpenAI com acesso ao `gpt-image-2`.

### 3. Criar as duas contas fixas (Eric/Mateus)

Com o `.env.local` preenchido:

```bash
npm install
npm run seed
```

Isso cria os 2 usuários no Supabase Auth e as linhas correspondentes em `profiles`. Rode de novo sem problema — é idempotente.

### 4. Rodar localmente

```bash
npm run dev
```

Abra `http://localhost:3000` (ou a porta que o Next escolher se a 3000 estiver ocupada), digite a senha do portão e escolha o perfil.

## Estrutura

- `proxy.ts` — portão de senha + sessão Supabase (substitui o antigo `middleware.ts` no Next 16).
- `lib/supabase/` — clientes Supabase (browser/server/proxy) + tipos do banco.
- `lib/auth/` — lógica do portão (HMAC) e das 2 contas fixas.
- `lib/actions/` — Server Actions (fotos de modelo/peça/cenário, looks, preferências, perfil).
- `lib/prompt.ts` — monta o prompt enviado ao gpt-image-2 (identidade rosto+corpo, cenário real como imagem, iluminação dia/noite, pose com a mão sempre segurando o iPhone, sempre selfie de espelho iPhone 16 Pro Max, peças).
- `app/api/looks/generate/route.ts` — único endpoint REST real: baixa as referências (rosto, corpo, cenário, peças), chama a OpenAI e grava o resultado.
- `components/new-look/garment-zone-grid.tsx` + `garment-preview-stack.tsx` — grade de cards por peça e prévia empilhada em ordem de corpo.
- `supabase/migrations/` — schema incremental (0001 base, 0002 rosto/corpo, 0003 fotos de cenário, 0004 presets de pose, 0005 múltiplos ângulos por peça, 0006 zona "Conjunto", 0007 presets de iluminação).

## Deploy

Recomendado: [Vercel](https://vercel.com/new) (integra nativamente com Next.js). Configure as mesmas variáveis de ambiente do `.env.local` no painel do projeto antes do primeiro deploy.

## Custo por imagem

Cada look gerado chama o `gpt-image-2` em qualidade `high` no tamanho `1024x1792` — estimativa de ~US$0,20/imagem (irrelevante no volume de uso de 2 pessoas).
