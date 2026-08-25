package localnotifications.example

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Process
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ExampleNotificationModule(context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {
  override fun getName() = "ExampleNotification"

  @ReactMethod
  fun exitApp() {
    Process.killProcess(Process.myPid())
  }

  @ReactMethod
  fun getPermissionStatus(promise: Promise) {
    val granted = Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
      ContextCompat.checkSelfPermission(
        reactApplicationContext,
        android.Manifest.permission.POST_NOTIFICATIONS,
      ) == PackageManager.PERMISSION_GRANTED
    promise.resolve(if (granted) "granted" else "denied")
  }

  @ReactMethod
  fun createTestNotification(promise: Promise) {
    val manager = reactApplicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.createNotificationChannel(NotificationChannel(CHANNEL, "Example alarms", NotificationManager.IMPORTANCE_HIGH))

    val launchIntent = Intent(reactApplicationContext, MainActivity::class.java).apply {
      action = "${reactApplicationContext.packageName}.notification_clicked_action"
      putExtra("notification_notification_id", ID)
      putExtra("notification_category_id", CATEGORY)
      putExtra("notification_channel_id", CHANNEL)
      putExtra("action_extra", 7)
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
    }
    val pendingIntent = PendingIntent.getActivity(
      reactApplicationContext,
      ID,
      launchIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
    val notification = NotificationCompat.Builder(reactApplicationContext, CHANNEL)
      .setSmallIcon(android.R.drawable.ic_dialog_info)
      .setContentTitle("Cold-start notification test")
      .setContentText("Kill the app, then tap this notification")
      .setContentIntent(pendingIntent)
      .setAutoCancel(true)
      .build()
    manager.notify(ID, notification)
    promise.resolve(null)
  }

  companion object {
    const val ID = 2137
    const val CATEGORY = "CATEGORY_ID"
    const val CHANNEL = "example_channel"
  }
}
