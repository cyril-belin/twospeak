# Twospeak

Twospeak is a Duolingo-inspired AI language learning app built with Expo and
React Native. The project is designed as a production-quality teaching app:
each feature should be simple to understand, easy to extend, and close to a
real mobile product.

The app currently focuses on the visual foundation, onboarding experience, and
Clerk-backed authentication flow. Future lessons will combine playful language
practice with AI-powered teaching, chat, video, audio, XP, streaks, and language
selection.

## Current Status

Implemented:

- Mobile-first onboarding screen matching the provided design reference.
- Root route (`/`) protected by Clerk authentication.
- Dedicated onboarding route at `/onboarding`.
- Sign Up route at `/sign-up` with real Clerk email/password auth, social auth,
  and 6-digit email verification.
- Sign In route at `/sign-in` with real Clerk email/password auth, social auth,
  and email-code verification when Clerk requires it.
- Onboarding Get Started flow navigating into Sign Up.
- Auth-aware routing: signed-out users see onboarding, signed-in users see home.
- Local Clerk session persistence through `expo-secure-store`.
- Development-only design system screen at `/design-system`.
- Centralized app image imports in `src/constants/images.ts`.
- Poppins typography loaded through Expo Font.
- NativeWind v5 preview utilities for reusable UI styling.
- Shared color, radius, shadow, and typography tokens in `src/theme`.

Planned:

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
- Clerk Expo SDK
- Expo SecureStore
- Expo AuthSession
- Expo WebBrowser
- Expo Crypto
- Expo Apple Authentication
- NativeWind `5.0.0-preview.4`
- Tailwind CSS v4
- React Native CSS
- Expo Font
- Expo Symbols

The long-term product stack also includes Zustand, AsyncStorage, Stream, and
server-side API routes. Those should be added feature by feature when the
project reaches the matching lesson.

## Project Structure

```txt
src/
  app/
    (auth)/
      _layout.tsx        Redirects authenticated users away from auth screens
      sign-in.tsx        Sign In route
      sign-up.tsx        Sign Up route
    _layout.tsx          Root Expo Router layout, fonts, and Clerk provider
    index.tsx            Authenticated home route
    onboarding.tsx       Current onboarding screen
    design-system.tsx    Development-only design system reference
  components/
    auth/
      auth-screen.tsx    Shared Sign Up / Sign In UI and verification modal
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
| `/` | Authenticated home route. Redirects signed-out users to `/onboarding`. |
| `/onboarding` | Signed-out onboarding route. Redirects signed-in users to `/`. |
| `/sign-up` | Clerk account creation with email/password, social auth buttons, and verification modal. |
| `/sign-in` | Clerk sign-in with email/password, social auth buttons, and verification handling. |
| `/design-system` | Visual token and component reference for development. |

`/design-system` redirects back to `/` in production builds.

## Authentication

Authentication is handled with Clerk's Expo SDK.

Email sign-up creates a Clerk sign-up attempt, sends an email verification code,
and finalizes the session after the user enters the 6-digit code. Email sign-in
uses Clerk password authentication and opens the same verification modal when
Clerk requires an email-code step.

Social auth uses Clerk social providers:

- Google uses Clerk native sign-in when the required Google client IDs are
  configured and falls back to the browser-based SSO flow otherwise.
- Apple uses native Sign in with Apple on iOS.
- Facebook uses Clerk's browser-based SSO flow.

Never expose Clerk secret keys in the mobile app. Only the publishable key uses
the `EXPO_PUBLIC_` prefix.

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Then add your Clerk publishable key:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key-here
```

Optional Google native sign-in values can also be added to `.env.local`:

```env
EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_CLERK_GOOGLE_IOS_CLIENT_ID=your-google-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME=com.googleusercontent.apps.your-google-ios-client-id
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

The JavaScript email/password flow works in Expo Go. Native Google and Apple
sign-in require Clerk dashboard setup and a development build.

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

1. Add a language selection screen after onboarding/auth.
2. Add local selected-language state.
3. Build the first lesson list with hardcoded lesson data.
4. Add lesson completion and XP persistence.
5. Add chat-based AI tutor lessons through secure API routes.
6. Add video teacher lessons with Stream and Vision Agents.

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
