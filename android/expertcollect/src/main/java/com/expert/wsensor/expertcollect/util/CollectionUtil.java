package com.expert.wsensor.expertcollect.util;

import android.app.usage.ConfigurationStats;
import android.content.Context;
import android.util.Log;
import android.widget.Toast;

import com.expert.wsensor.expertcollect.BleDataResultGat;
import com.expert.wsensor.expertcollect.ClientManager;
import com.expert.wsensor.expertcollect.CollectedCallBack;
import com.expert.wsensor.expertcollect.ConstantCollect;
import com.expert.wsensor.expertcollect.ExpertBluetoothClient;
import com.expert.wsensor.expertcollect.OrderProvider;
import com.expert.wsensor.expertcollect.entity.SenSorOrder;
import com.expert.wsensor.expertcollect.entity.Sensor;
import com.expert.wsensor.expertcollect.entity.SensorData;
import com.inuker.bluetooth.library.BluetoothClient;
import com.inuker.bluetooth.library.Code;
import com.inuker.bluetooth.library.Constants;
import com.inuker.bluetooth.library.connect.response.BleNotifyResponse;
import com.inuker.bluetooth.library.connect.response.BleWriteResponse;

import java.util.UUID;

import static android.content.Context.MODE_PRIVATE;

/**
 * @author SF-lpp nb
 */
public class CollectionUtil {
	
	private Context context;
	private CollectedCallBack dataCallBack;
	private SenSorOrder order;
	private Sensor sensor;
	private boolean isCollecting;
	private ExpertBluetoothClient bleClient;
	private BleWriteResponse writeResponse = i -> {
	};
	/**
	 * 采集到的波形数据
	 */
	private byte[] mosaicBytes = null;
	/**
	 * 开始采集后，异常情况出现次数,数据返回则置为0
	 */
	private int collectErrTag = 0;
	/**
	 * 返回的波形数据的报文头字节数
	 */
	private int msgHeadNums;
	
	public CollectionUtil(Context context, CollectedCallBack inf) {
		this.context = context;
		this.dataCallBack = inf;
	}
	
	android.os.Handler checkHandler;
	
	/**
	 * 开始数据采集
	 *
	 * @param order
	 */
	public void startCheck(Sensor sensor, SenSorOrder order) {
		this.order = order;
		this.sensor = sensor;
		checkHandler = new android.os.Handler();
		if (order.getCollectionType().equals(ConstantCollect.COLLECTION_TYPE_REV) &&
				!sensor.isEwg01p()) {
			Toast.makeText(context, "请使用EWG01P传感器", Toast.LENGTH_SHORT).show();
			return;
		}
		if (sensor.isEwg01p()) {
			msgHeadNums = 16;
		} else {
			msgHeadNums = 13;
		}
		bleClient = ClientManager.getClient(context);
		if (order.isWave()) {
			mosaicBytes = null;
		}
		bleClient.unnotify(sensor.getMacAddress(), ConstantCollect.CONSTANT_service_uuid,
				ConstantCollect.CONSTANT_read_gatt_uuid, code -> Log.d("CollectionUtil", "停止采集"));
		bleClient.notify(sensor.getMacAddress(), ConstantCollect.CONSTANT_service_uuid,
				ConstantCollect.CONSTANT_read_gatt_uuid, notifyResponse);
	}
	
