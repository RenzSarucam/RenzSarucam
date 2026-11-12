# GitHub-compatible animation exports

The README and local preview use `banner-animated-{light,dark}.gif` and `ecosystem-animated-{light,dark}.gif`. README `<source>` and `<img>` URLs point directly to raw.githubusercontent.com because GitHub profile rendering does not rewrite relative `<source srcset>` paths. Static PNG reduced-motion fallbacks use absolute URLs too. Each linked picture is wrapped in a div HTML block so GitHub Markdown keeps the source and image elements inside the picture; an inline anchor/picture start was being split into separate paragraphs, producing empty themed pictures.

The GIFs render the existing SVG animation timelines at 1100px wide, 6 frames per second, with a 12-second repeating loop. The SVG artwork remains the editable source. Run `npm ci`, `npm run build:svg`, then `npm run build:gif` to regenerate; Chrome/Chromium is required (set `CHROME_PATH` if necessary). Rendering uses Playwright Core and FFmpeg. Intermediate frames stay in the ignored `.taste-skill/` directory.

# Animated profile artwork

The editable animation sources are self-contained `banner-animated-{light,dark}.svg` and `ecosystem-animated-{light,dark}.svg` files. Each embeds the corresponding unchanged realistic PNG and adds native SVG/CSS motion: typing code, a blinking cursor, subtle coffee steam, active tablets with line-clipped highlights and inset button feedback, moving hour/minute/second hands on both clocks, laptop code activity, AI node pulses, sequential DevOps stages, research review highlights (the original document check remains unchanged), notebook highlights clipped to the original angled marks (without extra arrows or lines), terminal output, build progress, and workflow packets. Clock faces are reconstructed locally over the photographed dial; the original casing and surrounding artwork remain. The second hands tick once per second and complete a revolution in 60 seconds. There are no scripts, remote image dependencies, or external fonts inside the SVGs.

Regenerate all four files with `node scripts/animate-profile.mjs`. Keep the realistic PNG files as source artwork and static reduced-motion fallbacks. The HTML preview has a Pause/Play animation control. Native SVG animation also respects `prefers-reduced-motion`.

# Current realistic artwork

The static source artwork consists of these project-local assets created with the built-in imagegen tool:

- `banner-realistic-dark.png`
- `banner-realistic-light.png`
- `ecosystem-realistic-dark.png`
- `ecosystem-realistic-light.png`

These are AI-generated realistic visualizations, not photographs of Renz's actual workspace. The user requested realistic materials and lighting while preserving the earlier illustrated layout. The banner name is `Renz`, without a dot; the subtitle remains `Full Stack Developer | Web Developer`.

The earlier illustrated panels served as composition references. Their source attribution and editable SVG files remain below.

## Generation brief / prompt set

1. **Workspace, dark:** Convert the illustrated desk banner into a realistic photographed miniature workspace. Keep the front-facing composition, navy walls, walnut desk, tablet, Laravel monitor, warm brass lamp, bookcase, plants, evening window, and four hanging technology notes. Use natural materials, plausible lighting and subtle shadows. Exact banner text: `Renz` (no dot) and `Full Stack Developer | Web Developer`. Avoid cartoon outlines, plastic surfaces, excessive glow, and invented microtext.
2. **Ecosystem, dark:** Preserve the `My Ecosystem` header, `My projects` action, and eight cards in four columns and two rows. Replace cartoons with cohesive realistic still-life imagery. Keep exact labels: Laravel, AI Integration, DevOps Automation, Research & Dev, React / Next.js, Always Learning, Dev Tools, My Workflow. Match the navy, walnut, paper, glass, brass, and warm lighting of the banner.
3. **Workspace, light:** Edit the dark workspace into a daytime companion. Preserve all geometry, objects, text, and labels. Use warm ivory walls, natural daylight, a blue-sky window view, navy heading text, and the same walnut furniture and dark screens.
4. **Ecosystem, light:** Edit the dark ecosystem into a daytime companion. Preserve all cards, subjects, labels, and layout. Use ivory framing, navy text, softly daylight-lit physical materials, warm wood surfaces, and dark device screens.

## Earlier illustration source

The earlier light and dark `banner-*.svg` and `ecosystem-*.svg` illustrations are adapted from [KennyMcSimpson/KennyMcSimpson](https://github.com/KennyMcSimpson/KennyMcSimpson/tree/main/assets), restored at the user's request to keep the original illustrated workspace style.

The original artwork, palettes, and CSS animations belong to the reference repository. Personalizations include Renz's name, the subtitle **Full Stack Developer | Web Developer**, technology labels, project links, and accessible image descriptions.

The existing `banner1.png` is retained from this repository's earlier README.

## Project design skills

- [Taste Skill](https://github.com/Leonxlnx/taste-skill), installed at `.agents/skills/taste-skill` (skill name: `design-taste-frontend`).
- [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), installed at `.agents/skills/ui-ux-pro-max`.

Each skill includes its upstream license. Their guidance is applied within GitHub README constraints: preserve the requested illustration, consistent spacing, readable labels, theme variants, keyboard focus in the local preview, and reduced-motion support. Website-only templates and full-screen sections are not applicable to the README.

The terminal caret is aligned beside the final typed line, appears after typing, and stays inside the editor; it does not extend onto the monitor bezel. Use `npm run build:gif -- --kind ecosystem` to regenerate only the ecosystem exports.
