import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { AptabaseProvider } from "@aptabase/react-native";
import { Counter } from "./Counter";

export default function App() {
  return (
    <AptabaseProvider appKey="A-US-0928558097">
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
