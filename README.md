![Aptabase](https://aptabase.com/og.png)

# React Native SDK for Aptabase

Instrument your React Native or Expo apps with Aptabase, an Open Source, Privacy-First and Simple Analytics for Mobile, Desktop and Web Apps.

## Install

Install the SDK using `npm` or your preferred JavaScript package manager

```bash
npm add @aptabase/react-native
```

## Usage

First, you need to get your `App Key` from Aptabase, you can find it in the `Instructions` menu on the left side menu.

Initialize the SDK as early as possible, ideally before declaring the `App` component:

```js
import { init } from "@aptabase/react-native";

init("<YOUR_APP_KEY>"); // 👈 this is where you enter your App Key
```

Afterwards, you can start tracking events with `trackEvent`:

```js
import { trackEvent } from "@aptabase/react-native";

trackEvent("app_started"); // An event with no properties
trackEvent("screen_view", { name: "Settings" }); // An event with a custom property
```

**Note for Expo apps:** Events sent during development while running on Expo Go will not have the `App Version` property because native modules are not available in Expo Go. However, when you build your app and run it on a real device, the `App Version` property will be available. Alternatively, you can also set the `appVersion` during the `init` call so that it's available during development as well.

A few important notes:

1. The SDK will automatically enhance the event with some useful information, like the OS, the app version, and other things.
2. You're in control of what gets sent to Aptabase. This SDK does not automatically track any events, you need to call `trackEvent` manually.
   - Because of this, it's generally recommended to at least track an event at startup
3. You do not need to await for the `trackEvent` function, it'll run in the background.
4. Only strings and numbers values are allowed on custom properties

## Preparing for Submission to Apple App Store

When submitting your app to the Apple App Store, you'll need to fill out the `App Privacy` form. You can find all the answers on our [How to fill out the Apple App Privacy when using Aptabase](https://aptabase.com/docs/apple-app-privacy) guide.

