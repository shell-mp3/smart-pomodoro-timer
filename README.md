# Pomodoro Timer

A Pomodoro timer that only counts the time you are actually focused. Your
camera tells it when your attention has drifted; all detection runs locally in
the browser and no video leaves your device.

## Features

- **Smart Focus Detection**: Uses MediaPipe Tasks Vision to detect:
  - Face visibility
  - Eye state (open/closed)
  - Head orientation

- **Pomodoro Timer**: Classic Pomodoro technique with:
  - Configurable work sessions (5-60 minutes)
  - Short breaks (1-15 minutes)
  - Long breaks (5-30 minutes)
  - Auto-pause when focus is lost

- **Dashboard & Analytics**:
  - Daily focus statistics
  - Session history charts
  - Distraction breakdown
  - Focus streak tracking
  - CSV export

- **Customization**:
  - Adjustable sensitivity levels
  - Sound notifications
  - Browser notifications

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- React Router v6
- Recharts
- MediaPipe Tasks Vision
- Supabase (Auth + Database)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (optional, for cloud sync)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pomodoro-timer
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. (Optional) Set up accounts and sync — see
   [Accounts and Google sign-in](#accounts-and-google-sign-in) below. Skip it
   and the app runs fully offline against localStorage.

### Development

Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## Usage

### Timer

1. Allow camera access when prompted
2. Click the play button to start a work session
3. Stay focused - the timer pauses if you:
   - Look away from the screen
   - Close your eyes for too long
   - Leave the camera view
4. Complete 4 work sessions for a long break

### Offline Mode

Pomodoro Timer works without Supabase configuration:
- Settings are saved in localStorage
- Session data is stored locally
- All features work except cloud sync

### Focus Detection

The app uses AI models running in your browser:
- **Face Landmarks Detection**: MediaPipe Tasks FaceLandmarker (WebAssembly)

All processing happens locally - no video is sent to servers.

## Configuration

### Sensitivity Levels

| Level  | Grace Period | Description |
|--------|--------------|-------------|
| Low    | 5 seconds    | More forgiving, allows brief distractions |
| Medium | 3 seconds    | Balanced detection (default) |
| High   | 1 second     | Strict focus tracking |

### Settings

All settings are accessible from the Settings page:
- Timer durations
- Sensitivity level
- Sound notifications
- Browser notifications

## Project Structure

```
pomodoro-timer/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Auth/          # Authentication components
│   │   ├── Camera/        # Camera feed and overlay
│   │   ├── Dashboard/     # Stats and charts
│   │   ├── Detection/     # AI detection hooks
│   │   ├── Settings/      # Settings forms
│   │   ├── Timer/         # Timer display and controls
│   │   └── UI/            # Reusable UI components
│   ├── context/           # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Third-party configs
│   ├── pages/             # Route pages
│   └── utils/             # Utility functions
├── supabase/
│   └── schema.sql         # Database schema
└── ...config files
```

## Accounts and Google sign-in

Entirely optional. Without it the app works offline and keeps everything in
localStorage. With it, sessions and settings follow you between devices.

All of the app-side code already exists. These steps only create the accounts
and paste in two keys.

### 1. Create the Supabase project

1. Sign in at [supabase.com](https://supabase.com) and create a project.
2. Open **SQL Editor** and run, in this order:
   - `supabase/schema.sql` — settings, sessions and distraction tables
   - `supabase/migrations/0002_profiles.sql` — profiles, plus a trigger that
     creates a profile row automatically on signup
3. Open **Settings → API** and copy the **Project URL** and the **anon public**
   key into `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The anon key is meant to be public — it ships in the browser bundle by design.
Row Level Security is what protects the data: every table has policies
restricting rows to `auth.uid()`, so one account cannot read another's.

The **service_role** key is the opposite. It bypasses RLS entirely. Never put
it in `.env`, this repo, or anything the browser loads.

### 2. Create the Google OAuth client

1. In [Google Cloud Console](https://console.cloud.google.com), create a
   project, then go to **APIs & Services → OAuth consent screen**. Choose
   **External**, fill in the app name and your support email, and add your own
   address under **Test users** while the app is unpublished.
2. Go to **Credentials → Create credentials → OAuth client ID**, type
   **Web application**.
3. Under **Authorized redirect URIs** add exactly one entry — your Supabase
   callback, not your app's URL:

```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

4. Copy the **Client ID** and **Client secret**.

### 3. Connect them

1. In Supabase, go to **Authentication → Providers → Google**, enable it, and
   paste the Client ID and secret.
2. Go to **Authentication → URL Configuration** and set:
   - **Site URL**: `http://localhost:3000` for local work
   - **Redirect URLs**: add both `http://localhost:3000` and your deployed
     origin, e.g. `https://your-app.vercel.app`

Sign-in sends people back to `window.location.origin`, so any origin you use
has to be listed here or Supabase refuses the redirect.

### 4. Deploying

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Settings →
Environment Variables** in Vercel, then redeploy. Vite inlines `VITE_*` values
at build time, so a redeploy is required — setting them is not enough.

### Troubleshooting

| Symptom | Cause |
|---|---|
| "Offline Mode" on the sign-in page | `.env` missing or not picked up — restart the dev server |
| `redirect_uri_mismatch` from Google | The redirect URI must be the Supabase `/auth/v1/callback` URL, not your app's |
| Signs in, bounces back signed out | Your origin is not in Supabase's **Redirect URLs** |
| Signed in but no name or avatar | `0002_profiles.sql` has not been run; the app falls back to Google metadata |
| Works locally, not on Vercel | Env vars not set in Vercel, or set but not redeployed |

## Deploying to GitHub Pages

Pushing to `main` builds and publishes automatically via
`.github/workflows/deploy.yml`. The site lands at:

```
https://<user>.github.io/<repo>/
```

### One-time setup

1. **Settings → Pages → Source: GitHub Actions.** Without this the workflow
   runs and the deploy step fails.
2. **Settings → Secrets and variables → Actions**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   Vite inlines `VITE_*` at build time, so these are needed by the build, not
   the runtime. The anon key ends up in the published bundle either way - that
   is by design, and row level security is what protects the data. Keeping it
   in secrets just avoids committing it.
3. **Allow the new origin for sign-in**, or Google will refuse the redirect:
   - Google Cloud Console → Clients → your OAuth client →
     **Authorized JavaScript origins**: add `https://<user>.github.io`
   - Supabase → Authentication → URL Configuration → **Redirect URLs**:
     add `https://<user>.github.io/<repo>/` (with the trailing slash)

### Why a project site needs extra care

A project site is served from `/<repo>/`, not the domain root, and GitHub
Pages has no server-side rewrites. Three pieces handle that:

- `BASE_PATH` in the workflow sets Vite's `base`, so asset URLs carry the
  prefix. Left unset (local dev, Vercel) it stays at `/`.
- `BrowserRouter basename={import.meta.env.BASE_URL}` tells the router the
  same thing.
- `public/404.html` catches direct hits on client-side routes, stashes the
  path in the query string and bounces to `index.html`, which restores it
  before React mounts.

OAuth redirects use `appUrl()` rather than `window.location.origin`, because
the origin alone points at the domain root, which is not the app.

## Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Safari (limited WebGL support)

## Privacy

- All video processing happens locally in your browser
- No video data is transmitted or stored
- Session data is only synced if you sign in

## License

MIT
