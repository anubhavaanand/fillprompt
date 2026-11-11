# Security policy

## Reporting a vulnerability

Please do not open a public issue for security problems.

Report them privately through GitHub's [private vulnerability reporting](../../security/advisories/new), or by email to jupiter.mplayplay@gmail.com. Include the affected URL or file, the steps to reproduce, and what an attacker could do.

You should get a reply within seven days. Once a fix is live, you are welcome to be credited in the release notes if you wish.

## Scope

fillprompt.com is a static site with no accounts and no user data. The parts most worth checking are:

- `src/lib/counter.ts` and the two Supabase database functions it calls (`mt_copy_bump`, `mt_copy_get`). The Supabase key in that file is a publishable key and is meant to be public.
- Redirects and response headers in `vercel.json`.
- Any place where data from the source collections is rendered into a page.

Prompt text and sample media come from third-party collections. Problems with that content (for example a broken or unsuitable image) are not security issues; open a normal issue instead.
