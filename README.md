# Twospeak

Twospeak is a Duolingo-inspired AI language learning app built with Expo and
React Native. The project is designed as a production-quality teaching app:
each feature should be simple to understand, easy to extend, and close to a
real mobile product.

The app currently focuses on the visual foundation and onboarding experience.
Future lessons will combine playful language practice with AI-powered teaching,
chat, video, audio, XP, streaks, and language selection.

## Current Status

Implemented:

- Mobile-first onboarding screen matching the provided design reference.
- Root route (`/`) opening the onboarding experience directly.
- Dedicated onboarding route at `/onboarding`.
- Development-only design system screen at `/design-system`.
- Centralized app image imports in `src/constants/images.ts`.
- Poppins typography loaded through Expo Font.
- NativeWind v5 preview utilities for reusable UI styling.
- Shared color, radius, shadow, and typography tokens in `src/theme`.

Planned:

- Clerk authentication.
- Language selection.
- Lesson map and lesson detail screens.
- Vocabulary and review flows.
- Local XP, streak, and completion state with Zustand and AsyncStorage.
- Stream video and real-time communication.
- Stream Vision Agents for AI video teacher lessons.
- Secure server-side routes for tokens, secrets, and AI calls.

## Tech Stack

- Expo 56
- React 19
- React Native 0.85
- TypeScript
- Expo Router
- NativeWind `5.0.0-preview.4`
- Tailwind CSS v4
- React Native CSS
- Expo Font
- Expo Symbols

The long-term product stack also includes Clerk, Zustand, AsyncStorage, Stream,
and server-side API routes. Those should be added feature by feature when the
project reaches the matching lesson.

## Project Structure

```txt
src/
  app/
    _layout.tsx          Root Expo Router layout and font loading
    index.tsx            Root route, currently re-exporting onboarding
    onboarding.tsx       Current onboarding screen
    design-system.tsx    Development-only design system reference
  constants/
    brand.ts             App display name constants
    images.ts            Centralized image imports
  theme/
    fonts.ts             Poppins font registration
    index.ts             Theme exports
    tokens.css           NativeWind/Tailwind theme tokens
    tokens.ts            TypeScript design tokens

assets/
  fonts/                 Poppins font files
  images/                App images and mascots

global.css               NativeWind imports and reusable utilities
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Opens the onboarding screen. |
| `/onboarding` | Direct onboarding screen route. |
| `/design-system` | Visual token and component reference for development. |

`/design-system` redirects back to `/` in production builds.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm start
```

Run on web:

```bash
npm run web
```

Run on iOS Simulator:

```bash
npm run ios
```

Run on Android Emulator:

```bash
npm run android
```

## Quality Checks

Run linting:

```bash
npm run lint
```

Run TypeScript validation:

```bash
npm run typecheck
```

Both commands should pass before pushing or merging a feature branch.

## Design System Notes

The visual foundation lives in two places:

- `src/theme/tokens.ts` for TypeScript values used by React Native styles.
- `src/theme/tokens.css` and `global.css` for NativeWind/Tailwind utilities.

Use NativeWind class names for normal layout and styling. Use `StyleSheet` or
inline styles only for React Native-specific exceptions such as `SafeAreaView`,
`ScrollView` content containers, shadows, transforms, and dynamic measurements.

Images should be imported once in `src/constants/images.ts` and consumed through
the exported `images` object:

```tsx
import { images } from "@/constants/images";

<Image source={images.mascotLogo} />;
```

## Development Principles

- Build one feature at a time.
- Keep screens readable and teachable.
- Avoid adding new major libraries without a strong reason.
- Prefer existing project patterns over new abstractions.
- Keep reusable UI in components only when it improves clarity.
- Store hardcoded lesson content in `data/` when lessons are introduced.
- Store reusable client state in Zustand when global state is needed.
- Never expose Clerk, Stream, AI, or token secrets in the mobile app.

## Feature Roadmap

Recommended next steps:

1. Add a language selection screen after onboarding.
2. Add local selected-language state.
3. Build the first lesson list with hardcoded lesson data.
4. Add lesson completion and XP persistence.
5. Add authentication with Clerk.
6. Add chat-based AI tutor lessons through secure API routes.
7. Add video teacher lessons with Stream and Vision Agents.

## Repository Workflow

Use feature branches for each lesson or feature:

```bash
git checkout -b codex/feature-name
```

Before opening or merging a pull request:

```bash
npm run lint
npm run typecheck
```

Keep commits focused. A good commit should explain one clear product or code
change, not a bundle of unrelated edits.
