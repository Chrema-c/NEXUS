# NEXUS — Cyber Security Awareness Web App

## What's in this build
Every one of the 30 items (10 Tools, 10 Quizzes, 10 Games) has been rebuilt per the agreed spec:
- All fake/misleading mechanics replaced with real ones (real EXIF via `exifr`, real QR decoding via `jsQR`, real SHA-free steganography/ELA analysis, real Google Safe Browsing + MX record checks via serverless functions)
- All identified bugs fixed (Phishing Detective's fixed fake-position bug, Spot The Secret's answer-giveaway — replaced entirely, brand-impersonation false positives in URL Analyzer, etc.)
- 3 tools and 3 games fully replaced with new concepts (Browser Fingerprint Checker, Encryption Playground, Metadata Stripper / Threat Triage, Red Flag Hunter, Scam Call Simulator)
- All 4 checklist-style quizzes converted to real MCQ learning quizzes

## One-time setup after deploying to Vercel
1. Deploy this folder to Vercel as-is (Framework Preset: **Other**, no build command needed).
2. The `/api` folder is auto-detected as serverless functions — nothing to configure there.
3. **Optional but recommended:** get a free Google Safe Browsing API key at https://console.cloud.google.com (enable the "Safe Browsing API"), then in your Vercel project go to **Settings → Environment Variables** and add:
   - Name: `GOOGLE_SAFE_BROWSING_KEY`
   - Value: your key
   Without this, URL Analyzer still works fully — it just skips the live Google verdict and shows a message that the check is unavailable.
4. MX record checking (Email Verifier) needs no key — it uses Google's free public DNS API.

## Structure
- `index.html` / `css/main.css` — unchanged design system (snap-scroll, glassmorphism, etc.)
- `js/data.js` — all 30 items' content, all quiz questions, all end screens
- `js/tools-logic.js` — all tool/game logic and content banks
- `js/main.js` — routing, rendering wiring, and all game engines
- `js/render.js` — HTML generation for every page type
- `api/checkurl.js` — Google Safe Browsing serverless proxy
- `api/checkmx.js` — MX record serverless check


## v2 changes (homepage restructure + quiz fix + polish)
- Homepage trimmed from 7 sections to 5: Hero, Origin Story, What NEXUS Has, Everything You Need (now incl. a Learn box), Full How-To Guide
- Removed the old fake usage-stats section and the global threat map/timeline sections entirely
- **Fixed a real bug:** quiz answers were landing on option B far too often (up to 10/10 questions in some quizzes). Options now shuffle on every render, so no pattern can exist regardless of underlying data order
- Added dark/light mode toggle (navbar, after Reach Us) with localStorage persistence
- Accessibility: skip-to-content link, keyboard navigation for all clickable cards/buttons/quiz options (Tab + Enter/Space), visible focus rings, prefers-reduced-motion support
- Performance: all scripts deferred, meta/OG tags added for link previews
- Security headers added via vercel.json (X-Frame-Options, X-Content-Type-Options, etc.) — the cybersecurity app now also follows basic web security hygiene itself
