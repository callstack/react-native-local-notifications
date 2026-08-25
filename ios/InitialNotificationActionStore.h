#import <Foundation/Foundation.h>
#import <UserNotifications/UserNotifications.h>

NS_ASSUME_NONNULL_BEGIN

/// Process-wide, in-memory cold-start action store. It never retains the response.
@interface InitialNotificationActionStore : NSObject

+ (void)capture:(UNNotificationResponse *)response NS_SWIFT_NAME(capture(_:));
+ (void)clear;

@end

NS_ASSUME_NONNULL_END
