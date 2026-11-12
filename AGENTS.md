# Profile design

This repository contains Renz Sarucam's GitHub profile README and its local HTML preview.

- Keep the realistic desk/workspace composition and light/dark animated GIF variants with realistic PNG fallbacks and editable SVG sources unless the user asks to change them. The original illustrated SVGs are retained as earlier artwork.
- Keep the banner subtitle `Full Stack Developer | Web Developer`.
- Keep README and preview content consistent. GitHub README support constrains the design; the preview is not a separate website.
- For design work, consult `.agents/skills/taste-skill/SKILL.md` (Taste Skill / `design-taste-frontend`) and `.agents/skills/ui-ux-pro-max/SKILL.md` (UI/UX Pro Max). Apply their guidance within the user's requested style and README constraints.
- Preserve existing personal details and illustration attribution in `assets/SOURCES.md`.

- Use absolute raw.githubusercontent.com asset URLs in README picture sources; keep local asset paths in preview.html. GitHub does not rewrite relative source srcset paths on profile pages.
- Wrap each linked picture in a div HTML block in README.md. Inline anchor/picture markup can be split into paragraphs by GitHub Markdown, leaving source and image tags outside the picture. Verify the GitHub-rendered HTML keeps each image inside its picture.
