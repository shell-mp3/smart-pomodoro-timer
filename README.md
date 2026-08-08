# FocusFlow

AI-powered Pomodoro timer with real-time focus tracking using your webcam.

## Features

- **Smart Focus Detection**: Uses TensorFlow.js to detect:
  - Face visibility
  - Eye state (open/closed)
  - Head orientation
  - Phone detection (COCO-SSD)

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
- TensorFlow.js
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
cd focusflow
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. (Optional) Configure Supabase:
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to Settings > API and copy your URL and anon key
   - Update `.env` with your credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. (Optional) Run the database schema:
   - Go to Supabase Dashboard > SQL Editor
   - Copy and run the contents of `supabase/schema.sql`

6. (Optional) Enable Google OAuth:
   - Go to Supabase Dashboard > Authentication > Providers
   - Enable Google provider
   - Configure OAuth credentials from Google Cloud Console

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
   - Pick up your phone
   - Leave the camera view
4. Complete 4 work sessions for a long break

### Offline Mode

FocusFlow works without Supabase configuration:
- Settings are saved in localStorage
- Session data is stored locally
- All features work except cloud sync

### Focus Detection

The app uses AI models running in your browser:
- **Face Landmarks Detection**: MediaPipe Face Mesh via TensorFlow.js
- **Object Detection**: COCO-SSD for phone detection

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
focusflow/
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
