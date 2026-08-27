require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "LocalNotifications"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/callstack/react-native-local-notifications.git", :tag => "v#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"
  s.public_header_files = "ios/InitialNotificationActionStore.h"
  s.private_header_files = "ios/LocalNotifications.h", "ios/InitialNotificationActionStore+Internal.h"
  s.module_map = "ios/LocalNotifications.modulemap"

  s.frameworks = "UserNotifications"

  install_modules_dependencies(s)
end
