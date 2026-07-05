# Contributing

Thanks for your interest in improving Fydemy. This guide covers how to set up the project and submit changes.

## Code of conduct

By participating, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## Development setup

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- PostgreSQL 14+
- A Google Cloud OAuth client (for sign-in)
- A [Resend](https://resend.com/) API key (for transactional email)

### Install and run

```bash
bun install
cp .env.example .env
```

Fill in the variables documented in [README.md](README.md#environment-variables), then:

```bash
bunx prisma db push
bunx prisma generate
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful commands

| Command | Description |
| --- | --- |
| `bun dev` | Start the Next.js dev server |
| `bun run build` | Production build |
| `bun run lint` | Run ESLint |
| `bunx prisma db push` | Sync the Prisma schema to the database |
| `bunx prisma generate` | Regenerate the Prisma client |
| `bunx prisma studio` | Open Prisma Studio |

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Keep changes focused — one concern per PR when possible.
3. Match existing naming, formatting, and patterns in the surrounding code.
4. Do not commit secrets or local env files.
5. Run `bun run lint` and fix any issues you introduce.
6. Open a PR with a clear description of **what** changed and **why**.

## Reporting bugs

Use [GitHub Issues](https://github.com/fydemy/fdm/issues). Include:

- Steps to reproduce
- Expected vs actual behavior
- Browser / OS if relevant
- Logs or screenshots when helpful

For security issues, see [SECURITY.md](SECURITY.md) — do not file a public issue.

## Feature ideas

Open an issue first for larger features so we can align on scope before you invest time in a PR.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
