AgriGuide: Crop Disease Detection & Advisory (Starter)

Overview
AgriGuide is a multilingual assistant scaffold for early crop disease detection and advisory. It includes:
- Image upload UI with language selector
- API route `/api/analyze` returning prompt-compliant JSON (stubbed)
- Basic results rendering and browser TTS playback
- Tailwind UI and App Router

Getting Started
1) Install deps
```bash
pnpm install
```
2) Run dev server
```bash
pnpm dev
```
Open http://localhost:3000

Build
```bash
pnpm build && pnpm start
```

API Contract (JSON)
The `POST /api/analyze` endpoint returns a payload aligned with the app’s system prompt schema, including `findings`, `urgency`, `escalation_advice`, and optional `audio_script`.

Model Integration
- Replace the stub logic in `src/app/api/analyze/route.ts` to call your detector (e.g., hosted model).
- Accept `multipart/form-data` with `image`, `language`, and optional `crop`.
- Populate `regions` with bounding boxes or masks and fill actionable guidance per safety rules.

Safety & Privacy
- Always include PPE, PHI/REI and label adherence notes when suggesting chemicals.
- Keep user data private; only use anonymized images to improve models when consented.
