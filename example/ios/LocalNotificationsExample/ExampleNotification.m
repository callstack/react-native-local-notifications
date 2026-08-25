#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ExampleNotification, NSObject)

RCT_EXTERN_METHOD(createTestNotification:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
