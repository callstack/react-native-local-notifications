package com.localnotifications

import android.content.Intent
import org.junit.After
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import java.util.concurrent.Callable
import java.util.concurrent.Executors

@RunWith(RobolectricTestRunner::class)
class InitialNotificationActionStoreTest {
  @After fun clean() = InitialNotificationActionStore.clear()

  private fun intent(value: Int = 7, action: String = "notification_clicked_action") =
    Intent("com.example.$action").apply {
      putExtra(InitialNotificationActionParser.NOTIFICATION_ID, 2137)
      putExtra(InitialNotificationActionParser.CATEGORY_ID, "CATEGORY_ID")
      putExtra(InitialNotificationActionParser.CHANNEL_ID, "example_channel")
      putExtra(InitialNotificationActionParser.ACTION_EXTRA, value)
    }

  @Test fun `clicked and package-prefixed intents are recognized and mapped`() {
    val result = InitialNotificationActionParser.parse(intent())!!
    assertEquals("2137", result.notificationId)
    assertEquals("CATEGORY_ID", result.categoryId)
    assertEquals("example_channel", result.channelId)
    assertEquals("tapped", result.action)
  }

  @Test fun `all Polaris action values map correctly`() {
    assertEquals("tapped", InitialNotificationActionParser.parse(intent(7))?.action)
    assertEquals("clear", InitialNotificationActionParser.parse(intent(8, "notification_cleared_action"))?.action)
    assertEquals("customAction", InitialNotificationActionParser.parse(intent(9))?.action)
  }

  @Test fun `unsupported and launcher intents are ignored`() {
    assertNull(InitialNotificationActionParser.parse(intent(10)))
    assertNull(InitialNotificationActionParser.parse(Intent(Intent.ACTION_MAIN)))
  }

  @Test fun `missing optional fields become null`() {
    val source = intent().apply {
      removeExtra(InitialNotificationActionParser.CATEGORY_ID)
      removeExtra(InitialNotificationActionParser.CHANNEL_ID)
    }
    val result = InitialNotificationActionParser.parse(source)!!
    assertNull(result.categoryId)
    assertNull(result.channelId)
  }

  @Test fun `consume atomically clears the value`() {
    InitialNotificationActionStore.capture(intent())
    assertNotNull(InitialNotificationActionStore.consume())
    assertNull(InitialNotificationActionStore.consume())
  }

  @Test fun `concurrent consumers cannot receive the same action`() {
    InitialNotificationActionStore.capture(intent())
    val executor = Executors.newFixedThreadPool(8)
    val results = executor.invokeAll(List(32) {
      Callable { InitialNotificationActionStore.consume() }
    }).map { it.get() }
    executor.shutdown()
    assertEquals(1, results.count { it != null })
  }
}
