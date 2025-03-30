package expo.modules.adapters.iterable

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.iterable.iterableapi.IterableApi
import android.content.pm.PackageManager

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
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    /**
     * See step 4.5 of the Iterable RN SDK integration guide:
     * https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK
     */
    IterableApi.setContext(this);
  }
}