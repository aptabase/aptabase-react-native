import { useState } from "react";
import { Button, Text, View } from "react-native";
import { useAptabase } from "@aptabase/react-native";

export function Counter() {
  const { trackEvent } = useAptabase();
  const [count, setCount] = useState(0);

  const increment = () => {
    trackEvent("increment");
    setCount(count + 1);
  };

  const decrement = () => {
    trackEvent("decrement");
    setCount(count - 1);
  };

  return (
    <View>
      <Button onPress={increment} title="Increment" />
      <Button onPress={decrement} title="Decrement" />
      <Text>Count is {count}</Text>
    </View>
  );
}
