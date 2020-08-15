package com.factory_mobile;

import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Environment;
import android.support.annotation.Nullable;
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
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.inuker.bluetooth.library.Code;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.io.OutputStreamWriter;
import java.io.RandomAccessFile;
import java.io.Reader;
import java.net.NetworkInterface;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class ToastModule extends ReactContextBaseJavaModule implements BleConnectInf, CollectedCallBack {

    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";
    CollectionUtil collectionUtil;

    private String bleAddress;

    public ToastModule(ReactApplicationContext reactContext) {
        super(reactContext);
        collectionUtil = new CollectionUtil(getReactApplicationContext(), this);
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

    private final String MAC_ADDRESS_1 = "DC:0D:30:70:3F:46";/// 工厂测试一
    private final String MAC_ADDRESS_2 = "DC:0D:30:70:3F:0C";/// wdf测试一

    @ReactMethod
    public void bindDevice(String tool_address) {
        ClientManager.getClientManager().bindSensor(getReactApplicationContext(), tool_address);
        Toast.makeText(getReactApplicationContext(), "绑定成功 " + tool_address, Toast.LENGTH_SHORT).show();
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
            // 断开
            Toast.makeText(getReactApplicationContext(), "正在断开", Toast.LENGTH_SHORT).show();
            ClientManager.getClientManager().disconnectBle(getReactApplicationContext(), bleAddress);
        } else {
            // 连接
            Toast.makeText(getReactApplicationContext(), "开始连接。。。", Toast.LENGTH_SHORT).show();
            ClientManager.getClientManager().connectBle(getReactApplicationContext(), bleAddress, ToastModule.this);
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
        // 第二个参数为发射率，如果使用的是EWG01p传感器和设定发射率
        SenSorOrder order = collectionUtil.getTmpOrder(sensor.getSensorType(), ConstantCollect.TMP_EMISSIVITY);
        collectionUtil.startCheck(sensor, order);
    }

    @ReactMethod
    public void collectVib(Callback callback) {
        tmpCallback = callback;
        tag = "2";
        Sensor sensor = Sensor.getCurrentSensor(getReactApplicationContext());
        SenSorOrder order = collectionUtil.getVibOrder(sensor.getSensorType(),
                ConstantCollect.COLLECTION_TYPE_DISPLACEMENT, ConstantCollect.COLLECTION_FREQUENCY_5120);
        collectionUtil.startCheck(sensor, order);
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
     *
     * @param result
     */
    @Override
    public void informData(SensorData result) {
        if (tag == "1") {
            SensorData.TmpData data = result.getTmpData();
            WritableMap map = Arguments.createMap();
            map.putString("value", data.getTmpValue());
            this.sendEvent(getReactApplicationContext(), "tmpEvent", map);
        } else {
            SensorData.VibData data2 = result.getVibData();
            WritableMap map2 = Arguments.createMap();
            map2.putString("value", data2.getDisValue());
            this.sendEvent(getReactApplicationContext(), "vibEvent", map2);
        }
    }

    /**
     * 数据采集异常
     *
     * @param msg
     */
    @Override
    public void onCollectAbnormal(String msg) {
        Toast.makeText(getReactApplicationContext(), msg, Toast.LENGTH_SHORT).show();
    }

    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

    /**
     * Android 6.0 之前（不包括6.0）获取mac地址 必须的权限 <uses-permission android:name=
     * "android.permission.ACCESS_WIFI_STATE"></uses-permission>
     *
     * @param context * @return
     */
    public static String getMacDefault(Context context) {
        String mac = "";
        if (context == null) {
            return mac;
        }
        WifiManager wifi = (WifiManager) MainApplication.getWifiManager();
        WifiInfo info = null;
        try {
            info = wifi.getConnectionInfo();
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (info == null) {
            return null;
        }
        mac = info.getMacAddress();
        if (!TextUtils.isEmpty(mac)) {
            mac = mac.toUpperCase(Locale.ENGLISH);
        }
        return mac;
    }

    /**
     * Android 6.0-Android 7.0 获取mac地址
     */
    public static String getMacAddress() {
        String macSerial = null;
        String str = "";

        try {
            Process pp = Runtime.getRuntime().exec("cat/sys/class/net/wlan0/address");
            InputStreamReader ir = new InputStreamReader(pp.getInputStream());
            LineNumberReader input = new LineNumberReader(ir);

            while (null != str) {
                str = input.readLine();
                if (str != null) {
                    macSerial = str.trim();// 去空格
                    break;
                }
            }
        } catch (IOException ex) {
            // 赋予默认值
            ex.printStackTrace();
        }

        return macSerial;
    }

    /**
     * Android 7.0之后获取Mac地址 遍历循环所有的网络接口，找到接口是 wlan0 必须的权限
     * <uses-permission android:name=
     * "android.permission.INTERNET"></uses-permission>
     *
     * @return
     */
    public static String getMacFromHardware() {
        try {
            List<NetworkInterface> all = Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface item : all) {
                if (!item.getName().equalsIgnoreCase("wlan0"))
                    continue;
                byte[] macBytes = item.getHardwareAddress();
                if (macBytes == null)
                    return "";
                StringBuilder res1 = new StringBuilder();
                for (Byte b : macBytes) {
                    res1.append(String.format("%02X:", b));
                }
                if (!TextUtils.isEmpty(res1)) {
                    res1.deleteCharAt(res1.length() - 1);
                }
                return res1.toString();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "";
    }

    /**
     * 获取mac地址（适配所有Android版本）
     *
     * @return
     */
    @ReactMethod
    public void getMac(Callback callbacks) {
        String mac = "";
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            mac = getMacDefault(MainApplication.getContext());
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            mac = getMacAddress();
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            mac = getMacFromHardware();
        }
        callbacks.invoke(mac);
    }

    ////////////////////////////////////////////
    public static String rootXMLPath = Environment.getExternalStorageDirectory().getPath() + "/巡检记录";

//    @ReactMethod
//    public boolean writeToTxt(String content, String fileName, Callback callback) {
//        FileOutputStream fileOutputStream;
//        BufferedWriter bufferedWriter;
//        createDirectory(rootXMLPath);
//        File file = new File(rootXMLPath + "/" + fileName + ".txt");
//        try {
//            file.createNewFile();
//            fileOutputStream = new FileOutputStream(file);
//            bufferedWriter = new BufferedWriter(new OutputStreamWriter(fileOutputStream));
//            bufferedWriter.write(content);
//            bufferedWriter.close();
//            callback.invoke(true);
//        } catch (IOException e) {
//            callback.invoke(false);
//            Log.e("报错:", "。。。。。");
//            e.printStackTrace();
//            return false;
//        }
//        return true;
//    }

    /**
     * 创建文件夹
     *
     * @param fileDirectory
     */
    public static void createDirectory(String fileDirectory) {
        File file = new File(fileDirectory);
        if (!file.exists()) {
            file.mkdirs();
        }
    }

    @ReactMethod
    public void readFromTxt(String fileName, Callback callback) {
        try {
            FileInputStream fis = new FileInputStream(rootXMLPath + "/" + fileName + ".txt");
            BufferedReader br = new BufferedReader(new InputStreamReader(fis, "gb2312"));
            StringBuilder sb = new StringBuilder("");
            String line = null;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
            br.close();
            callback.invoke(sb.toString());
        } catch (Exception e) {
            callback.invoke("");
            e.printStackTrace();
        }
    }

    /**
     * 追加写入数据
     *
     * @param fileName 文件名称
     * @param content  序列化的对象数据 String 类型 "{}"
     * @param callback 回调函数
     */
    @ReactMethod
    public void pushDataToTxt(String fileName, String content, Callback callback) {
        try {
            createDirectory(rootXMLPath);
            final String filePath = rootXMLPath + "/" + fileName + ".txt";
            // 打开一个随机访问文件流，按读写方式
            RandomAccessFile randomFile = new RandomAccessFile(filePath, "rw");
            // 文件长度，字节数
            long fileLength = randomFile.length();
            long index;///指针
            String new_content = "";
            ///如果txt文件中已经存在 数组数据 如：[{},{},{}]
            if (fileLength > 0) {
                index = fileLength - 1;
                //将content,添加上一个,逗号和]
                new_content = "," + content + "]";
            } else {
                index = fileLength;
                new_content = "[" + content + "]";
            }
            // 将写文件光标指针移到对应的位置。
            randomFile.seek(index);
            randomFile.write((new_content).getBytes("gb2312"));
            randomFile.close();
            callback.invoke(true);
        } catch (IOException e) {
            callback.invoke(false);
            e.printStackTrace();
        }
    }


    /**
     * 删除单个文件
     *
     * @param fileName
     * @param callback
     */
    @ReactMethod
    public void deleteFile(String fileName, Callback callback) {
        String filePath = rootXMLPath + "/" + fileName + ".txt";
        File file = new File(filePath);
        if (file.isFile() && file.exists()) {
            callback.invoke(file.delete());
        } else {
            callback.invoke(false);

        }
    }
}
