#import <XCTest/XCTest.h>
#import "InitialNotificationActionStore+Internal.h"

@interface InitialNotificationActionStoreTests : XCTestCase
@end

@implementation InitialNotificationActionStoreTests

- (void)tearDown { [InitialNotificationActionStore clear]; }

- (void)testDefaultDismissAndCustomActions
{
  NSArray *identifiers = @[UNNotificationDefaultActionIdentifier,
                            UNNotificationDismissActionIdentifier,
                            @"SNOOZE"];
  NSArray *expected = @[@"tapped", @"clear", @"customAction"];
  for (NSUInteger index = 0; index < identifiers.count; index++) {
    [InitialNotificationActionStore captureNotificationId:@"2137"
                                                categoryId:@"CATEGORY_ID"
                                          actionIdentifier:identifiers[index]];
    NSDictionary *value = [InitialNotificationActionStore consume];
    XCTAssertEqualObjects(value[@"action"], expected[index]);
    XCTAssertEqualObjects(value[@"actionIdentifier"], identifiers[index]);
    XCTAssertNil(value[@"channelId"]);
  }
}

- (void)testMissingCategoryAndConsumeOnce
{
  [InitialNotificationActionStore captureNotificationId:@"2137"
                                              categoryId:nil
                                        actionIdentifier:UNNotificationDefaultActionIdentifier];
  XCTAssertNil([InitialNotificationActionStore consume][@"categoryId"]);
  XCTAssertNil([InitialNotificationActionStore consume]);
}

- (void)testConcurrentConsumeReturnsValueOnce
{
  [InitialNotificationActionStore captureNotificationId:@"2137"
                                              categoryId:nil
                                        actionIdentifier:@"SNOOZE"];
  dispatch_group_t group = dispatch_group_create();
  dispatch_queue_t queue = dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0);
  __block NSInteger nonNilCount = 0;
  NSLock *countLock = [NSLock new];
  for (NSInteger index = 0; index < 32; index++) {
    dispatch_group_async(group, queue, ^{
      if ([InitialNotificationActionStore consume] != nil) {
        [countLock lock]; nonNilCount += 1; [countLock unlock];
      }
    });
  }
  dispatch_group_wait(group, DISPATCH_TIME_FOREVER);
  XCTAssertEqual(nonNilCount, 1);
}

@end
