import { useState } from "react";
import { Button, Text, View } from "react-native";
import { useAptabase } from "@aptabase/react-native";

export function Counter() {
  const { trackEvent, trackError } = useAptabase();
  const [count, setCount] = useState(0);

  const increment = () => {
    trackEvent("increment");
    setCount(count + 1);
  };

  const decrement = () => {
    trackEvent("decrement");
    setCount(count - 1);
  };

  const trackHandledError = () => {
    try {
      throw new Error("handled test error from HelloWorldExpo");
    } catch (error) {
      trackError(error);
    }
  };

  const trackFatalError = () => {
    try {
      throw new Error("fatal test error from HelloWorldExpo");
    } catch (error) {
      trackError(error, { fatal: true });
    }
  };

  const throwUncaughtError = () => {
    // thrown outside of React's render path so it reaches the
    // global error handler installed by enableCrashReporting
    setTimeout(() => {
      throw new Error("uncaught test error from HelloWorldExpo");
    }, 0);
  };

  return (
    <View>
      <Button onPress={increment} title="Increment" />
      <Button onPress={decrement} title="Decrement" />
      <Text>Count is {count}</Text>
      <Button onPress={trackHandledError} title="Track handled error" />
      <Button onPress={trackFatalError} title="Track fatal error" />
      <Button onPress={throwUncaughtError} title="Throw uncaught error" />
    </View>
  );
}
