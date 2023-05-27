![Aptabase](https://aptabase.com/og.png)

# React Native SDK for Aptabase

Instrument your React Native apps with Aptabase, an Open Source, Privacy-First and Simple Analytics for Mobile, Desktop and Web Apps.

## Install

Install the SDK using your preferred JavaScript package manager

```bash
pnpm add @aptabase/react-native
# or
npm add @aptabase/react-native
# or
yarn add @aptabase/react-native
```

## Usage

First you need to get your `App Key` from Aptabase, you can find it in the `Instructions` menu on the left side menu.

Initialize the SDK as early as possible, ideally before calling `AppRegistry.registerComponent`:

```js
import { init } from "@aptabase/react-native";

init("<YOUR_APP_KEY>"); // 👈 this is where you enter your App Key
```

Afterwards you can start tracking events with `trackEvent`:

```js
import { trackEvent } from "@aptabase/react-native";

trackEvent("connect_click"); // An event with no properties
trackEvent("play_music", { name: "Here comes the sun" }); // An event with a custom property
```

A few important notes:

1. The SDK will automatically enhance the event with some useful information, like the OS, the app version, and other things.
2. You're in control of what gets sent to Aptabase. This SDK does not automatically track any events, you need to call `trackEvent` manually.
   - Because of this, it's generally recommended to at least track an event at startup
3. You do not need to await the `trackEvent` function, it'll run in the background.
4. Only strings and numbers values are allowed on custom properties

## Preparing for Submission to Apple App Store

When submitting your app to the Apple App Store, you'll need to fill out the `App Privacy` form. You can find all the answers on our [How to fill out the Apple App Privacy when using Aptabase](https://aptabase.com/docs/apple-app-privacy) guide.

