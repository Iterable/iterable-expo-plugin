package expo.modules.adapters.iterable

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.pm.PackageManager

class ExpoAdapterIterableModule() : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoAdapterIterable")

    Function("getApiKey") {
      val applicationInfo = appContext?.reactContext?.packageManager?.getApplicationInfo(appContext?.reactContext?.packageName.toString(), PackageManager.GET_META_DATA)

      return@Function applicationInfo?.metaData?.getString("MY_CUSTOM_API_KEY")
    }
  }
}