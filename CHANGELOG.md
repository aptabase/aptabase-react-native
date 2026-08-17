## 0.6.0

- Add error reporting: new `trackError(error, { fatal })` function posting structured error reports (type, message, stack trace, severity, kind) with capture-time enrichment and retry on network failures
- Add optional automatic crash reporting via the `enableCrashReporting` init option (reports uncaught JS errors through the global error handler)
- `useAptabase` now also returns `trackError`
- Fix a leak where re-initializing the SDK would register a duplicate AppState listener and `dispose` would not remove it
- The `DEV` region host now points to `https://localhost:3000`, matching the local backend's HTTPS endpoint

## 0.5.1

- Fix Android builds on AGP 8+ by declaring the module `namespace` (moved out of `AndroidManifest.xml`) in [#18](https://github.com/aptabase/aptabase-react-native/pull/18)
- Modernize native config: Android SDK fallbacks 36/24, Java 17, modern `compileSdk`/`minSdk` DSL; iOS deployment target 15.1 and `React-Core` pod dependency in [#18](https://github.com/aptabase/aptabase-react-native/pull/18)
- Update build tooling and CI (TypeScript 6, vitest 4, Node 24) in [#18](https://github.com/aptabase/aptabase-react-native/pull/18)

## 0.5.0

- Adds React Native Web support by @[Robert27](https://github.com/Robert27) in [#13](https://github.com/aptabase/aptabase-react-native/pull/13)

## 0.4.0

- Support for React 19

## 0.3.10

- Add `dispose` function to explicitly stop a started client

## 0.3.9

- Change from `API Version` to `Android Version`

## 0.3.8

- fix typing definitions

## 0.3.7

- use ESM only

## 0.3.6

- fix compilation error on web apps

## 0.3.5

- better version of the session id generator

## 0.3.4

- use new session id format

## 0.3.3

- Changes the way we flush events when app state changes.

## 0.3.2

- Added a warning log when trackEvent is called with invalid parameters

## 0.3.1

- Fixed an issue where the `appBuildNumber` would sometimes be sent as a number instead of a string

## 0.3.0

- Added a new `AptabaseProvider` and `useAptabase` hook to make usage easier

## 0.2.2

- Fix bundled file names

## 0.2.1

- Move bunlder to `tsup`
- export type `AptabaseOptions`

## 0.2.0

- Automatic flush of events on app exit
- Events are now sent in batches to reduce network overhead
- While offline, events will be enqueue and sent when the app is back online

## 0.1.2

- Added an option to set the appVersion during init

## 0.1.1

- Fixed some links on package.json

## 0.1.0

- Initial release
