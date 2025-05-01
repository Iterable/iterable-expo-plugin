package expo.modules.adapters.iterable

import android.app.Application
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.Manifest
import expo.modules.core.interfaces.ApplicationLifecycleListener
import com.iterable.iterableapi.IterableApi

class IterableApplicationLifecycleListener : ApplicationLifecycleListener {
    override fun onCreate(application: Application) {
        /**
         * See step 4.5 of the Iterable RN SDK integration guide:
         * https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK
         * 
         * TODO: Add kotlin implementation to docs
         */
        IterableApi.setContext(application)
        
        // Check if we should request permissions
        val applicationInfo = application.packageManager.getApplicationInfo(
            application.packageName,
            PackageManager.GET_META_DATA
        )
        
        val shouldRequestPermissions = applicationInfo.metaData?.getBoolean(
            "ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS",
            false
        ) ?: false

        println("shouldRequestPermissions: $shouldRequestPermissions")

        if (shouldRequestPermissions && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val permission = Manifest.permission.POST_NOTIFICATIONS
            if (ContextCompat.checkSelfPermission(application, permission) != PackageManager.PERMISSION_GRANTED) {
                // Since we're in the Application lifecycle, we need to wait for an activity
                // We can use a handler to post this request once an activity is available
                application.registerActivityLifecycleCallbacks(object : Application.ActivityLifecycleCallbacks {
                    override fun onActivityCreated(activity: android.app.Activity, savedInstanceState: android.os.Bundle?) {
                        ActivityCompat.requestPermissions(activity, arrayOf(permission), 1)
                        application.unregisterActivityLifecycleCallbacks(this)
                    }
                    
                    // Implement other required methods as empty
                    override fun onActivityStarted(activity: android.app.Activity) {}
                    override fun onActivityResumed(activity: android.app.Activity) {}
                    override fun onActivityPaused(activity: android.app.Activity) {}
                    override fun onActivityStopped(activity: android.app.Activity) {}
                    override fun onActivitySaveInstanceState(activity: android.app.Activity, outState: android.os.Bundle) {}
                    override fun onActivityDestroyed(activity: android.app.Activity) {}
                })
            }
        }
    }
}
