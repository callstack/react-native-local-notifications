# @callstack/react-native-local-notifications

Recover the local-notification action that launched your React Native app from a terminated state.

`@callstack/react-native-local-notifications` bridges the cold-start notification response to JavaScript on iOS and Android. It gives your navigation or analytics code one consistent, typed action without taking ownership of notification scheduling or live notification events.

Third-party services such as Braze or Firebase often already handle actions from remote notifications. This library is intended for applications where local and remote notifications use different mechanisms: keep using your existing provider for remote notifications, and use this package to recover the initial action from a local notification when it launches the app.

## Why use it?

- Handles notification actions that launch a terminated app
- Provides the same typed result on iOS and Android
- Consumes each launch action exactly once
- Works alongside your existing notification library and event listeners
- Uses a New Architecture TurboModule with no retained native notification objects

## Installation

```sh
yarn add @callstack/react-native-local-notifications
```

Or use your preferred package manager:

```sh
npm install @callstack/react-native-local-notifications
# or
pnpm add @callstack/react-native-local-notifications
```

Install iOS pods after adding the package:

```sh
cd ios && pod install
```

Autolinking handles the native module. React Native's New Architecture must be enabled.

## Quick start

Read the initial action once during application startup:

```tsx
import { useEffect } from 'react';
import { getInitialNotificationAction } from '@callstack/react-native-local-notifications';

function App() {
  useEffect(() => {
    getInitialNotificationAction()
      .then((action) => {
        if (!action) return;

        // Navigate, update state, or record analytics.
        console.log('App opened from notification', action);
      })
      .catch((error) => {
        console.warn('Could not read the initial notification action', error);
      });
  }, []);

  return null;
}
```

The result looks like this:

```ts
{
  notificationId: '2137',
  categoryId: 'CATEGORY_ID',
  channelId: 'example_channel', // Android only
  action: 'tapped',
  actionIdentifier: null,
}
```

Before calling the JavaScript API, add the small native capture hook for each platform.

## Native setup

### Android

Capture the launch intent in your `MainActivity` **before** calling `super.onCreate`:

```kotlin
import android.os.Bundle
import com.localnotifications.InitialNotificationAction

override fun onCreate(savedInstanceState: Bundle?) {
  InitialNotificationAction.captureInitialIntent(intent)
  super.onCreate(null)
}
```

Do not capture `onNewIntent` events. Those happen while the app is already alive and should continue through your existing notification event listener.

### iOS

Expose the library header from your application's bridging header:

```objc
#import <InitialNotificationActionStore.h>
```

Then capture the notification response in your `SceneDelegate` **before** starting React Native:

```swift
func scene(
  _ scene: UIScene,
  willConnectTo session: UISceneSession,
  options connectionOptions: UIScene.ConnectionOptions
) {
  if let response = connectionOptions.notificationResponse {
    InitialNotificationActionStore.capture(response)
  }

  // Start React Native after capture.
  // factory.startReactNative(...)
}
```

The library does not install a `UNUserNotificationCenterDelegate`, so it will not interfere with the delegate or notification library you already use.

## Using cold-start and live actions together

This package only handles the action that launches a terminated app. Keep your existing listener for foreground, background, and warm-start actions.

Subscribe to live events first, then retrieve the cold-start action. This avoids losing an event during application startup:

```tsx
useEffect(() => {
  let cancelled = false;

  const handleAction = (action: NotificationActionInformation) => {
    // Use one navigation path for cold-start and live actions.
  };

  // additional subscription to notifications
  const subscription = subscribeToRemoteNotificationActions(handleAction);

  getInitialNotificationAction()
    .then((action) => {
      if (!cancelled && action) handleAction(action);
    })
    .catch((error) => {
      console.warn('Could not read the initial notification action', error);
    });

  return () => {
    cancelled = true;
    subscription.remove();
  };
}, []);
```

`subscribeToRemoteNotificationActions` is a placeholder for the listener supplied by your notification solution; it is not exported by this package.

## API

### `getInitialNotificationAction()`

```ts
function getInitialNotificationAction(): Promise<InitialNotificationAction | null>;
```

Returns the notification action that launched the current application process, or `null` when the app was opened normally or the action has already been consumed.

```ts
type InitialNotificationActionType = 'tapped' | 'clear' | 'customAction';

type InitialNotificationAction = {
  notificationId: string;
  categoryId: string | null;
  channelId: string | null;
  action: InitialNotificationActionType;
  actionIdentifier: string | null;
};
```

| Field              | Description                                                   |
| ------------------ | ------------------------------------------------------------- |
| `notificationId`   | Identifier of the notification that triggered the action      |
| `categoryId`       | Notification category, when supplied                          |
| `channelId`        | Android notification channel; always `null` on iOS            |
| `action`           | Normalized tap, clear, or custom action                       |
| `actionIdentifier` | Platform action identifier for a custom action, when supplied |

The value is held in memory and atomically consumed. The first call receives it; later or concurrent calls return `null`. It is not persisted between application processes.

## What this library does not do

To stay small and composable, the package does not:

- display or schedule notifications
- request notification permissions
- handle foreground, background, or warm-start events
- install notification delegates
- persist notification actions

Use it as the cold-start companion to your existing notification solution.

## Testing

A Jest mock is available as a package export:

```js
moduleNameMapper: {
  '^@callstack/react-native-local-notifications$':
    '@callstack/react-native-local-notifications/jest/mock',
}
```

The mock resolves to `null` by default. You can replace or spy on `getInitialNotificationAction` in tests that need a launch action.

The repository also includes an [example application](./example) demonstrating native capture and consume-once behavior on both platforms.

## Contributing

Contributions of all sizes are welcome. See the [contributing guide](./CONTRIBUTING.md) for local setup, development commands, and pull request guidance. Please follow the project [code of conduct](./CODE_OF_CONDUCT.md).

## License

[MIT](./LICENSE)
