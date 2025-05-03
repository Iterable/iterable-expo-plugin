package expo.modules.adapters.iterable

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.pm.PackageManager

class ExpoAdapterIterableModule() : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoAdapterIterable")
  }
}