	/**
	 * 停止采集
	 */
	public void stopCheckout() {
		isCollecting = false;
		try {
			if (null == bleClient) {
				return;
			}
			mosaicBytes = null;
			checkHandler.removeCallbacks(mCheckTimeOutRunnable);
			//清除队列
			bleClient.clearRequest(sensor.getMacAddress(), Constants.REQUEST_NOTIFY);
			bleClient.clearRequest(sensor.getMacAddress(), Constants.REQUEST_WRITE);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * 采集到的数据通知
	 */
	private BleNotifyResponse notifyResponse = new BleNotifyResponse() {
		@Override
		public void onNotify(UUID uuid, UUID uuid1, byte[] bytes) {
			Log.e("HighFCollectionUtil", "----" + DataUtil.byteToString(bytes) + "----");
			//未在采集状态则接收到的数据不作处理
			if (!isCollecting) {
				return;
			}
			collectErrTag = 0;
			if (order.isWave()) {
				//波形数据
				if ((mosaicBytes == null || mosaicBytes.length == 0) && bytes[2] == getCommandCode()) {
					mosaicBytes = bytes;
				} else if (mosaicBytes != null) {
					mosaicBytes = mosaicWaveDataForBytes(mosaicBytes, bytes);
					//采集到指定长度的波形数据视为一组波形数据采集完成
					if (mosaicBytes.length == (order.getWavePoints() * 2) + msgHeadNums) {
						//一组波形数据组长完毕
						byte[] resultBytes = mosaicBytes;
						SensorData sensorData=new SensorData();
						sensorData.setVibWaveData(analysisWave(resultBytes));
						dataCallBack.informData(sensorData);
						bleClientWrite();
					}
				}
			} else if (order.getCollectionType() == ConstantCollect.COLLECTION_TYPE_TMP) {
				//温度数据
				if (bytes.length > 5 && bytes[2] == getCommandCode()) {
					bleClientWrite();
					SensorData sensorData=new SensorData();
					sensorData.setTmpData(analysisTmp(bytes));
					dataCallBack.informData(sensorData);
				}
			} else {
				//振动、转速特征值
				bleClientWrite();
				SensorData sensorData=new SensorData();
				if (order.getCollectionType().equals(ConstantCollect.COLLECTION_TYPE_REV)){
					sensorData.setRevData(analysisRev(bytes));
				}else {
					sensorData.setVibData(analysisVib(bytes));
				}
				dataCallBack.informData(sensorData);
				
			}
		}
		
		@Override
		public void onResponse(int i) {
			if (i == Code.REQUEST_SUCCESS) {
				bleClientWrite();
			}
		}
	};
	
	/**
	 * 写入指令
	 */
	private void bleClientWrite() {
		isCollecting = true;
		checkHandler.removeCallbacks(mCheckTimeOutRunnable);
		mosaicBytes = null;
		bleClient.write(sensor.getMacAddress(), ConstantCollect.CONSTANT_service_uuid,
				ConstantCollect.CONSTANT_write_gatt_uuid, order.getOrder(), writeResponse);
		//七秒后检测是否回执
		checkHandler.postDelayed(mCheckTimeOutRunnable, 70000);
	}
	
	private byte[] mosaicWaveDataForBytes(byte[] data1, byte[] data2) {
		byte[] data3 = new byte[data1.length + data2.length];
		System.arraycopy(data1, 0, data3, 0, data1.length);
		System.arraycopy(data2, 0, data3, data1.length, data2.length);
		return data3;
	}
	
	private Runnable mCheckTimeOutRunnable = new Runnable() {
		@Override
		public void run() {
			if (!isCollecting) {
				return;
			}
			collectErrTag += 1;
			String msg = "采集异常，请检查传感器连接状态或重新采集";
			if (collectErrTag == 2) {
				dataCallBack.onCollectAbnormal(msg);
			} else {
				if (bleClient.getConnectStatus(sensor.getMacAddress()) == Constants
						.STATUS_DEVICE_CONNECTED) {
					bleClientWrite();
				}
			}
		}
	};
	
	/**
	 * 解析波形数据
	 */
	private SensorData.VibWaveData analysisWave(byte[] result){
		SensorData.VibWaveData vibWaveData=new SensorData.VibWaveData();
		if (sensor.isEwg01p()){
			//EWG01P 传感器波形数据包含电量信息
			float[] waveData=BleDataResolveUtil.getWaveVal_EWG01P(order.getCollectionType(), result);
			float[] value=BleDataResultGat.value;
			vibWaveData.setAccValue(value[0]);
			vibWaveData.setSpeedValue(value[1]);
			vibWaveData.setDisValue(value[2]);
			vibWaveData.setEle(value[3]);
			vibWaveData.setWaveValue(waveData);
		}else {
			//EWG01 传感器波形数据不包含电量信息
			float[] waveData = BleDataResolveUtil.getWaveVal(order.getCollectionType(), result);
			float value = BleDataResultGat.wave_result ;
			if (order.getCollectionType().equals(ConstantCollect.COLLECTION_TYPE_ACCELERATION)){
				vibWaveData.setAccValue(value);
			}else if  (order.getCollectionType().equals(ConstantCollect.COLLECTION_TYPE_SPEED)){
				vibWaveData.setSpeedValue(value);
			}else if  (order.getCollectionType().equals(ConstantCollect.COLLECTION_TYPE_DISPLACEMENT)){
				vibWaveData.setDisValue(value);
			}
			vibWaveData.setWaveValue(waveData);
		}
		return vibWaveData;
	}
	
	/**
	 * 解析温度
	 */
	private SensorData.TmpData analysisTmp(byte[] result){
		SensorData.TmpData tmpData=new SensorData.TmpData();
		int ele=BleDataResultGat.getEleWhenCollect(result);
		String tmp;
		if (sensor.isEwg01p()){
			tmp = BleDataResultGat.getTmpReasonable_EWG01P(result);
		}else {
			tmp = BleDataResultGat.getTmpReasonable(result);
		}
		tmpData.setTmpValue(tmp);
		tmpData.setEle(String.valueOf(ele));
		return tmpData;
	}
	
	/**
	 * 解析特征值--加速度、速度、位移
	 */
	private SensorData.VibData analysisVib(byte[] result){
		SensorData.VibData vibData=new SensorData.VibData();
		int ele=BleDataResultGat.getEleWhenCollect(result);
		String value;
		if (order.getCollectionType().equals(ConstantCollect.COLLECTION_TYPE_ACCELERATION)){
			value = BleDataResolveUtil.getAccReasonable(result);
			vibData.setAccValue(value);
		}else if (order.getCollectionType().equals(ConstantCollect.COLLECTION_TYPE_SPEED)){
			value = BleDataResolveUtil.getSpeedReasonable(result);
			vibData.setSpeedValue(value);
		}else if (order.getCollectionType().equals(ConstantCollect.COLLECTION_TYPE_DISPLACEMENT)){
			value = BleDataResolveUtil.getDisReasonable(result);
			vibData.setDisValue(value);
		}
		vibData.setEle(String.valueOf(ele));
		return vibData;
	}
	
	/**
	 * 解析特征值--转速
	 */
	private SensorData.RevData analysisRev(byte[] result){
		SensorData.RevData revData =new SensorData.RevData();
		int ele=BleDataResultGat.getEleWhenCollect(result);
		String rev= BleDataResultGat.getDisRev(result);
		revData.setRevValue(rev);
		revData.setEle(String.valueOf(ele));
		return revData;
	}
	
	
	/**
	 * 获取回执命令字
	 * 验证回执是否是正在采集的类型;
	 */
	private byte getCommandCode() {
		String collectionType = order.getCollectionType();
		byte code = 0;
		if (collectionType.equals(ConstantCollect.COLLECTION_TYPE_TMP)) {
			code = 0x61;
		} else if (collectionType.equals(ConstantCollect.COLLECTION_TYPE_SPEED)) {
			code = 0x21;
			if (order.isWave()) {
				code = 0x24;
			}
		} else if (collectionType.equals(ConstantCollect.COLLECTION_TYPE_ACCELERATION)) {
			code = 0x11;
			if (order.isWave()) {
				code = 0x14;
			}
		} else if (collectionType.equals(ConstantCollect.COLLECTION_TYPE_DISPLACEMENT)) {
			code = 0x31;
			if (order.isWave()) {
				code = 0x34;
			}
		} else if (collectionType.equals(ConstantCollect.COLLECTION_TYPE_REV)) {
			code = 0x71;
		}
		if (order.isWave() && sensor.isEwg01p()) {
			code = 0x44;
		}
		return code;
	}
	
	
	/**
	 * 获取振动采集指令
	 */
	public SenSorOrder getVibOrder(String sensorType, String collectionType, String frequency) {
		return OrderProvider.getProvider(context)
				.getVibOrder(sensorType, collectionType, frequency);
	}
	
	/**
	 * 获取振动波形采集指令
	 */
	public SenSorOrder getWaveOrder(String collectionType, String frequency, String wavePoints,
									String sensorType) {
		return OrderProvider.getProvider(context)
				.getWaveOrder(collectionType, frequency, wavePoints, sensorType);
	}
	
	/**
	 * 获取温度采集指令
	 */
	public SenSorOrder getTmpOrder(String sensorType, String emissivity) {
		return OrderProvider.getProvider(context)
				.getTmpOrder(sensorType, emissivity);
	}
	
	/**
	 * 获取转速采集指令
	 */
	public SenSorOrder getRevOrder(String sensorType) {
		return OrderProvider.getProvider(context)
				.getRevOrder(sensorType);
	}
	
}
