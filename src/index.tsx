import NativeLocalNotifications, {
  type NativeInitialNotificationAction,
} from './NativeLocalNotifications';

export type InitialNotificationActionType = 'tapped' | 'clear' | 'customAction';

export type InitialNotificationAction = {
  notificationId: string;
  categoryId: string | null;
  channelId: string | null;
  action: InitialNotificationActionType;
  actionIdentifier: string | null;
};

const ACTIONS = new Set<InitialNotificationActionType>([
  'tapped',
  'clear',
  'customAction',
]);

function optionalString(value: unknown, field: string): string | null {
  if (value == null) return null;
  if (typeof value !== 'string') {
    throw new Error(
      `Invalid initial notification action: ${field} must be a string or null`
    );
  }
  return value.length === 0 ? null : value;
}

function normalize(
  value: NativeInitialNotificationAction
): InitialNotificationAction {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid initial notification action: expected an object');
  }
  if (
    typeof value.notificationId !== 'string' ||
    value.notificationId.length === 0
  ) {
    throw new Error(
      'Invalid initial notification action: notificationId must be a non-empty string'
    );
  }
  if (
    typeof value.action !== 'string' ||
    !ACTIONS.has(value.action as InitialNotificationActionType)
  ) {
    throw new Error(
      `Invalid initial notification action: unknown action "${String(value.action)}"`
    );
  }

  return {
    notificationId: value.notificationId,
    categoryId: optionalString(value.categoryId, 'categoryId'),
    channelId: optionalString(value.channelId, 'channelId'),
    action: value.action as InitialNotificationActionType,
    actionIdentifier: optionalString(
      value.actionIdentifier,
      'actionIdentifier'
    ),
  };
}

export async function getInitialNotificationAction(): Promise<InitialNotificationAction | null> {
  const value = await NativeLocalNotifications.getInitialNotificationAction();
  return value == null ? null : normalize(value);
}
