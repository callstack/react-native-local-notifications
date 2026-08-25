import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  NativeModules,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  getInitialNotificationAction,
  type InitialNotificationAction,
} from 'react-native-local-notifications';

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

function ActionButton({
  label,
  onPress,
  variant = 'primary',
}: ActionButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        pressed && styles.pressedButton,
      ]}
    >
      <Text
        style={
          isPrimary ? styles.primaryButtonText : styles.secondaryButtonText
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function App() {
  const [result, setResult] = useState<InitialNotificationAction | null>(null);
  const [status, setStatus] = useState('Not consumed yet');
  const [permissionStatus, setPermissionStatus] = useState('not checked');

  const permissionGranted = permissionStatus === 'granted';
  const permissionLabel = permissionGranted
    ? 'Allowed'
    : permissionStatus === 'denied'
      ? 'Denied'
      : permissionStatus === 'notDetermined'
        ? 'Not requested'
        : permissionStatus === 'not checked'
          ? 'Checking…'
          : permissionStatus;

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

  const checkNotificationPermission = useCallback(async () => {
    try {
      const nextStatus =
        await NativeModules.ExampleNotification.getPermissionStatus();
      setPermissionStatus(String(nextStatus));
    } catch (error) {
      setPermissionStatus(`error: ${String(error)}`);
    }
  }, []);

  useEffect(() => {
    // Production apps should subscribe to their live/warm action source first.
    consume().catch(() => {});
    checkNotificationPermission().catch(() => {});
  }, [checkNotificationPermission, consume]);

  const createNotification = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      }
      await checkNotificationPermission();
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
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>DEMO APP</Text>
        <Text style={styles.screenTitle}>Local Notifications</Text>
        <Text style={styles.subtitle}>
          Check permissions, create a notification, and inspect its launch
          action.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>PERMISSIONS</Text>
        <View style={styles.permissionRow}>
          <View style={styles.permissionCopy}>
            <Text style={styles.cardTitle}>Notification access</Text>
            <Text style={styles.cardDescription}>
              Required to display local notifications on this device.
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              permissionGranted ? styles.grantedBadge : styles.neutralBadge,
            ]}
          >
            <View
              style={[
                styles.badgeDot,
                permissionGranted ? styles.grantedDot : styles.neutralDot,
              ]}
            />
            <Text
              style={[
                styles.badgeText,
                permissionGranted
                  ? styles.grantedBadgeText
                  : styles.neutralBadgeText,
              ]}
            >
              {permissionLabel}
            </Text>
          </View>
        </View>
        <ActionButton
          label="Check notification permissions"
          onPress={checkNotificationPermission}
          variant="secondary"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>TEST NOTIFICATION</Text>
        <Text style={styles.cardTitle}>Create a local notification</Text>
        <Text style={styles.cardDescription}>
          Schedule a test notification, then open it to verify the initial
          action payload.
        </Text>
        <ActionButton
          label="Create test notification"
          onPress={createNotification}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>INITIAL ACTION</Text>
        <Text style={styles.status}>{status}</Text>
        <Text selectable style={styles.value}>
          {result ? JSON.stringify(result, null, 2) : 'null'}
        </Text>
        <ActionButton
          label="Consume again"
          onPress={consume}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
    backgroundColor: '#F4F6FA',
  },
  header: {
    marginBottom: 24,
  },
  eyebrow: {
    color: '#5B65D8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  screenTitle: {
    color: '#151827',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: '#626779',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E9F0',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#1D2340',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionLabel: {
    color: '#858A9B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#1D2030',
    fontSize: 19,
    fontWeight: '700',
  },
  cardDescription: {
    color: '#6B7081',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  permissionRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 18,
  },
  permissionCopy: {
    flex: 1,
    marginRight: 12,
  },
  badge: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  grantedBadge: {
    backgroundColor: '#E8F7EF',
  },
  neutralBadge: {
    backgroundColor: '#F0F1F5',
  },
  badgeDot: {
    borderRadius: 4,
    height: 7,
    marginRight: 6,
    width: 7,
  },
  grantedDot: {
    backgroundColor: '#1D9B5C',
  },
  neutralDot: {
    backgroundColor: '#858A9B',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  grantedBadgeText: {
    color: '#147443',
  },
  neutralBadgeText: {
    color: '#5F6474',
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 50,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: '#515BD4',
  },
  secondaryButton: {
    backgroundColor: '#F2F3FA',
    borderColor: '#DFE1EF',
    borderWidth: 1,
  },
  pressedButton: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#4149A8',
    fontSize: 15,
    fontWeight: '700',
  },
  status: {
    color: '#4E5364',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 12,
  },
  value: {
    backgroundColor: '#F6F7F9',
    borderColor: '#EAEBEF',
    borderRadius: 12,
    borderWidth: 1,
    color: '#343746',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 19,
    minHeight: 120,
    padding: 14,
  },
});
