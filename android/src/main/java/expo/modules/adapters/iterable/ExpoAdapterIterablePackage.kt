package expo.modules.adapters.iterable

import android.content.Context
import expo.modules.core.interfaces.ApplicationLifecycleListener
import expo.modules.core.interfaces.Package
import expo.modules.core.BasePackage

class ExpoAdapterIterablePackage : BasePackage() {
  override fun createApplicationLifecycleListeners(context: Context): List<ApplicationLifecycleListener> {
    return listOf(IterableApplicationLifecycleListener())
  }
}
