package com.expert.wsensor.expertcollect;

import android.annotation.SuppressLint;
import android.content.Context;
import android.util.Log;

import com.example.jardd.allinone.OG;
import com.expert.wsensor.expertcollect.entity.SenSorOrder;
import com.expert.wsensor.expertcollect.util.DataUtil;
import com.expert.wsensor.expertcollect.util.SensorSharedUtil;

/**
 * @author SF-lpp nb
 */
public class OrderProvider {
	public static final String TAG="ORDER_PROVIDER";
	@SuppressLint("StaticFieldLeak")
	private static OrderProvider provider;
	private Context mContext;
	
	public OrderProvider(Context mContext) {
		this.mContext = mContext;
	}
	
	public static OrderProvider getProvider(Context context){
		if (provider==null){
			provider=new OrderProvider(context);
		}
		return provider;
	}
	
	
	
	public SenSorOrder getVibOrder(String sensorType,String collectionType, String frequency) {
		String characteristicAddress= (String) SensorSharedUtil.getData(mContext,SensorSharedUtil.DEVICE_WRITE_TITLE_TAG,"");
		String order=OG.getVibOrder(collectionType,characteristicAddress,frequency);
		Log.e(TAG,order);
		byte[] bytes=DataUtil.str2Byte(order);
		SenSorOrder senSorOrderEntity =new SenSorOrder();
		senSorOrderEntity.setCollectionType(collectionType);
		senSorOrderEntity.setSensorType(sensorType);
		senSorOrderEntity.setFrequency(frequency);
		senSorOrderEntity.setOrder(bytes);
		return senSorOrderEntity;
	}
	
	
	public SenSorOrder getWaveOrder(String collectionType, String frequency, String wavePoints, String sensorType) {
		String characteristicAddress= (String) SensorSharedUtil.getData(mContext,SensorSharedUtil.DEVICE_WRITE_TITLE_TAG,"");
		String order=OG.getVibWaveOrder(collectionType,characteristicAddress,
				frequency,wavePoints,sensorType);
		Log.e(TAG,order);
		byte[] bytes=DataUtil.str2Byte(order);
		SenSorOrder senSorOrderEntity =new SenSorOrder();
		senSorOrderEntity.setCollectionType(collectionType);
		senSorOrderEntity.setFrequency(frequency);
		String points=String.valueOf(Integer.parseInt(wavePoints+"00", 16));
		senSorOrderEntity.setWavePoints(points);
		senSorOrderEntity.setSensorType(sensorType);
		senSorOrderEntity.setOrder(bytes);
		return senSorOrderEntity;
	}
	
	public SenSorOrder getTmpOrder(String sensorType, String emissivity){
		String characteristicAddress= (String) SensorSharedUtil.getData(mContext,SensorSharedUtil.DEVICE_WRITE_TITLE_TAG,"");
		String order=OG.getTmpOrder(characteristicAddress,sensorType,emissivity);
		Log.e(TAG,order);
		byte[] bytes=DataUtil.str2Byte(order);
		SenSorOrder senSorOrderEntity =new SenSorOrder();
		senSorOrderEntity.setCollectionType(ConstantCollect.COLLECTION_TYPE_TMP);
		senSorOrderEntity.setSensorType(sensorType);
		senSorOrderEntity.setEmissivity(emissivity);
		senSorOrderEntity.setOrder(bytes);
		return senSorOrderEntity;
	}
	
	public SenSorOrder getRevOrder(String sensorType){
		String characteristicAddress= (String) SensorSharedUtil.getData(mContext,SensorSharedUtil.DEVICE_WRITE_TITLE_TAG,"");
		String order=OG.getRevOrder(characteristicAddress);
		Log.e(TAG,order);
		byte[] bytes=DataUtil.str2Byte(order);
		SenSorOrder senSorOrderEntity =new SenSorOrder();
		senSorOrderEntity.setSensorType(sensorType);
		senSorOrderEntity.setCollectionType(ConstantCollect.COLLECTION_TYPE_REV);
		senSorOrderEntity.setOrder(bytes);
		return senSorOrderEntity;
	}
	
	
}
