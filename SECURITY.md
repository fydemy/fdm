# Security Policy

## Supported versions

Security fixes are applied to the latest commit on `main`.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security problems.

Email the maintainers at **nathan@fydemy.com**, or use [GitHub private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) if it is enabled on this repository.

Include:

- A description of the issue and its impact
- Steps to reproduce, or a proof of concept if available
- Affected versions or commit hashes if known

We will acknowledge reports as soon as we can and work with you on a fix and disclosure timeline.

## Secrets and credentials

Never commit real credentials. Use `.env` locally (gitignored) and copy from `.env.example`. If you accidentally commit a secret, rotate it immediately and treat it as compromised.
