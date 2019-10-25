package com.expert.wsensor.expertcollect.util;

import android.content.Context;
import android.content.SharedPreferences;
import android.service.autofill.SaveCallback;

/**
 * @author SF-lpp nb
 */
public class SensorSharedUtil {
	
	public static final String FILE_NAME = "BLE";
	
	/**
	 * 当前绑定的传感器mac
	 */
	public static final String DEVICE_SAVE_TAG = "DEVICE_SAVE_TAG";
	/**
	 * ble传感器特性写入指令的指令头
	 */
	public static final String DEVICE_WRITE_TITLE_TAG = "DEVICE_SAVE_TITLE_TAG";
	/**
	 * 传感器型号
	 */
	public static final String Ble_SENSOR_TYPE_TAG = "SHARED_TAG_Ble_SENSOR_TYPE";
	/**
	 * 传感器版本号
	 */
	public static final String Ble_SENSOR_VERSION_TAG = "SHARED_TAG_Ble_SENSOR_VERSION";
	/**
	 * 传感器序列号
	 */
	public static final String Ble_SENSOR_SERIAL_TAG = "SHARED_TAG_Ble_SENSOR_SERIAL";
	public static void saveData(Context context, String key, Object data) {
		String type = data.getClass().getSimpleName();
		SharedPreferences sharedPreferences = context
				.getSharedPreferences(FILE_NAME, Context.MODE_PRIVATE);
		SharedPreferences.Editor editor = sharedPreferences.edit();
		
		if ("Integer".equals(type)) {
			editor.putInt(key, (Integer) data);
		} else if ("Boolean".equals(type)) {
			editor.putBoolean(key, (Boolean) data);
		} else if ("String".equals(type)) {
			editor.putString(key, (String) data);
		} else if ("Float".equals(type)) {
			editor.putFloat(key, (Float) data);
		} else if ("Long".equals(type)) {
			editor.putLong(key, (Long) data);
		}
		editor.apply();
	}
	/**
	 * 从文件中读取数据
	 * @return
	 */
	public static Object getData(Context context, String key, Object defValue) {
		String type = defValue.getClass().getSimpleName();
		SharedPreferences sharedPreferences = context.getSharedPreferences
				(FILE_NAME, Context.MODE_PRIVATE);
		//defValue为默认值，如果当前获取不到数据就返回它
		if ("Integer".equals(type)) {
			return sharedPreferences.getInt(key, (Integer) defValue);
		} else if ("Boolean".equals(type)) {
			return sharedPreferences.getBoolean(key, (Boolean) defValue);
		} else if ("String".equals(type)) {
			return sharedPreferences.getString(key, (String) defValue);
		} else if ("Float".equals(type)) {
			return sharedPreferences.getFloat(key, (Float) defValue);
		} else if ("Long".equals(type)) {
			return sharedPreferences.getLong(key, (Long) defValue);
		}
		return null;
		
	}
	
	public static String getSensorType(Context context) {
		return (String) getData(context,Ble_SENSOR_TYPE_TAG,"");
	}
	
	public static void setSensorType(Context context,String sensorType) {
		saveData(context,Ble_SENSOR_TYPE_TAG,sensorType);
	}
	
	public static String getSensorSoftVersion(Context context) {
		return (String) getData(context,Ble_SENSOR_VERSION_TAG,"");
	}
	
	public static void setSensorSoftVersion(Context context,String sensorSofrVersion) {
		saveData(context,Ble_SENSOR_VERSION_TAG,sensorSofrVersion);
	}
	
	public static String getSnCode(Context context) {
		return (String) getData(context,Ble_SENSOR_SERIAL_TAG,"");
	}
	
	public static void setSnCode(Context context,String snCode) {
		saveData(context,Ble_SENSOR_SERIAL_TAG,snCode);
	}
	
}
