package com.localnotifications

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise

class LocalNotificationsModule(reactContext: ReactApplicationContext) :
  NativeLocalNotificationsSpec(reactContext) {

  override fun getInitialNotificationAction(promise: Promise) {
    val action = InitialNotificationActionStore.consume()
    if (action == null) {
      promise.resolve(null)
      return
    }

    promise.resolve(Arguments.createMap().apply {
      putString("notificationId", action.notificationId)
      putString("categoryId", action.categoryId)
      putString("channelId", action.channelId)
      putString("action", action.action)
      putString("actionIdentifier", action.actionIdentifier)
    })
  }

  companion object {
    const val NAME = NativeLocalNotificationsSpec.NAME
  }
}
