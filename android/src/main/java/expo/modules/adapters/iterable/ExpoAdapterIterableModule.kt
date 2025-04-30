package expo.modules.adapters.iterable

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.pm.PackageManager
import android.Manifest
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class ExpoAdapterIterableModule() : Module() {
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

    Function("requestNotificationPermission") {
      val context = appContext?.reactContext ?: return@Function false
      
      // For Android 13 and above, we need to request the permission
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        val permission = Manifest.permission.POST_NOTIFICATIONS
        
        // Check if we already have the permission
        if (ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED) {
          return@Function true
        }
        
        // Request the permission
        ActivityCompat.requestPermissions(
          context.currentActivity!!,
          arrayOf(permission),
          1  // request code
        )
      }
      
      // For Android 12 and below, notifications are enabled by default
      return@Function true
    }
  }
}