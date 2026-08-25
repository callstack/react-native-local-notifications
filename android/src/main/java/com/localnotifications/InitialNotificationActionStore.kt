package com.localnotifications

import android.content.Intent
import java.util.concurrent.atomic.AtomicReference

internal data class StoredInitialNotificationAction(
  val notificationId: String,
  val categoryId: String?,
  val channelId: String?,
  val action: String,
  val actionIdentifier: String?,
)

internal object InitialNotificationActionParser {
  const val NOTIFICATION_ID = "notification_notification_id"
  const val CATEGORY_ID = "notification_category_id"
  const val CHANNEL_ID = "notification_channel_id"
  const val ACTION_EXTRA = "action_extra"

  // Polaris interaction values. Confirm these constants when Polaris changes its contract.
  const val ACTION_TAPPED = 7
  const val ACTION_CLEAR = 8
  const val ACTION_CUSTOM = 9

  private val supportedSuffixes = listOf(
    "notification_clicked_action",
    "notification_dismiss_action",
    "notification_cleared_action",
  )

  fun parse(intent: Intent?): StoredInitialNotificationAction? {
    val intentAction = intent?.action ?: return null
    if (supportedSuffixes.none(intentAction::endsWith)) return null

    val actionValue = if (intent.hasExtra(ACTION_EXTRA)) {
      intent.getIntExtra(ACTION_EXTRA, Int.MIN_VALUE)
    } else {
      Int.MIN_VALUE
    }
    val action = when (actionValue) {
      ACTION_TAPPED -> "tapped"
      ACTION_CLEAR -> "clear"
      ACTION_CUSTOM -> "customAction"
      else -> return null
    }

    if (!intent.hasExtra(NOTIFICATION_ID)) return null
    val notificationId = intent.getIntExtra(NOTIFICATION_ID, Int.MIN_VALUE)
      .takeUnless { it == Int.MIN_VALUE }
      ?.toString()
      ?: return null

    return StoredInitialNotificationAction(
      notificationId = notificationId,
      categoryId = intent.getStringExtra(CATEGORY_ID)?.takeIf(String::isNotEmpty),
      channelId = intent.getStringExtra(CHANNEL_ID)?.takeIf(String::isNotEmpty),
      action = action,
      actionIdentifier = null,
    )
  }
}

internal object InitialNotificationActionStore {
  private val value = AtomicReference<StoredInitialNotificationAction?>(null)

  fun capture(intent: Intent?) {
    value.set(InitialNotificationActionParser.parse(intent))
  }

  fun consume(): StoredInitialNotificationAction? = value.getAndSet(null)

  fun clear() {
    value.set(null)
  }
}
