package com.expert.wsensor.expertcollect;

import android.content.Context;
import android.os.CountDownTimer;
import android.text.TextUtils;
import android.util.Log;

import com.expert.wsensor.expertcollect.util.ClientManagerUtil;
import com.expert.wsensor.expertcollect.util.DataUtil;
import com.expert.wsensor.expertcollect.util.SensorSharedUtil;
import com.inuker.bluetooth.library.Code;
import com.inuker.bluetooth.library.Constants;
import com.inuker.bluetooth.library.connect.listener.BleConnectStatusListener;
import com.inuker.bluetooth.library.connect.options.BleConnectOptions;
import com.inuker.bluetooth.library.connect.response.BleNotifyResponse;
import com.inuker.bluetooth.library.search.SearchRequest;
import com.inuker.bluetooth.library.search.SearchResult;
import com.inuker.bluetooth.library.search.response.SearchResponse;

import java.util.UUID;

/**
 * @author SF-lpp nb
 */
public class ClientManager {
	private static ExpertBluetoothClient mClient;
	private static ClientManager clientManager;
	private Context mContext;
	private BleConnectInf connectInf;
	private BleNotifyResponse notifyResponse;
	private ClientManagerUtil clientManagerUtil;
	/**
	 * 异常断开重连配置
	 */
	private ReconnectEntity reconnectEntity;
	/**
	 * 传感器连接状态监听
	 */
	private BleConnectStatusListener mBleConnectStatusListener;
	/**
	 * ble传感器特性写入指令的指令头
	 */
	private String characteristicAddress;
	/**
	 * 当前连接的传感器mac地址
	 */
	private String _macAddress;
	/**
	 * 是否是连接状态
	 */
	private boolean isConnected = false;
	/**
	 * 是否异常断开
	 */
	private boolean isUnusualConnected = true;
	/**
	 * 连接后工作状态接收倒计时
	 */
	private CountDownTimer notifyWorkCodeTimer = new CountDownTimer(15000, 1000) {
		@Override
		public void onTick(long millisUntilFinished) {
			//剩余5秒时主动获取工作状态-前10秒获取到工作状态的时候timer已经被关闭。
			if (millisUntilFinished / 1000 == 5) {
				if (isConnected(mContext)) {
					getClient(mContext).write(_macAddress, ConstantCollect.CONSTANT_service_uuid,
							ConstantCollect.CONSTANT_write_gatt_uuid, DataUtil.str2Byte
									(ConstantCollect.CONSTANT_GET_WORKCODE), code -> {
							});
				}
			}
		}
		
		@Override
		public void onFinish() {
			if (TextUtils.isEmpty(characteristicAddress)) {
				disconnectBle(mContext, _macAddress);
				if (connectInf != null) {
					connectInf.connectBleResponse(Code.REQUEST_FAILED, "");
				}
			}
		}
	};
	
	private SearchResponse searchResponse = new SearchResponse() {
		@Override
		public void onSearchStarted() {
		}
		
		@Override
		public void onDeviceFounded(SearchResult searchResult) {
			if (searchResult.getAddress().equals(_macAddress)) {
				//搜索到指定mac ble时，停止搜索
				getClient(mContext).stopSearch();
				characteristicAddress = "";
				getClient(mContext).connect(_macAddress, getClientManagerUtil().getBleConnOption()
						, (code, data) -> {
							if (code == Code.REQUEST_SUCCESS) {
								unNotifyData(_macAddress);
								//连接上传感器之后启动一个15秒的延时,如果十秒后没收到处于工作状态的指令就当做未连接成功处理，断开连接并且启用失败的回调方法
								notifyWorkCodeTimer.start();
								//清理通知队列
								getClient(mContext).clearRequest(_macAddress, Constants.REQUEST_NOTIFY);
								getClient(mContext).notify(_macAddress, ConstantCollect.CONSTANT_service_uuid,
										ConstantCollect.CONSTANT_read_gatt_uuid, getNotifyResponse
												());
							} else {
								if (connectInf != null) {
									connectInf.connectBleResponse(code, "");
								}
								notifyWorkCodeTimer.cancel();
							}
						});
			}
		}
		
		@Override
		public void onSearchStopped() {
			connectInf.connectBleResponse(Code.REQUEST_FAILED, "");
			notifyWorkCodeTimer.cancel();
		}
		
		@Override
		public void onSearchCanceled() {
		}
	};
	
	/**
	 * 获取传感器client 管理类
	 */
	public static ClientManager getClientManager() {
		if (clientManager == null) {
			synchronized ((ClientManager.class)) {
				if (clientManager == null) {
					clientManager = new ClientManager();
				}
			}
		}
		return clientManager;
	}
	
