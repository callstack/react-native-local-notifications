import { expect, it } from '@jest/globals';

const mock = require('../../jest/mock');

it('the consumer Jest mock defaults to null', async () => {
  await expect(mock.getInitialNotificationAction()).resolves.toBeNull();
});
