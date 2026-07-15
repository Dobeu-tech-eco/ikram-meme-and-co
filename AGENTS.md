# ikram-meme-and-co — Project Rules

Greenfield project. This file is the source of truth for agent behavior in this repo.
Deeper `AGENTS.md` / `CLAUDE.md` files override these rules when present.

## Status

- **State:** empty scaffold (initialized 2026-07-15)
- **Stack:** not chosen yet — confirm with the user before scaffolding an app
- **Git:** local repo only until a remote is configured

## What this project is

**Working name:** Ikram Meme & Co.

Product intent is **not locked**. Do not invent a full product, brand system, or architecture
until the user confirms:

1. Audience (internal joke site, client brand, marketplace, generator tool, etc.)
2. Primary surface (marketing site, web app, Discord bot, API, print catalog, …)
3. Must-have features for v0
4. Preferred stack (or “you choose”)

When those are known, update this section and the Architecture block below.

## Agent operating rules

1. **Prefer plan mode** for multi-file features until conventions exist.
2. **Small diffs.** Do not scaffold frameworks, UI kits, or deploy targets without explicit ask.
3. **No secrets** in the repo. Use `.env.local` / Vercel / user env vars; keep `.env*.local` gitignored.
4. **PowerShell first** on this machine (`pwsh`). Avoid bash-only scripts unless the user asks.
5. **Human merge for production.** Preview deploys and PRs are fine; do not promote prod unprompted.
6. **Evidence before “done.”** Run the project’s real build/test commands (once they exist) before claiming success.

## When stack is chosen — fill this in

```text
Stack:     TBD
App root:  TBD
Package manager: TBD
Deploy:    TBD
Database:  TBD
Auth:      TBD
```

### Expected commands (replace after scaffold)

| Action | Command |
|--------|---------|
| Install | TBD |
| Dev | TBD |
| Build | TBD |
| Lint / typecheck | TBD |
| Unit tests | TBD |
| E2E | TBD |

## Conventions (defaults until project overrides)

- TypeScript preferred for new web/app code
- Prefer clear names over clever abstractions
- Keep files focused; extract when a module grows past ~300–400 lines
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Branches: `feature/…`, `fix/…`, `chore/…`

## Directory layout (target — create only what is needed)

```text
ikram-meme-and-co/
├── AGENTS.md          # this file (agent + human project rules)
├── README.md          # human-facing overview
├── .gitignore
└── (app sources TBD)
```

## Do not

- Commit `.env`, API keys, or service-role tokens
- Force-push or rewrite published history without explicit request
- Add heavy dependencies for one-liners
- Rewrite the stack mid-task without user agreement

## Next steps for agents

1. Confirm product goals with the user (audience, surface, v0 scope, stack).
2. Scaffold the minimal app (prefer worktree isolation for multi-file features).
3. Update this `AGENTS.md` with real architecture, commands, and conventions.
4. Add tests and a preview deploy path when the app is runnable.
```
