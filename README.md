# SDD Workflow Example — Liga Deportiva Zámbiza

A real-world demonstration of **Spec-Driven Development (SDD)** using AI agents to build a football tournament management platform.

## What This Proves

This repository is **not** about the football app itself — it's about demonstrating a **structured, repeatable workflow** for building software with AI assistance. The key question:

> **Can an AI agent build a production-quality application when guided by a disciplined, spec-first methodology?**

This project proves that with the right workflow:

- AI stops being a "code autocomplete" and becomes a **structured engineering partner**
- Every line of code traces back to a **spec with acceptance criteria**
- Architecture decisions are **documented before implementation**, not discovered after
- The result is **maintainable, testable, and auditable** — not a pile of AI-generated spaghetti

## The SDD Workflow

```
PRD → /sdd-init → /sdd-explore → /sdd-propose → /sdd-spec → /sdd-design → /sdd-tasks → /sdd-apply → /sdd-verify → /sdd-archive
```

Each phase produces a **persistent artifact** (stored in Engram memory) that feeds the next:

| Phase       | What It Does                                      | Output                          |
| ----------- | ------------------------------------------------- | ------------------------------- |
| `init`      | Detects stack, conventions, bootstraps context     | Project context                 |
| `explore`   | Investigates the problem space, identifies risks   | Exploration report              |
| `propose`   | Defines scope, boundaries, and key decisions       | Change proposal                 |
| `spec`      | Writes requirements + scenarios (Given/When/Then)  | Delta specification             |
| `design`    | Creates technical architecture and folder structure | Technical design document       |
| `tasks`     | Breaks down into atomic, implementable tasks       | Task checklist with dependencies|
| `apply`     | Implements code in batches following specs          | Working code + tests            |
| `verify`    | Validates implementation against specs              | Verification report             |
| `archive`   | Syncs specs and closes the change                  | Archived change                 |

## Tools & Stack

### AI Development Ecosystem

| Tool                                                         | Role                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------ |
| [Opencode](https://github.com/nicholasgriffintn/opencode)    | AI coding agent with terminal integration              |
| [Claude Opus 4](https://docs.anthropic.com/en/docs/about-claude/models/all-models#claude-opus-4) | LLM powering the AI agent                              |
| [Engram Memory](https://github.com/nicholasgriffintn/engram) | Persistent cross-session memory for AI agents          |
| [Context7 MCP](https://github.com/nicholasgriffintn/context7)| Up-to-date documentation fetching for libraries        |
| [SDD Skills](https://github.com/Gentleman-Programming)       | Curated AI skill definitions for each SDD phase        |

### Application Stack

| Layer          | Technology                   | Why                                                    |
| -------------- | ---------------------------- | ------------------------------------------------------ |
| Framework      | Next.js 15 (App Router)      | SSR, RSC, API routes — all in one                      |
| Language       | TypeScript (strict)          | Type safety reduces bugs in tournament logic            |
| Database       | PostgreSQL + Drizzle ORM     | Type-safe ORM, explicit SQL, shared schema              |
| Test DB        | pglite (in-memory PG)        | Same PG dialect, no Docker needed, ~300ms startup       |
| Auth           | Auth.js v5                   | JWT sessions with role-based access control             |
| Styles         | Tailwind CSS 4 + shadcn/ui   | Utility-first, accessible components                   |
| Validation     | Zod 3                        | Shared schemas between client and server                |
| Testing        | Vitest + Playwright          | Unit/integration with pglite + E2E                     |
| CI/CD          | GitHub Actions               | Lint + test pipeline, no Docker required                |

## Why SDD Matters

Most developers use AI like this:

```
"Hey AI, build me a login page"
→ Gets code
→ Pastes it
→ Hopes it works
→ Asks for fixes
→ Repeat until frustrated
```

SDD flips this:

```
1. SPECIFY what the login page must do (requirements + scenarios)
2. DESIGN how it integrates with the system (architecture decisions)
3. BREAK DOWN into atomic tasks (max 3 files per task)
4. IMPLEMENT task by task with the AI following the spec
5. VERIFY against acceptance criteria
```

The AI becomes **Jarvis** — not a random code generator, but a disciplined executor following a clear plan.

## Architecture Decisions

Key decisions made during the SDD process:

- **Auth.js v5 only** (no Supabase) — simpler stack, self-hosted PostgreSQL
- **pglite for tests** — same PG dialect as production, zero Docker dependency
- **Zod 3** (not v4) — ecosystem compatibility with shadcn/ui and react-hook-form
- **Users table only in Phase 0** — domain tables belong in feature specs, not infrastructure setup
- **Separate DB clients** — `client.ts` (PostgreSQL) and `test-client.ts` (pglite) to avoid Edge Runtime issues

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Methodology

**Spec-Driven Development** by [Gentleman Programming](https://github.com/Gentleman-Programming)

> We are Tony Stark. AI is Jarvis. We direct, it executes.

---

Built with the [AI Gentle Stack](https://github.com/Gentleman-Programming) — SDD Workflow
