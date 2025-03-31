/** The name of the notification service */
export const NS_TARGET_NAME = 'IterableExpoRichPush';

/** The filename of the notification service's main file */
export const NS_MAIN_FILE_NAME = 'NotificationService.swift';

/** The filename of the notification service's Info.plist */
export const NS_PLIST_FILE_NAME = `${NS_TARGET_NAME}-Info.plist`;

/** The filename of the notification service's entitlements */
export const NS_ENTITLEMENTS_FILE_NAME = `${NS_TARGET_NAME}.entitlements`;

/** The files that are added to the notification service */
export const NS_FILES = [
  NS_MAIN_FILE_NAME,
  NS_PLIST_FILE_NAME,
  NS_ENTITLEMENTS_FILE_NAME,
];

/**
 * The Iterable pod that is require for the notification service to process
 * Iterable push notifications.
 */
export const NS_POD = 'Iterable-iOS-AppExtensions';

/** The content of the notification service's main file */
export const NS_MAIN_FILE_CONTENT = `import UserNotifications
import IterableAppExtensions

class NotificationService: ITBNotificationServiceExtension {}`;

/** The content of the notification service's Info.plist */
export const NS_PLIST_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>$(DEVELOPMENT_LANGUAGE)</string>
	<key>CFBundleDisplayName</key>
	<string>${NS_TARGET_NAME}</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>XPC!</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>NSExtension</key>
	<dict>
		<key>NSExtensionPointIdentifier</key>
		<string>com.apple.usernotifications.service</string>
		<key>NSExtensionPrincipalClass</key>
		<string>$(PRODUCT_MODULE_NAME).NotificationService</string>
	</dict>
</dict>
</plist>`;

/** The content of the notification service's entitlements */
export const NS_ENTITLEMENTS_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.security.app-sandbox</key>
	<true/>
	<key>com.apple.security.network.client</key>
	<true/>
</dict>
</plist>`;
