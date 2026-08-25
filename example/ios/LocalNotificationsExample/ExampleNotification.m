#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ExampleNotification, NSObject)

RCT_EXTERN_METHOD(exitApp)

RCT_EXTERN_METHOD(getPermissionStatus:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(createTestNotification:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
