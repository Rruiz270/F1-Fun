# F1-Fun

Aplicação de palpites/bolão de Fórmula 1: usuários se registram (com aprovação por admin), apostam em corridas, e há resultados e leaderboard. Fluxo de acesso controlado por status do usuário (`pending`/aprovado/`rejected`) e papel (`admin`).

## Stack

- **Linguagem**: TypeScript 5
- **Framework**: Next.js 14.2 (App Router, `src/app/`) + React 18
- **Estilo**: Tailwind CSS 3
- **Banco**: SQLite via `better-sqlite3` (arquivo local em `database/`, fora do git)
- **Auth**: JWT com `jose` (verificação no middleware) + `bcryptjs` para hashing
- **Email**: EmailJS (`@emailjs/browser`)
- **Deploy**: Vercel (projeto Next.js)
- **Package manager**: npm (`package-lock.json`)

## Comandos

```bash
npm install
npm run dev     # Next dev na porta 3333 (http://localhost:3333)
npm run build   # build de produção
npm run start   # serve o build na porta 3333
npm run lint    # ESLint (next/core-web-vitals + next/typescript)
```

Não há script de teste configurado (ver seção Testes).

## Estrutura

```
src/
├── app/          # App Router; páginas: login, register, pending, dashboard,
│                 #   bet, results, leaderboard, admin; app/api/ = route handlers
├── components/   # componentes React
├── lib/          # acesso a dados (better-sqlite3), auth/JWT, helpers
├── data/         # dados estáticos (ex.: calendário/corridas)
└── types/        # tipos TypeScript
database/         # arquivo SQLite em runtime (.db ignorado pelo git; só .gitkeep)
middleware.ts     # gate de rotas por role/status via cookie 'f1fun_token'
```

`middleware.ts` define os grupos de rota: `publicPaths` (`/`, `/login`, `/register`), `pendingPaths` (`/pending`), `adminPaths` (`/admin`), `approvedPaths` (`/dashboard`, `/bet`, `/results`, `/leaderboard`), e redireciona conforme o JWT no cookie `f1fun_token`.

## Convenções de código

- TypeScript estrito seguindo o preset `next/typescript` do ESLint.
- Cookie de sessão: nome fixo `f1fun_token`; payload do JWT com `{ role, status }`.
- Acesso a banco só no server (route handlers / server components) — `better-sqlite3` é nativo e **não** roda no client nem no Edge runtime.
- `next.config.mjs` marca `better-sqlite3` como `serverComponentsExternalPackages` — mantê-lo aí ao adicionar libs nativas.

## Variáveis de ambiente

Não há `.env.example` no repo; envs referenciadas no código (nomes, nunca valores):

- `JWT_SECRET` — assinatura/verificação do token (há fallback `'f1-fun-default-secret'` no código; **defina em produção**)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — bootstrap do usuário admin
- `NEXT_PUBLIC_APP_URL` — URL pública da app
- `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` — EmailJS
- `NODE_ENV`

Local: `.env.local`. Produção: Vercel → Project Settings → Environment Variables.

## CI/CD & Deploy

- Deploy pela Vercel (Next.js): push na `main` → produção; PRs → preview.
- **Não há workflow de CI no GitHub Actions.** Recomendado um workflow mínimo em PRs: `npm ci` → `npm run lint` → `npx tsc --noEmit` → `npm run build`.

## Boas práticas de PR

- Branches: `feat/…`, `fix/…`, `chore/…`; Conventional Commits.
- PRs pequenos e focados. Checklist:
  - [ ] `npm run build` passa
  - [ ] `npm run lint` sem erros
  - [ ] Nenhum segredo/`.env`/arquivo `.db` commitado
  - [ ] Mudança de schema SQLite documentada com passo de migração/rollback
  - [ ] Screenshots para mudanças de UI
- ≥1 review; squash merge; `main` sempre deployável.

## Testes

Sem suíte nem runner. Recomendação mínima proporcional: testes de unidade (Vitest/Jest) para a lógica de `src/lib` (auth/JWT, regras de pontuação das apostas) e um teste de integração do fluxo de aprovação de usuário. O middleware de gate de rotas é o ponto mais sensível — priorizar.

## Segurança & dados

- Nunca commitar `.env.local`, segredos ou o arquivo `.db` (já ignorados no `.gitignore`).
- **Trocar o fallback `JWT_SECRET`**: se `JWT_SECRET` não estiver setado em produção, o segredo padrão do código é público — falha de segurança. Sempre definir um segredo forte.
- **LGPD**: cadastro guarda email/credenciais de usuários — restringir acesso ao admin, hashear senhas com `bcryptjs`, não logar dados pessoais.
- Revisar dependências (`npm audit`); `better-sqlite3` é módulo nativo — validar compatibilidade de versão do Node.

## Gotchas

- **SQLite na Vercel é efêmero**: o filesystem serverless é read-only/efêmero, então um `.db` local não persiste entre deploys/instâncias. Para produção real, considerar Turso/libSQL ou um Postgres gerenciado. Confirmar como o app persiste dados antes de assumir durabilidade.
- Dev/start rodam na **porta 3333** (não 3000) — o README padrão do create-next-app menciona 3000, mas os scripts usam `-p 3333`.
- `better-sqlite3` precisa ficar em `serverComponentsExternalPackages`; importá-lo em client component quebra o build.
- README ainda é o boilerplate do create-next-app — não é fonte confiável; siga este AGENTS.md.
