package com.expert.wsensor.expertcollect.entity;

import android.text.TextUtils;

import com.example.jardd.allinone.a;

/**
 * @author SF-lpp nb
 */
public class SenSorOrder {
	/**
	 * 采集类型：（（加速度、速度、位移）波形）、温度、转速
	 */
	String collectionType;
	/**
	 * 采样频率：zd710与EWG01固定5120；EWG01P可选5120 和12800；
	 */
	String frequency;
	/**
	 * 采集波形时的采样点数 zd710与EWG01固定2048点;EWG01P 可选256、512、1024、2048
	 */
	String wavePoints;
	
	/**
	 * 是否是振动波形采集指令
	 */
	boolean isWave;
	/**
	 * 传感器类型
	 */
	String sensorType;
	/**
	 * 温度采集发射率，zd710与EWG01固定0.95；EWG01P可填写0.00~1
	 */
	String emissivity;
	
	byte[] order;
	
	public String getCollectionType() {
		return collectionType;
	}
	
	public void setCollectionType(String collectionType) {
		this.collectionType = collectionType;
	}
	
	public String getFrequency() {
		return frequency;
	}
	
	public void setFrequency(String frequency) {
		this.frequency = frequency;
	}
	
	public boolean isWave() {
		return isWave || !TextUtils.isEmpty(wavePoints);
	}
	
	public void setWave(boolean wave) {
		isWave = wave;
	}
	
	public int getWavePoints() {
		return Integer.valueOf(wavePoints);
	}
	
	public void setWavePoints(String wavePoints) {
		this.wavePoints = wavePoints;
	}
	
	public String getSensorType() {
		return sensorType;
	}
	
	public void setSensorType(String sensorType) {
		this.sensorType = sensorType;
	}
	
	public String getEmissivity() {
		return emissivity;
	}
	
	public void setEmissivity(String emissivity) {
		this.emissivity = emissivity;
	}
	
	public byte[] getOrder() {
		return order;
	}
	
	public void setOrder(byte[] order) {
		this.order = order;
	}
}
