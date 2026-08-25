package com.localnotifications

import com.facebook.react.bridge.ReactApplicationContext

class LocalNotificationsModule(reactContext: ReactApplicationContext) :
  NativeLocalNotificationsSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeLocalNotificationsSpec.NAME
  }
}
