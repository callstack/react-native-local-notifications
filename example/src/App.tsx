import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  NativeModules,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  getInitialNotificationAction,
  type InitialNotificationAction,
} from 'react-native-local-notifications';

export default function App() {
  const [result, setResult] = useState<InitialNotificationAction | null>(null);
  const [status, setStatus] = useState('Not consumed yet');

  const consume = useCallback(async () => {
    try {
      const action = await getInitialNotificationAction();
      setResult(action);
      setStatus(
        action ? 'Initial action consumed' : 'No initial action (null)'
      );
    } catch (error) {
      setStatus(`Error: ${String(error)}`);
    }
  }, []);

  useEffect(() => {
    // Production apps should subscribe to their live/warm action source first.
    consume().catch(() => {});
  }, [consume]);

  const createNotification = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      }
      await NativeModules.ExampleNotification.createTestNotification();
      Alert.alert(
        Platform.OS === 'ios'
          ? 'Notification scheduled'
          : 'Notification created',
        Platform.OS === 'ios'
          ? 'It will appear in 10 seconds. Dismiss this message and kill the app now.'
          : 'Kill the app, then tap the notification.'
      );
    } catch (error) {
      const message = `Could not create notification: ${String(error)}`;
      setStatus(message);
      Alert.alert('Notification error', message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Initial notification action</Text>
      <Text style={styles.status}>{status}</Text>
      <Text selectable style={styles.value}>
        {result ? JSON.stringify(result, null, 2) : 'null'}
      </Text>
      <View style={styles.button}>
        <Button title="Consume again" onPress={consume} />
      </View>
      <View style={styles.button}>
        <Button title="Create test notification" onPress={createNotification} />
      </View>
      <Text style={styles.instructions}>
        Create the notification, grant permission, kill the app, and tap the
        notification. The first consume shows ID 2137 / CATEGORY_ID / tapped.
        Consume again to see null. A normal app-icon launch also shows null.
        This demo creates a notification only to test the library; notification
        presentation is not part of its API.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  status: { fontSize: 17, marginBottom: 8 },
  value: {
    minHeight: 150,
    padding: 12,
    backgroundColor: '#eee',
    fontFamily: 'monospace',
  },
  button: { marginTop: 16 },
  instructions: { marginTop: 24, lineHeight: 21 },
});
