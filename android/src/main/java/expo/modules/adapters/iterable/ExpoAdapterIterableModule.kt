package expo.modules.adapters.iterable

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.pm.PackageManager
import android.Manifest
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise

class ExpoAdapterIterableModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoAdapterIterable")

    /**
     * Get the Iterable API key from the AndroidManifest.xml file.
     * @return The Iterable API key.
     */
    Function("getApiKey") {
      val applicationInfo = appContext?.reactContext?.packageManager?.getApplicationInfo(appContext?.reactContext?.packageName.toString(), PackageManager.GET_META_DATA)

      return@Function applicationInfo?.metaData?.getString("ITERABLE_API_KEY")
    }

    AsyncFunction("requestNotificationPermission") { promise: Promise ->
      val activity = appContext.currentActivity
        ?: throw Exception("Activity not found")
      
      // For Android 13 and above, we need to request the permission
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        val permission = Manifest.permission.POST_NOTIFICATIONS
        
        // Check if we already have the permission
        if (ContextCompat.checkSelfPermission(activity, permission) == PackageManager.PERMISSION_GRANTED) {
          promise.resolve(true)
          return@AsyncFunction
        }
        
        // Request the permission
        ActivityCompat.requestPermissions(
          activity,
          arrayOf(permission),
          1  // request code
        )
        promise.resolve(true)
      } else {
        // For Android 12 and below, notifications are enabled by default
        promise.resolve(true)
      }
    }
  }
}