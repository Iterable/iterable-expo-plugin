package expo.modules.adapters.iterable

import android.app.Application
import android.content.Context
import expo.modules.core.interfaces.ApplicationLifecycleListener
import com.iterable.iterableapi.IterableApi;

class IterableApplicationLifecycleListener() : ApplicationLifecycleListener {
    override fun onCreate(application: Application) {
        /**
         * See step 4.5 of the Iterable RN SDK integration guide:
         * https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK
         * 
         * TODO: Add kotlin implementation to docs
         */
        IterableApi.setContext(application)
    }
}
