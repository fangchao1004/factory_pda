package com.expert.wsensor.expertcollect.entity;

import android.content.Context;

import com.expert.wsensor.expertcollect.ConstantCollect;
import com.expert.wsensor.expertcollect.util.SensorSharedUtil;

/**
 * @author SF-lpp nb
 */
public class Sensor {
	
	/**
	 * 获取最近一次连接的传感器
	 * @return
	 */
	public static Sensor getCurrentSensor(Context context){
		Sensor sensor=new Sensor();
		sensor.setMacAddress((String) SensorSharedUtil.getData(context,SensorSharedUtil.DEVICE_SAVE_TAG,""));
		sensor.setCharacteristicAddress((String) SensorSharedUtil.getData(context,SensorSharedUtil.DEVICE_WRITE_TITLE_TAG,""));
		sensor.setSensorType(SensorSharedUtil.getSensorType(context));
		sensor.setSoftCode(SensorSharedUtil.getSensorSoftVersion(context));
		sensor.setSnCode(SensorSharedUtil.getSnCode(context));
		return sensor;
	}
	
	/**
	 * 获取最近一次连接的传感器的类型
	 */
	public static String getCurrentSensorType(Context context){
		return SensorSharedUtil.getSensorType(context);
	}
	
	/**
	 * 是否是EWG01P传感器
	 */
	public boolean isEwg01p(){
		return this.sensorType.equals(ConstantCollect.SENSOR_TYPE_EWG01P);
	}
	
	/**
	 * 传感器mac
	 */
	private String macAddress;
	
	/**
	 * 传感器指令写入地址头
	 */
	private String characteristicAddress;
	/**
	 * 传感器类型
	 */
	private String sensorType;
	/**
	 * 传感器内置软件版本
	 */
	
	private String softCode;
	/**
	 * 传感器SN码
	 */
	private String snCode;
	
	public String getMacAddress() {
		return macAddress;
	}
	
	public void setMacAddress(String macAddress) {
		this.macAddress = macAddress;
	}
	
	public String getCharacteristicAddress() {
		return characteristicAddress;
	}
	
	public void setCharacteristicAddress(String characteristicAddress) {
		this.characteristicAddress = characteristicAddress;
	}
	
	public String getSensorType() {
		return sensorType;
	}
	
	public void setSensorType(String sensorType) {
		this.sensorType = sensorType;
	}
	
	public String getSoftCode() {
		return softCode;
	}
	
	public void setSoftCode(String softCode) {
		this.softCode = softCode;
	}
	
	public String getSnCode() {
		return snCode;
	}
	
	public void setSnCode(String snCode) {
		this.snCode = snCode;
	}
}