	/**
	 * 获取传感器Client
	 */
	public static ExpertBluetoothClient getClient(Context context) {
		if (mClient == null) {
			synchronized (ClientManager.class) {
				if (mClient == null) {
					mClient = new ExpertBluetoothClient(context);
				}
			}
		}
		return mClient;
	}
	
	
	/**
	 * 连接传感器
	 * notify建立的过程是异步的,当注册notify成功后会执行onResponse(),回调是在主线程
	 */
	public void connectBle(final Context context, final String macAddress, final BleConnectInf
			inf) {
		connectBle(context, macAddress, inf, null);
	}
	
	public void connectBle(final Context context, final String macAddress, final BleConnectInf
			inf, ReconnectEntity entity) {
		_macAddress = macAddress;
		mContext = context;
		connectInf = inf;
		reconnectEntity = entity;
		getClient(mContext).disconnect(_macAddress);
		if (entity != null) {
			//不用担心会重复注册，看源码就知道（\\\0.0///）
			getClient(mContext).registerConnectStatusListener(macAddress, getConnectListener());
			getClient(mContext).search(getClientManagerUtil().getBleUnNormalSearchOption
					(reconnectEntity), searchResponse);
		} else {
			getClient(mContext).search(getClientManagerUtil().getBleNormalSearchOption(),
					searchResponse);
		}
	}
	
	/**
	 * 数据接收回调-在这里作为接收传感器工作状态使用
	 */
	public BleNotifyResponse getNotifyResponse() {
		if (notifyResponse == null) {
			notifyResponse = new BleNotifyResponse() {
				@Override
				public void onNotify(UUID service, UUID character, byte[] value) {
					if (value.length > 3 && value[2] == 0x55) {
						characteristicAddress = String.format("%02X", value[0]);
						//保存传感器信息
						getClientManagerUtil().saveBleInfo(mContext,value,_macAddress);
						String electric = getClientManagerUtil().getElectricWhenConnect(value);
						connectInf.connectBleResponse(Code.REQUEST_SUCCESS, electric);
						notifyWorkCodeTimer.cancel();
						isConnected = true;
//						//恢复断开连接时的初始状态-默认监听到断开时是异常断开
						isUnusualConnected = true;
						unNotifyData(_macAddress);
					}
				}
				
				@Override
				public void onResponse(int code) {
				}
			};
		}
		return notifyResponse;
		
	}
	
	/**
	 * 连接状态监听回调
	 */
	private BleConnectStatusListener getConnectListener() {
		if (mBleConnectStatusListener == null) {
			synchronized (ClientManager.class) {
				if (mBleConnectStatusListener == null) {
					mBleConnectStatusListener = new BleConnectStatusListener() {
						@Override
						public void onConnectStatusChanged(String s, int i) {
							if (i == Constants.STATUS_CONNECTED) {
								//监听到连接了指定mac传感器连接成功
							} else if (i == Constants.STATUS_DISCONNECTED) {
								//监听到断开了指定mac传感器的连接
								if (isConnected) {
									//之前是否是连接成功的状态-默认false
									// 因为监听到的连接成功不是我们需要的，我们收到准备好指令才算成功。
									if (isUnusualConnected) {
										//是否是异常断开-默认为true
										connectBle(mContext, _macAddress, connectInf,
												reconnectEntity);
									}
								}
								isConnected = false;
							}
						}
					};
				}
			}
		}
		return mBleConnectStatusListener;
	}
	
	/**
	 * 断开传感器
	 */
	public void disconnectBle(Context context, String macAddress) {
		isUnusualConnected = false;
		getClient(context).disconnect(macAddress);
	}
	
	
	/**
	 * 传感器是否处于连接状态
	 */
	public boolean isConnected(Context context) {
		int connStatues = getClient(context).getConnectStatus(_macAddress);
		return connStatues == Constants.STATUS_DEVICE_CONNECTED;
	}
	
	
	private void unNotifyData(String macAddress) {
		getClient(mContext).unnotify(macAddress, ConstantCollect.CONSTANT_service_uuid,
				ConstantCollect.CONSTANT_read_gatt_uuid, code1 -> {
				});
	}
	
	/**
	 * 绑定传感器
	 */
	public void bindSensor(Context context, String sensorMac) {
		SensorSharedUtil.saveData(context, SensorSharedUtil.DEVICE_SAVE_TAG, sensorMac);
	}
	
	/**
	 * 获取绑定的传感器mac
	 * bound
	 */
	public String getBindedSensor(Context context) {
		return (String) SensorSharedUtil.getData(context, SensorSharedUtil.DEVICE_SAVE_TAG, "");
		
	}
	
	/**
	 * 严重耦合 呵呵呵呵
	 * 想改的话建议使用dagger注入进来，不是不想改，是没时间。
	 */
	private ClientManagerUtil getClientManagerUtil() {
		if (null == clientManagerUtil) {
			clientManagerUtil = new ClientManagerUtil();
		}
		return clientManagerUtil;
	}
}
