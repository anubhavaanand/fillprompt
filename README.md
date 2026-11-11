# fillprompt.com

A free library of ready-to-copy AI prompts: image prompts, video prompts and text prompts, each shown with the result it produced, plus a directory of skills for AI agents. No account, no ads, no paywall.

Live site: https://fillprompt.com

Every prompt comes from an open-source collection, names its original author and links to its source. Prompts with placeholders such as `[OBJECT]` get input fields, so a visitor fills in the blanks and copies the finished prompt.

## Stack

- [Astro](https://astro.build) static site, no server code
- [Tailwind CSS](https://tailwindcss.com) v4
- Hosted on [Vercel](https://vercel.com)
- Copy counter backed by two Supabase database functions (optional, see below)

## Getting started

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

The site runs at http://localhost:4321. The prompt data is already in `src/data/`, so no import step is needed to run it.

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve the built site locally |
| `npm run import` | Rebuild `src/data/*.json` from the files cached in `sources/` |
| `npm run import:fresh` | Download every source again, then import |
| `npm run brand` | Regenerate the share image, touch icon and donation QR |

## Project layout

```
scripts/import.mjs    Downloads the source collections and writes src/data/*.json
scripts/og.mjs        Renders brand images
src/data/             Generated prompt data (committed, so the site builds without an import)
src/i18n.ts           Every interface string
src/lib/              Data access, route helpers, structured data, copy counter config
src/components/       Cards, prompt box, filters, pagination, logo
src/views/            Page bodies
src/pages/            Routes; each file picks a view and its static paths
src/styles/global.css Design tokens, light and dark themes
public/               Static files
vercel.json           Redirects and response headers
```

## Content sources

Defined in `scripts/import.mjs` (`SOURCES`) and listed on the site's Credits page.

| Collection | License | Used for |
|---|---|---|
| [jau123/nanobanana-trending-prompts](https://github.com/jau123/nanobanana-trending-prompts) | CC BY 4.0 | image prompts |
| [YouMind-OpenLab/awesome-nano-banana-pro-prompts](https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts) | CC BY 4.0 | image prompts |
| [ZeroLu/awesome-nanobanana-pro](https://github.com/ZeroLu/awesome-nanobanana-pro) | MIT | image prompts |
| [freestylefly/awesome-gpt-image-2](https://github.com/freestylefly/awesome-gpt-image-2) | MIT | image prompts |
| [Evolink-AI/awesome-gpt-image-2-API-Prompts](https://github.com/Evolink-AI/awesome-gpt-image-2-API-Prompts) | CC0 1.0 | image prompts |
| [LearnPrompt/awesome-seedance](https://github.com/LearnPrompt/awesome-seedance) | MIT | video prompts |
| [opensource-works/awesome-seedance-prompts](https://github.com/opensource-works/awesome-seedance-prompts) | MIT | video prompts |
| [YouMind-OpenLab/awesome-seedance-2-prompts](https://github.com/YouMind-OpenLab/awesome-seedance-2-prompts) | CC BY 4.0 | video prompts |
| [YouMind-OpenLab/awesome-grok-imagine-prompts](https://github.com/YouMind-OpenLab/awesome-grok-imagine-prompts) | CC BY 4.0 | video prompts |
| [f/prompts.chat](https://github.com/f/prompts.chat) | CC0 1.0 (prompts) | text prompts (ChatGPT) |
| [mustvlad/ChatGPT-System-Prompts](https://github.com/mustvlad/ChatGPT-System-Prompts) | MIT | text prompts (ChatGPT) |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | MIT | agent prompts (Claude) |
| [wshobson/agents](https://github.com/wshobson/agents) | MIT | agent and command prompts (Claude) |
| [JosephHampton/awesome-gemini-cli-subagents](https://github.com/JosephHampton/awesome-gemini-cli-subagents) | CC0 1.0 | agent prompts (Gemini) |
| [YouMind-OpenLab/awesome-gemini-3-prompts](https://github.com/YouMind-OpenLab/awesome-gemini-3-prompts) | CC BY 4.0 | text prompts (Gemini) |
| [danielmiessler/Fabric](https://github.com/danielmiessler/Fabric) | MIT | text prompts (any model) |
| [abilzerian/LLM-Prompt-Library](https://github.com/abilzerian/LLM-Prompt-Library) | MIT | text prompts (any model) |
| [anthropics/skills](https://github.com/anthropics/skills) | per skill | links only |

The Skills page also links to community skill repositories; only their names, descriptions and licenses are shown.

### How content is handled

- Sample images and video clips are loaded from the original collections' servers. This repository and the site store no copies of them.
- Prompt text is unchanged. Some titles are shortened and categories regrouped.
- A video prompt is listed only when it has both a playable clip and its prompt.
- The import applies a keyword filter (`BLOCK` in `scripts/import.mjs`) to keep the site family-friendly. It is deliberately strict and reads prompt text only, not images.
- Titles for the jau123 collection are derived from the first line of each prompt.

## Copy counter

The "prompts copied" numbers come from two Supabase database functions, `mt_copy_bump` and `mt_copy_get`, called from the browser with a publishable key (`src/lib/counter.ts`). The key is meant to be public. To run your own copy of the site, point `COUNTER` at your own project or remove the counter; the rest of the site does not depend on it.

## Content removal

If you own a prompt or image shown on the site and want it removed, see https://fillprompt.com/credits#removal or open a [content removal issue](../../issues/new?template=content-removal.yml).

## Contributing

Bug reports, fixes and suggestions for new open-source prompt collections are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). Everyone taking part is expected to follow the [code of conduct](CODE_OF_CONDUCT.md). To report a security problem privately, see [SECURITY.md](SECURITY.md).

## Support

fillprompt.com is free and run by one person. If it saves you time, you can support it on [Ko-fi](https://ko-fi.com/mwrazzuwan) or through the [donate page](https://fillprompt.com/donate). Support never changes which prompts are shown or how they are ranked.

## License

The source code is released under the [MIT License](LICENSE). The prompt data in `src/data/` keeps the license of the collection it came from (see [Content sources](#content-sources)). The fillprompt name, logo and brand files are not licensed for reuse.
