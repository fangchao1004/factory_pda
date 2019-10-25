package com.expert.wsensor.expertcollect.util;

import android.content.Context;
import android.content.SharedPreferences;

import com.expert.wsensor.expertcollect.BleDataResultGat;
import com.expert.wsensor.expertcollect.ReconnectEntity;
import com.inuker.bluetooth.library.connect.options.BleConnectOptions;
import com.inuker.bluetooth.library.search.SearchRequest;

import static android.content.Context.MODE_PRIVATE;

/**
 * @author SF-lpp nb
 */
public class ClientManagerUtil {
	
	
	/**
	 * 连接时的搜索规则
	 * @return
	 */
	public SearchRequest getBleNormalSearchOption() {
		return new SearchRequest.Builder()
				.searchBluetoothLeDevice(8000, 2)
				.build();
	}
	
	/**
	 * 重连时搜索规则
	 */
	public SearchRequest getBleUnNormalSearchOption(ReconnectEntity entity) {
		return new SearchRequest.Builder()
				.searchBluetoothLeDevice(entity.getDuration(), entity.getTimes())
				.build();
	}
	
	/**
	 * 连接配置
	 * @return
	 */
	public BleConnectOptions getBleConnOption() {
		return new BleConnectOptions.Builder()
				// 连接如果失败重试2次
				.setConnectRetry(2)
				// 连接超时15s
				.setConnectTimeout(15000)
				// 发现服务如果失败重试2次
				.setServiceDiscoverRetry(2)
				// 发现服务超时10s
				.setServiceDiscoverTimeout(10000)
				.build();
	}
	
	public void saveBleInfo(Context context,byte[] value,String macAddress) {
		SensorSharedUtil.saveData(context, SensorSharedUtil.DEVICE_SAVE_TAG, macAddress);
		String characteristicAddress = String.format("%02X", value[0]);
		SensorSharedUtil.saveData(context,SensorSharedUtil.DEVICE_WRITE_TITLE_TAG, characteristicAddress);
		//EWG系列传感器保存传感器信息
		if (isEWG(value)) {
			String sensorType = String.format("%02X", value[6]);
			//01代表EWG01,02代表EWG01P
			if ("02".equals(sensorType)) {
				sensorType = "01P";
			}
			sensorType = "EWG" + sensorType;
			String softCode = "v"+String.format("%02X", value[5]) + String.format("%02X", value[4]);
			String snCode = String.format("%02X", value[11]) + String.format("%02X", value[10]) +
					String.format("%02X", value[9]) + String.format("%02X", value[8]);
			snCode = "40" + String.valueOf(Long.parseLong(snCode, 16));
			SensorSharedUtil.setSensorType(context,sensorType);
			SensorSharedUtil.setSensorSoftVersion(context,softCode);
			SensorSharedUtil.setSnCode(context,snCode);
		}
	}
	
	public boolean isEWG(byte[] value) {
		String sensorType = String.valueOf(Integer.parseInt(String.format("%02X", value[7]), 16));
		if (value.length > 13 && "238".equals(sensorType)) {
			return true;
		}
		return false;
	}
	
	public String getElectricWhenConnect(byte[] value) {
		String electric = "";
		if (isEWG(value)) {
			electric = BleDataResultGat.getEleWhenConnect(value) + "%";
		}
		return electric;
	}
}
