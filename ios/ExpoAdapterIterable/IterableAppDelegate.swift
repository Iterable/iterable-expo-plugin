import ExpoModulesCore
import IterableSDK

public class IterableAppDelegate: ExpoAppDelegateSubscriber {
  public func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    /** 
     * Register the device token with Iterable.
     * @see Step 3.5.4 of https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK#step-3-5-set-up-support-for-push-notifications
     */
      IterableAPI.register(token: deviceToken)
  }
}
