package com.localnotifications

import android.content.Intent

/** Host entry point. Call before ReactActivity.onCreate starts React Native. */
object InitialNotificationAction {
  @JvmStatic
  fun captureInitialIntent(intent: Intent?) {
    InitialNotificationActionStore.capture(intent)
  }
}
