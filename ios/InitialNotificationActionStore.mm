#import "InitialNotificationActionStore+Internal.h"

@implementation InitialNotificationActionStore

static NSLock *storeLock;
static NSDictionary<NSString *, NSString *> *storedAction;

+ (void)initialize
{
  if (self == InitialNotificationActionStore.class) {
    storeLock = [NSLock new];
  }
}

+ (void)capture:(UNNotificationResponse *)response
{
  UNNotificationRequest *request = response.notification.request;
  [self captureNotificationId:request.identifier
                   categoryId:request.content.categoryIdentifier
             actionIdentifier:response.actionIdentifier];
}

+ (void)captureNotificationId:(NSString *)notificationId
                    categoryId:(NSString * _Nullable)categoryId
              actionIdentifier:(NSString *)actionIdentifier
{
  NSString *action;
  if ([actionIdentifier isEqualToString:UNNotificationDefaultActionIdentifier]) {
    action = @"tapped";
  } else if ([actionIdentifier isEqualToString:UNNotificationDismissActionIdentifier]) {
    action = @"clear";
  } else if (actionIdentifier.length > 0) {
    action = @"customAction";
  } else {
    return;
  }

  NSMutableDictionary<NSString *, NSString *> *snapshot = [@{
    @"notificationId": [notificationId copy],
    @"action": action,
    @"actionIdentifier": [actionIdentifier copy],
  } mutableCopy];
  if (categoryId.length > 0) {
    snapshot[@"categoryId"] = [categoryId copy];
  }
  // iOS has no Android-style channel, so channelId is intentionally absent.
  [storeLock lock];
  storedAction = [snapshot copy];
  [storeLock unlock];
}

+ (NSDictionary<NSString *, NSString *> * _Nullable)consume
{
  [storeLock lock];
  NSDictionary<NSString *, NSString *> *result = storedAction;
  storedAction = nil;
  [storeLock unlock];
  return result;
}

+ (void)clear
{
  [storeLock lock];
  storedAction = nil;
  [storeLock unlock];
}

@end
