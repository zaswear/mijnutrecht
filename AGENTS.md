<!-- BEGIN:monorepo-agent-rules -->

# mijnutrecht — monorepo zaswear-projects

Antes de tocar nada, lee en este orden:

1. `CLAUDE.md` (esta carpeta) — stack, convenciones y reglas propias de esta app. **Manda sobre las de la raíz.**
2. `../../../CLAUDE.md` y `../../../AGENTS.md` (raíz del monorepo) — pnpm workspaces, CI, deploy, Neon.

Recordatorios que rompen el pipeline: **nunca `npm install`** (es pnpm workspace,
excepto `apps/services/*`), Node >= 22, los warnings del CI son errores fatales,
el auto-deploy de Vercel está desactivado a propósito, y no se commitea sin que te lo pidan.

<!-- END:monorepo-agent-rules -->
