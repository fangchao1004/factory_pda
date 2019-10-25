package com.factory_mobile;

import android.content.Context;
import android.content.Intent;
import android.location.LocationManager;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;

import com.expert.wsensor.expertwirelesssensordemo.view.UIHelper;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

import butterknife.ButterKnife;

public class MainActivity extends ReactActivity {


    Context mContext;

    /**
     * Returns the name of the main component registered from JavaScript. This is
     * used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "factory_mobile";
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mContext=this;
        //android6.0之后搜索蓝牙设备需要位置权限并打开位置功能
        //恩普特PAMS系列点检仪，默认具有各种危险权限，所以这里仅检测位置开关是否打开
        initLocationEnable();
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        Log.i("coco", "this is MainActivity");

        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(MainActivity.this);
            }
        };
    }


    /**
     * 初始位置信息
     */
    private void initLocationEnable() {
        Log.i("coco", String.valueOf(isLocationEnable(mContext)));
        if (!isLocationEnable(mContext)) {
            UIHelper.showConfirmDialog(mContext, "提示", "位置信息未打开无线设备不能使用，请前往打开!", () -> {
                Intent locationIntent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
                startActivity(locationIntent);
            });
        }
    }

    /**
     * 判断位置功能按钮是否打开
     */
    private boolean isLocationEnable(Context context) {
        LocationManager locationManager = (LocationManager) context.getSystemService(Context
                .LOCATION_SERVICE);
        boolean networkProvider = locationManager.isProviderEnabled(LocationManager
                .NETWORK_PROVIDER);
        boolean gpsProvider = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
        if (networkProvider || gpsProvider) return true;
        return false;
    }


}
