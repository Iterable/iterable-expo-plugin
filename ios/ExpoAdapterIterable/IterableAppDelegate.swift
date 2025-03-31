import ExpoModulesCore
import IterableSDK
import UIKit
import UserNotifications

public class IterableAppDelegate: ExpoAppDelegateSubscriber, UIApplicationDelegate {
  public func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    ITBInfo()

    UNUserNotificationCenter.current().delegate = self

    /**
      * Request permissions for push notifications if the flag is not set to false.
      * @see Step 3.5.5 of https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK#step-3-5-set-up-support-for-push-notifications
      */
    // if let appShouldRequestPushPermissions = Bundle.main.object(
    //   forInfoDictionaryKey: "ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS") as? Bool
    // {
    //   requestPushPermissions()
    // }

    return true
  }

  public func application(
    _ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    /**
     * Register the device token with Iterable.
     * @see Step 3.5.4 of https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK#step-3-5-set-up-support-for-push-notifications
     */
    IterableAPI.register(token: deviceToken)
  }

  public func requestPushPermissions() {
    UNUserNotificationCenter.current().getNotificationSettings { (settings) in
      if settings.authorizationStatus != .authorized {
        ITBInfo("Not authorized")
        // not authorized, ask for permission
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) {
          (success, error) in
          ITBInfo("auth: \(success)")
        }
      } else {
        // already authorized
        ITBInfo("Already authorized")
      }
    }
  }
}

/// * Handle incoming push notifications and enable push notification tracking.
/// * @see Step 3.5.5 of https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK#step-3-5-set-up-support-for-push-notifications
extension IterableAppDelegate: UNUserNotificationCenterDelegate {
  public func userNotificationCenter(
    _: UNUserNotificationCenter, willPresent _: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    completionHandler([.badge, .banner, .list, .sound])
  }

  public func userNotificationCenter(
    _ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    IterableAppIntegration.userNotificationCenter(
      center, didReceive: response, withCompletionHandler: completionHandler)
  }
}
