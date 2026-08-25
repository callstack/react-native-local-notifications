# react-native-local-notifications

A New Architecture TurboModule that captures and consumes the local-notification action which launched an app from a killed state.

It does not display or schedule notifications, install notification delegates, or handle warm/background interactions. Keep your existing live notification path.

## Installation and API

```sh
yarn add react-native-local-notifications
cd ios && pod install
```

Autolinking supplies the module. React Native New Architecture must be enabled.

```ts
type InitialNotificationActionType = 'tapped' | 'clear' | 'customAction';
type InitialNotificationAction = {
  notificationId: string;
  categoryId: string | null;
  channelId: string | null;
  action: InitialNotificationActionType;
  actionIdentifier: string | null;
};

getInitialNotificationAction(): Promise<InitialNotificationAction | null>;
```

The call atomically takes and clears the in-memory value. The first call returns the captured action; later and concurrent calls return `null`. Nothing is persisted, so a normal app-icon launch returns `null`.

Consumer Jest tests can map the package to `react-native-local-notifications/jest/mock`; its function resolves to `null` by default.

## Android host integration

Polaris values are defined once in `InitialNotificationActionParser`: `7` is `tapped`, `8` is `clear`, and `9` is `customAction`. Confirm these values against the consuming application during integration.

Capture before `super.onCreate`, so React Native cannot consume too early:

```kotlin
import com.localnotifications.InitialNotificationAction

override fun onCreate(savedInstanceState: Bundle?) {
  InitialNotificationAction.captureInitialIntent(intent)
  super.onCreate(null)
  // Existing setup...
}
```

The parser recognizes package-prefixed actions ending in `notification_clicked_action`, `notification_dismiss_action`, or `notification_cleared_action` and reads the documented Polaris extras. It copies primitive values and never retains the `Intent` or `Activity`.

Do not add capture to `onNewIntent`. Warm actions remain with the existing `adc-platform-mobile-utils.notificationInteractionIntentFlow`; this package does not depend on it.

## iOS host integration

Capture in `SceneDelegate` before starting React Native:

Expose `<InitialNotificationActionStore.h>` to Swift through the host's bridging header, then:

```swift
func scene(
  _ scene: UIScene,
  willConnectTo session: UISceneSession,
  options connectionOptions: UIScene.ConnectionOptions
) {
  if let response = connectionOptions.notificationResponse {
    InitialNotificationActionStore.capture(response)
  }
  // Only now call factory.startReactNative(...)
}
```

The response is reduced immediately to strings; no response or scene is retained. Default, dismiss, and non-empty custom identifiers map to `tapped`, `clear`, and `customAction`. `channelId` is always `null`.

The package does not install a `UNUserNotificationCenterDelegate`. Warm actions remain with the existing `adc-platform-mobile-utils.notificationActionPublisher`.

## React Native ordering

Subscribe to the live-action mechanism first, then consume the cold-start action:

```ts
useEffect(() => {
  let cancelled = false;
  const handleAction = (action: NotificationActionInformation) => {
    // Existing navigation behavior.
  };
  const subscription = subscribeToLiveNotificationActions(handleAction);

  getInitialNotificationAction()
    .then((action) => {
      if (!cancelled && action) handleAction(action);
    })
    .catch((error) => {
      // Log without crashing startup.
    });

  return () => {
    cancelled = true;
    subscription.remove();
  };
}, []);
```

Subscribing first closes the gap between cold-start retrieval and live-event activation.

## Example test flow

The example's notification creation code is demo-only and is not exported.

1. Start the example and grant notification permission.
2. Press **Create test notification**.
3. Kill the application, then tap the notification.
4. Verify ID `2137`, category `CATEGORY_ID`, and action `tapped` (`channelId` is `example_channel` on Android and `null` on iOS).
5. Press **Consume again** and verify `null`.
6. Kill the app, open it using the app icon, and verify `null`.

## Troubleshooting

- An icon launch returning `null` is expected.
- On Android, verify every Polaris extra, the action suffix/value, and capture ordering.
- On iOS, verify capture precedes `factory.startReactNative`.
- A second call returning `null` is expected consume-once behavior.
- Warm/background taps are intentionally outside this package.
