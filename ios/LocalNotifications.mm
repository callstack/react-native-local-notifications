#import "LocalNotifications.h"
#import "InitialNotificationActionStore+Internal.h"

@implementation LocalNotifications
- (void)getInitialNotificationAction:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject
{
  resolve([InitialNotificationActionStore consume]);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeLocalNotificationsSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"LocalNotifications";
}

@end
