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
