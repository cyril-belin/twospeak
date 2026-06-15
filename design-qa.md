**Source Visual Truth**
- Path: `/Users/cyril/Documents/twospeak/assets/prompt_material/05-home-and-tab-navigation.png`

**Implementation Capture**
- Path: `/Users/cyril/Documents/twospeak/design-qa-browser-blocked.png`
- URL: `http://localhost:8082/`
- Viewport: `390 x 904`
- State: Expo web static render error before the app UI rendered.

**Full-View Comparison Evidence**
- Source visual opened locally and reviewed.
- Implementation capture shows the Expo error screen with: `Cannot read properties of undefined (reading 'get')`.
- Because the app UI did not render in the browser, no valid pixel comparison could be performed.

**Focused Region Comparison Evidence**
- Not captured. The implementation never reached the Home screen, so typography, spacing, colors, imagery, copy, and tab navigation could not be compared visually in-browser.

**Findings**
- [P0] Browser visual QA blocked by Expo web static render failure
  Location: local Expo web render at `http://localhost:8082/`.
  Evidence: reference image is available, but the implementation capture shows a server error before the app screen appears.
  Impact: visual fidelity cannot be confirmed from a rendered screenshot.
  Fix: resolve the Expo web static render error or run visual QA on an authenticated native/Expo Go session, then recapture the Home screen at the reference viewport.

**Patches Made Since Previous QA Pass**
- Added Home dashboard data derivation from language, unit, and lesson data.
- Added the Home screen component with Clerk user display, selected language display, daily goal, learning card, Today plan, next-up card, and centralized assets.
- Updated the custom tab bar to match the reference active icon and label treatment.
- Added centralized Home images, including a remote placeholder teacher avatar.

**Implementation Checklist**
- Re-run the app after fixing the web render blocker or using a native capture path.
- Capture the Home screen with a signed-in Clerk user and persisted selected language.
- Compare the five required fidelity surfaces: fonts, spacing, colors, image quality, and copy.
- Fix any P0/P1/P2 differences before marking visual QA passed.

**Follow-Up Polish**
- The screen uses live lesson data, so some text differs from the static reference where the mock says `A1 - Unit 3` and the data currently contains Unit 1.

final result: blocked
