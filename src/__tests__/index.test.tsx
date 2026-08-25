import { beforeEach, expect, it, jest } from '@jest/globals';

jest.mock('../NativeLocalNotifications', () => ({
  __esModule: true,
  default: { getInitialNotificationAction: jest.fn() },
}));

import NativeLocalNotifications from '../NativeLocalNotifications';
import {
  getInitialNotificationAction,
  type InitialNotificationAction,
  type InitialNotificationActionType,
} from '..';

const mockNativeGet = jest.mocked(
  NativeLocalNotifications.getInitialNotificationAction
) as jest.Mock<() => Promise<unknown>>;

beforeEach(() => {
  mockNativeGet.mockReset();
});

it.each<InitialNotificationActionType>(['tapped', 'clear', 'customAction'])(
  'normalizes a valid %s action',
  async (action) => {
    mockNativeGet.mockResolvedValue({
      notificationId: '2137',
      action,
      categoryId: undefined,
      channelId: '',
      actionIdentifier: null,
    });
    const expected: InitialNotificationAction = {
      notificationId: '2137',
      action,
      categoryId: null,
      channelId: null,
      actionIdentifier: null,
    };
    await expect(getInitialNotificationAction()).resolves.toEqual(expected);
  }
);

it('returns native null as JavaScript null', async () => {
  mockNativeGet.mockResolvedValue(null);
  await expect(getInitialNotificationAction()).resolves.toBeNull();
});

it('rejects unknown actions with a meaningful error', async () => {
  mockNativeGet.mockResolvedValue({ notificationId: '1', action: 'mystery' });
  await expect(getInitialNotificationAction()).rejects.toThrow(
    'unknown action "mystery"'
  );
});

it('rejects malformed fields', async () => {
  mockNativeGet.mockResolvedValue({ notificationId: '', action: 'tapped' });
  await expect(getInitialNotificationAction()).rejects.toThrow(
    'notificationId must be a non-empty string'
  );
});

it('propagates native promise rejection', async () => {
  const error = new Error('native failure');
  mockNativeGet.mockRejectedValue(error);
  await expect(getInitialNotificationAction()).rejects.toBe(error);
});
