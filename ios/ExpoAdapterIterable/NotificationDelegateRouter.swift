import IterableSDK
import UserNotifications

final class NotificationDelegateRouter: NSObject, UNUserNotificationCenterDelegate {
  static let shared = NotificationDelegateRouter()
  private weak var forwardTo: UNUserNotificationCenterDelegate?

  func install() {
    let center = UNUserNotificationCenter.current()
    forwardTo = center.delegate
    center.delegate = self

    if forwardTo == nil {
      ITBInfo(
        "NotificationDelegateRouter: no prior delegate captured — non-Iterable pushes won't be forwarded"
      )
    }
  }

  private func isIterablePush(_ userInfo: [AnyHashable: Any]) -> Bool {
    userInfo["itbl"] is [AnyHashable: Any]
  }

  // MARK: - willPresent (foreground)

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    if isIterablePush(notification.request.content.userInfo) {
      completionHandler([.badge, .banner, .list, .sound])
    } else if let forwardTo {
      forwardTo.userNotificationCenter?(
        center, willPresent: notification, withCompletionHandler: completionHandler)
    } else {
      completionHandler([])
    }
  }

  // MARK: - didReceive (tap / action)

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    if isIterablePush(response.notification.request.content.userInfo) {
      IterableAppIntegration.userNotificationCenter(
        center, didReceive: response, withCompletionHandler: completionHandler)
    } else if let forwardTo {
      forwardTo.userNotificationCenter?(
        center, didReceive: response, withCompletionHandler: completionHandler)
    } else {
      completionHandler()
    }
  }
}
