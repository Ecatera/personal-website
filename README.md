# Static build

A dependency-free reproduction of the Vite/React/Tailwind site in `../src`, as plain
HTML + CSS. No build step, no backend — serve the folder as-is.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole page (was `src/pages/Index.tsx`) |
| `404.html` | Not-found page (was `src/pages/NotFound.tsx`); GitHub Pages serves it automatically |
| `styles.css` | Catppuccin Latte/Frappé tokens + all component styles (replaces Tailwind + `src/index.css`) |
| `main.js` | The four interactive behaviours (see below) |
| `assets/` | Images from `src/assets` |
| `CV_Puca.pdf`, `favicon.ico`, `robots.txt` | Copied from `public/` |
| `.nojekyll` | Stops GitHub Pages running the files through Jekyll |

## What `main.js` covers

React did four things that CSS alone can't. Each is reproduced 1:1:

- **Theme toggle** — swaps `.dark` on `<html>` and persists to `localStorage["theme"]`,
  the same key `next-themes` used. Default is dark, matching `defaultTheme="dark"`.
  An inline script in `<head>` applies the stored theme before first paint so there's no flash.
- **Scroll fade-ins** — `IntersectionObserver` at `threshold: 0.12`, unobserving after the
  first intersection. Per-item delays live in `style="transition-delay:…"`.
- **Origin-story carousel** — prev/next, clickable dots, arrow keys while hovered, and
  40px swipe threshold, with the same 320ms cross-fade.
- **CV toast** — shown on download below 768px viewport width; auto-dismisses after 5s.

All six carousel steps are in the HTML rather than in a JS array, so the text is present
without JavaScript. With JS off you get the full page minus the toggle, carousel and
toast; the fade-in elements stay visible.

## Deploying to GitHub Pages

All asset paths are relative (`./assets/…`), so this works both at a domain root and
under a project subpath like `username.github.io/repo/`.

**Option A — `docs/` folder on `main`:** rename or copy this folder to `docs/`, then in
*Settings → Pages* choose "Deploy from a branch", branch `main`, folder `/docs`.

**Option B — `gh-pages` branch:**

```sh
git subtree push --prefix static origin gh-pages
```

Then point *Settings → Pages* at the `gh-pages` branch, folder `/`.

## Local preview

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening `index.html` directly via `file://` also works.

## Known deviations from the React app

- Fonts still load from Google Fonts, exactly as `src/index.css` did. Self-host the two
  families if you need the page to work fully offline.
- The `og:image` meta tag carries over the original signed Google Cloud Storage URL,
  whose `Expires` timestamp has already passed — link previews won't show an image until
  it's replaced with a real hosted file.
- `.fade-in` transitions are shortened under `prefers-reduced-motion`.
