import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import UserNotifications
import Darwin

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    return true
  }

  func application(
    _ application: UIApplication,
    configurationForConnecting connectingSceneSession: UISceneSession,
    options: UIScene.ConnectionOptions
  ) -> UISceneConfiguration {
    UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
  }
}

@objc(ExampleNotification)
final class ExampleNotification: NSObject, RCTBridgeModule {
  static func moduleName() -> String! { "ExampleNotification" }
  static func requiresMainQueueSetup() -> Bool { false }

  @objc
  func exitApp() {
    DispatchQueue.main.async {
      exit(EXIT_SUCCESS)
    }
  }

  @objc(getPermissionStatus:rejecter:)
  func getPermissionStatus(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    UNUserNotificationCenter.current().getNotificationSettings { settings in
      let status: String
      switch settings.authorizationStatus {
      case .authorized, .provisional, .ephemeral:
        status = "granted"
      case .denied:
        status = "denied"
      case .notDetermined:
        status = "notDetermined"
      @unknown default:
        status = "unknown"
      }
      resolve(status)
    }
  }

  @objc(createTestNotification:rejecter:)
  func createTestNotification(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let center = UNUserNotificationCenter.current()
    center.requestAuthorization(options: [.alert, .sound]) { granted, error in
      if let error {
        reject("permission_error", error.localizedDescription, error)
        return
      }
      guard granted else {
        reject("permission_denied", "Notification permission was denied", nil)
        return
      }
      let content = UNMutableNotificationContent()
      content.title = "Cold-start notification test"
      content.body = "Kill the app, then tap this notification"
      content.categoryIdentifier = "CATEGORY_ID"
      let request = UNNotificationRequest(
        identifier: "2137",
        content: content,
        trigger: UNTimeIntervalNotificationTrigger(timeInterval: 2, repeats: false)
      )
      center.add(request) { error in
        if let error { reject("schedule_error", error.localizedDescription, error) }
        else { resolve(nil) }
      }
    }
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
