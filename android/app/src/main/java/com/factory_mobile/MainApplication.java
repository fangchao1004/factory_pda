package com.factory_mobile;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.reactnativecommunity.viewpager.RNCViewPagerPackage;
import com.imagepicker.ImagePickerPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import community.revteltech.nfc.NfcManagerPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new NetInfoPackage(),
                    new RNCViewPagerPackage(),
                    new ImagePickerPackage(),
                    new AsyncStoragePackage(),
                    new NfcManagerPackage(),
                    new RNGestureHandlerPackage(),
                    new CustomToastPackage());
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.i("coco", "this is MainApplication");
        SoLoader.init(this, /* native exopackage */ false);
    }
}
