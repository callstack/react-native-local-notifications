#import "InitialNotificationActionStore.h"

NS_ASSUME_NONNULL_BEGIN

@interface InitialNotificationActionStore (Internal)

+ (void)captureNotificationId:(NSString *)notificationId
                    categoryId:(nullable NSString *)categoryId
              actionIdentifier:(NSString *)actionIdentifier;
+ (nullable NSDictionary<NSString *, NSString *> *)consume;

@end

NS_ASSUME_NONNULL_END
