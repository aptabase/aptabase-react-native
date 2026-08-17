import { Button, StyleSheet } from 'react-native';
import { trackError } from '@aptabase/react-native';

import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';

export default function TabOneScreen() {
  const trackHandledError = () => {
    try {
      throw new Error('handled test error from HelloWorldExpoRouter');
    } catch (error) {
      trackError(error);
    }
  };

  const throwUncaughtError = () => {
    // thrown outside of React's render path so it reaches the
    // global error handler installed by enableCrashReporting
    setTimeout(() => {
      throw new Error('uncaught test error from HelloWorldExpoRouter');
    }, 0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
      <Button onPress={trackHandledError} title="Track handled error" />
      <Button onPress={throwUncaughtError} title="Throw uncaught error" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
