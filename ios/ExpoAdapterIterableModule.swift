import ExpoModulesCore
import IterableSDK
import UserNotifications

public class ExpoAdapterIterableModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoAdapterIterable")

    /**
     * Get the Iterable API key from the Info.plist file.
     * @return The Iterable API key.
     */
    Function("getApiKey") {
      return Bundle.main.object(forInfoDictionaryKey: "ITERABLE_API_KEY") as? String
    }

    AsyncFunction("requestNotificationPermission") { (promise: Promise) in
      UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) {
        (granted, error) in
        if let error = error {
          promise.reject(
            "ERR_NOTIFICATION",
            "Failed to request notification permission: \(error.localizedDescription)")
          return
        }
        promise.resolve(granted)
        ITBInfo("auth: \(granted)")
      }
    }
  }
}
