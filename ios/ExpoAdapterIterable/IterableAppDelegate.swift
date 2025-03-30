import ExpoModulesCore
import UIKit
import UserNotifications
import IterableSDK

public class IterableAppDelegate: ExpoAppDelegateSubscriber, UIApplicationDelegate {
  
  public func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
      IterableAPI.register(token: deviceToken)
      setupUserNotificationCenter()
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
