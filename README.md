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

Initialize the SDK by using the `AptabaseProvider` on your `App` component:

```js
import { AptabaseProvider } from "@aptabase/react-native";

export default function App() {
  return (
    <AptabaseProvider appKey="<YOUR_APP_KEY>">
      <Counter />
    </AptabaseProvider>
  );
}
```

Afterwards, you can start tracking events with `trackEvent` from `useAptabase` hook:

```js
import { useAptabase } from "@aptabase/react-native";
import { useState } from "react";

export function Counter() {
  const { trackEvent } = useAptabase();
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
    trackEvent("increment", { count });
  };

  const decrement = () => {
    setCount(count - 1);
    trackEvent("decrement", { count });
  };

  return (
    <View>
      <Button onPress={increment} title="Increment" />
      <Button onPress={decrement} title="Decrement" />
      <Text>Count is {count}</Text>
    </View>
  );
}
```

**Note for Expo apps:** Events sent during development while running on Expo Go will not have the `App Version` property because native modules are not available in Expo Go. However, when you build your app and run it on a real device, the `App Version` property will be available. Alternatively, you can also set the `appVersion` during the `AptabaseProvider` initialization so that it's available during development as well.

A few important notes:

1. The SDK will automatically enhance the event with some useful information, like the OS, the app version, and other things.
2. You're in control of what gets sent to Aptabase. This SDK does not automatically track any events, you need to call `trackEvent` manually.
   - Because of this, it's generally recommended to at least track an event at startup
3. You do not need to await for the `trackEvent` function, it'll run in the background.
4. Only strings and numbers values are allowed on custom properties

## Preparing for Submission to Apple App Store

When submitting your app to the Apple App Store, you'll need to fill out the `App Privacy` form. You can find all the answers on our [How to fill out the Apple App Privacy when using Aptabase](https://aptabase.com/docs/apple-app-privacy) guide.
