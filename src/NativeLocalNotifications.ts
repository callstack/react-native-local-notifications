import { TurboModuleRegistry, type TurboModule } from 'react-native';

export type NativeInitialNotificationAction = {
  notificationId: string;
  categoryId?: string | null;
  channelId?: string | null;
  action: string;
  actionIdentifier?: string | null;
};

export interface Spec extends TurboModule {
  getInitialNotificationAction(): Promise<NativeInitialNotificationAction | null>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('LocalNotifications');
