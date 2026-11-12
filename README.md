# EAFC27 JEBAT

A premium football esports dashboard for tactic planning, squad analysis, player recommendation and AI coaching.

## Features
- Stadium-themed home dashboard and mobile navigation
- Squad upload and analysis workflow
- JEBAT chat interface with structured assistant responses
- Formation visualizer and recommendation system
- Match history and squad builder sections
- PWA manifest and service worker
- Secure backend adapter for real AI integration via environment variables

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start app:
   ```bash
   npm run dev
   ```

This starts both the Vite frontend and the Express API server.

## Production build

```bash
npm run build
```

## Notes
The app includes a secure backend interface for real AI providers. If credentials are not configured, the app operates in a safe, transparent demo mode and clearly reports the missing setup.
