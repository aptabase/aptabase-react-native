import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { AptabaseProvider } from "@aptabase/react-native";
import { Counter } from "./Counter";

// hoisted so the provider's effect doesn't re-init on every render
const aptabaseOptions = {
  enableCrashReporting: true,
  enableWeb: true,
  appVersion: "1.0.0",
};

export default function App() {
  return (
    <AptabaseProvider appKey="A-DEV-4952820259" options={aptabaseOptions}>
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <Counter />
        <StatusBar style="auto" />
      </View>
    </AptabaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
