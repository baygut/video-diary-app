# Video Diary App

An Expo Router app for saving short video diary moments locally on device.
Users can pick a video, trim a short segment, add name/description metadata,
watch entries in a diary list, and browse them in a TikTok-style feed.

## Prerequisites

- Node.js compatible with Expo SDK 56. Expo lists Node.js 22.13.x as the SDK 56 minimum.
- npm
- Xcode for iOS builds and/or Android Studio for Android builds.

This app uses `expo-trim-video`, which requires a native build. Expo Go is not
enough for the full app because it does not include this native module.

## Setup

Install dependencies:

```bash
npm install
```

Build and run the native app:

```bash
npm run ios
```

or:

```bash
npm run android
```

After the native app is installed, start the Expo dev server when needed:

```bash
npm run start
```

Then use the installed native app or development build to connect to Metro.

Expo Go can be used only for limited UI checks that do not touch video trimming.
For normal development and QA, use a native build:

```bash
npm run ios
npm run android
```

## Usage

1. Open the Diary tab.
2. Tap the floating add button.
3. Grant media library permission if prompted.
4. Pick a video from the device.
5. Choose the clip start and duration in the trim step.
6. Add an entry name and optional description.
7. Save the entry.

Saved entries appear in the diary list. Open an entry to view details, edit the
name/description from the header button, or delete it from the diary card.

The Feed tab shows saved diary videos as a vertically paged feed. The active
feed item autoplays only while the Feed tab is focused.

## Scripts

```bash
npm run start      # Start Expo
npm run ios        # Build/run iOS
npm run android    # Build/run Android
npm run web        # Start web target
npm run lint       # Run Expo lint
npm run generate   # Generate OpenAPI output
```

Type-check manually with:

```bash
npx tsc --noEmit
```

## Data And Storage

- Diary metadata is stored with `expo-sqlite`.
- Selected/trimmed video files are stored locally on device.
- Deleting a diary entry also removes its associated local upload files when possible.
- App settings such as theme, language, and sort order are persisted with SQLite KV storage through Zustand.

## Notes

- The app uses Expo SDK 56, Expo Router, `expo-video`, `expo-image-picker`,
  `expo-trim-video`, NativeWind, React Query, and FlashList.
- `expo-trim-video` is a native module, so iOS/Android native builds are required
  for the main create-entry flow.
- Theme switching depends on NativeWind class dark mode. Restart the dev server
  after changing Tailwind or NativeWind configuration.
- Video picker and trimming features require a real device or simulator with
  media library access.

## Troubleshooting

- If theme changes do not appear, restart Expo after Tailwind config changes.
- If video picking fails, confirm media library permissions and try a local video file.
- If video trimming is missing or crashes in Expo Go, run a native build with
  `npm run ios` or `npm run android`.
- If native module behavior changes after dependency updates, rebuild with
  `npm run ios` or `npm run android`.
