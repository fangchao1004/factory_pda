package com.factory_mobile;

import android.app.Dialog;
import android.content.Context;
import android.support.annotation.Nullable;
import android.telecom.Call;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Toast;

import com.expert.wsensor.expertcollect.BleConnectInf;
import com.expert.wsensor.expertcollect.ClientManager;
import com.expert.wsensor.expertcollect.CollectedCallBack;
import com.expert.wsensor.expertcollect.ConstantCollect;
import com.expert.wsensor.expertcollect.entity.SenSorOrder;
import com.expert.wsensor.expertcollect.entity.Sensor;
import com.expert.wsensor.expertcollect.entity.SensorData;
import com.expert.wsensor.expertcollect.util.CollectionUtil;
import com.expert.wsensor.expertwirelesssensordemo.activity.CollectTmpRevActivity;
import com.expert.wsensor.expertwirelesssensordemo.view.UIHelper;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.inuker.bluetooth.library.Code;

import java.util.Map;
import java.util.HashMap;

public class ToastModule extends ReactContextBaseJavaModule implements BleConnectInf, CollectedCallBack {

    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";
    CollectionUtil collectionUtil;

    private String bleAddress;

    public ToastModule(ReactApplicationContext reactContext) {
        super(reactContext);
        collectionUtil=new CollectionUtil(getReactApplicationContext(),this);
    }

    @Override
    public String getName() {
        return "ToastExample";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
        constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
        return constants;
    }

    @ReactMethod
    public void show(String message, int duration) {
        Toast.makeText(getReactApplicationContext(), message, duration).show();
    }

    @ReactMethod
    public void bindDevice() {
        ClientManager.getClientManager().bindSensor(getReactApplicationContext(), "DC:0D:30:70:3F:46");
        Toast.makeText(getReactApplicationContext(), "绑定成功 DC:0D:30:70:3F:46", Toast.LENGTH_SHORT).show();
    }

    @ReactMethod
    public void connectDevice() {
        bleAddress = ClientManager.getClientManager().getBindedSensor(getReactApplicationContext());
        if (TextUtils.isEmpty(bleAddress)) {
            Toast.makeText(getReactApplicationContext(), "未绑定传感器", Toast.LENGTH_SHORT).show();
            return;
        }
        Log.i("coco", String.valueOf(ClientManager.getClientManager().isConnected(getReactApplicationContext())));
        if (ClientManager.getClientManager().isConnected(getReactApplicationContext())) {
            //断开
            Toast.makeText(getReactApplicationContext(), "正在断开", Toast.LENGTH_SHORT).show();
            ClientManager.getClientManager().disconnectBle(getReactApplicationContext(), bleAddress);
        } else {
            //连接
            Toast.makeText(getReactApplicationContext(), "开始连接。。。", Toast.LENGTH_SHORT).show();
            ClientManager.getClientManager().connectBle(getReactApplicationContext(), bleAddress,
                    ToastModule.this);
        }

    }

    @Override
    public void connectBleResponse(int code, String elect) {
        if (code == Code.REQUEST_SUCCESS) {
            Toast.makeText(getReactApplicationContext(), "连接成功！", Toast.LENGTH_SHORT).show();
        } else if (code == Code.REQUEST_FAILED) {
            Toast.makeText(getReactApplicationContext(), "连接失败！", Toast.LENGTH_SHORT).show();
        }
    }

    Callback tmpCallback;
    String tag = "1";

    @ReactMethod
    public void collectTmp(Callback callback) {
        tmpCallback = callback;
        tag = "1";
        Sensor sensor = Sensor.getCurrentSensor(getReactApplicationContext());
        //第二个参数为发射率，如果使用的是EWG01p传感器和设定发射率
        SenSorOrder order= collectionUtil.getTmpOrder(sensor.getSensorType(), ConstantCollect.TMP_EMISSIVITY);
        collectionUtil.startCheck(sensor,order);
    }

    @ReactMethod
    public void collectVib(Callback callback) {
        tmpCallback = callback;
        tag = "2";
        Sensor sensor = Sensor.getCurrentSensor(getReactApplicationContext());
        SenSorOrder order= collectionUtil.getVibOrder(sensor.getSensorType(),ConstantCollect.COLLECTION_TYPE_DISPLACEMENT,ConstantCollect.COLLECTION_FREQUENCY_5120);
        collectionUtil.startCheck(sensor,order);
    }

    @ReactMethod
    public void stopCollect() {
        collectionUtil.stopCheckout();
    }

    @ReactMethod
    public void isConnected(Callback callback) {
        callback.invoke(ClientManager.getClientManager().isConnected(getReactApplicationContext()));
    }


    /**
     * 数据采集回调
     * @param result
     */
    @Override
    public void informData(SensorData result) {
        if (tag == "1") {
            SensorData.TmpData data=  result.getTmpData();
            WritableMap map = Arguments.createMap();
            map.putString("value", data.getTmpValue());
            this.sendEvent(getReactApplicationContext(), "tmpEvent", map);
        } else {
            SensorData.VibData data2=  result.getVibData();
            WritableMap map2 = Arguments.createMap();
            map2.putString("value", data2.getDisValue());
            this.sendEvent(getReactApplicationContext(), "vibEvent", map2);
        }
    }

    /**
     * 数据采集异常
     * @param msg
     */
    @Override
    public void onCollectAbnormal(String msg) {
        Toast.makeText(getReactApplicationContext(),msg,Toast.LENGTH_SHORT).show();
    }

    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

}
