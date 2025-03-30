/** The name of the notification service */
export const NS_TARGET_NAME = 'IterableExpoRichPush';

/** The filename of the notification service's Info.plist */
export const NS_PLIST_FILENAME = `${NS_TARGET_NAME}-Info.plist`;

/** The filename of the notification service's entitlements */
export const NS_ENTITLEMENTS_FILENAME = `${NS_TARGET_NAME}.entitlements`;

/** The files that are added to the notification service */
export const NS_FILES = [
  'NotificationService.swift',
  NS_PLIST_FILENAME,
  NS_ENTITLEMENTS_FILENAME,
];

/** 
 * The Iterable pod that is require for the notification service to process
 * Iterable push notifications.  
 */
export const NS_POD = 'Iterable-iOS-AppExtensions';
