import ExpoModulesCore
import UIKit
import UserNotifications
import IterableSDK

public class IterableAppDelegate: ExpoAppDelegateSubscriber, UIApplicationDelegate {

  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        ITBInfo()
        setupUserNotificationCenter()

        return true
    }
  
  public func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
      ITBInfo()
      IterableAPI.register(token: deviceToken)
      // See step 7.5: https://support.iterable.com/hc/en-us/articles/360035018152-Iterable-s-iOS-SDK#step-7-5-handle-incoming-push-notifications-and-enable-push-notification-tracking
      UNUserNotificationCenter.current().delegate = self
  }

  public func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
      ITBInfo()
      IterableAppIntegration.application(application, didReceiveRemoteNotification: userInfo, fetchCompletionHandler: completionHandler)
  }

  public func applicationDidBecomeActive(_ application: UIApplication) {
    // The app has become active.
  }

  public func applicationWillResignActive(_ application: UIApplication) {
    // The app is about to become inactive.
  }

  public func applicationDidEnterBackground(_ application: UIApplication) {
    // The app is now in the background.
  }

  public func applicationWillEnterForeground(_ application: UIApplication) {
    // The app is about to enter the foreground.
  }

  public func applicationWillTerminate(_ application: UIApplication) {
    // The app is about to terminate.
  }

  public func setupUserNotificationCenter() {
//      UNUserNotificationCenter.current().delegate = self
      UNUserNotificationCenter.current().getNotificationSettings { (settings) in
          if settings.authorizationStatus != .authorized {
              ITBInfo("Not authorized")
              // not authorized, ask for permission
              UNUserNotificationCenter.current().requestAuthorization(options:[.alert, .badge, .sound]) { (success, error) in
                  ITBInfo("auth: \(success)")
              }
          } else {
              // already authorized
              ITBInfo("Already authorized")
          }
      }
    }
}

// Handle incoming push notifications and enable push notification tracking
// Step 7.5: https://support.iterable.com/hc/en-us/articles/360035018152-Iterable-s-iOS-SDK#step-7-5-handle-incoming-push-notifications-and-enable-push-notification-tracking
extension IterableAppDelegate: UNUserNotificationCenterDelegate {
    public func userNotificationCenter(_: UNUserNotificationCenter, willPresent _: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.badge, .banner, .list, .sound])
    }

    public func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        IterableAppIntegration.userNotificationCenter(center, didReceive: response, withCompletionHandler: completionHandler)
    }
}