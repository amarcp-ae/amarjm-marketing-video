# amarjm-marketing-video

Remotion video-as-code scaffold for AmarJM marketing films (Master / Vertical / Square).

## Prerequisites

- Node.js 22+
- System `ffmpeg` on `PATH`
- Playwright browsers (installed via `npx playwright install chromium` when capturing)
- Remotion browser binary (`npx remotion browser ensure` before any render)

## Setup

```bash
cp .env.example .env
npm install
npx remotion browser ensure
```

## Run order

1. **capture** — Playwright screenshots into `assets/screens/`, logged in `assets/manifest.json`
   ```bash
   npm run capture
   ```
2. **audio** — ElevenLabs VO → `assets/audio/` (manifest + timestamps)
   ```bash
   npm run audio
   ```
3. **preview** — Remotion Studio
   ```bash
   npm run preview
   ```
4. **render** — master / vertical / square
   ```bash
   npx remotion browser ensure
   npm run render:master
   npm run render:vertical
   npm run render:square
   ```

## Compositions

| ID        | Size                | FPS |
| --------- | ------------------- | --- |
| Master    | 1920×1080           | 30  |
| Vertical  | 1080×1920           | 30  |
| Square    | 1080×1080           | 30  |
| FontCheck | 1920×1080 (1 frame) | 30  |
| S01–S13   | 1920×1080           | 30  |

Scene durations come from `assets/audio/manifest.json` when present; otherwise each scene is **90 frames**.

## Font check

```bash
npx remotion browser ensure
npx remotion still FontCheck out/fontcheck.png
```

Renders: `نظامٌ واحد لتجارة الذهب كلّها` with local IBM Plex Sans Arabic (`.woff2` in `assets/fonts/`).

## Lint / types

```bash
npm run lint
npm run typecheck
```
