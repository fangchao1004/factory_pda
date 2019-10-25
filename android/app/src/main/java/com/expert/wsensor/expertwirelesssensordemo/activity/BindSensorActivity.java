package com.expert.wsensor.expertwirelesssensordemo.activity;

import android.app.Activity;
import android.app.Dialog;
import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.support.v4.widget.SwipeRefreshLayout;
import android.text.TextUtils;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.expert.wsensor.expertcollect.BleConnectInf;
import com.expert.wsensor.expertcollect.ClientManager;
import com.expert.wsensor.expertcollect.ExpertBluetoothClient;
import com.expert.wsensor.expertcollect.entity.Sensor;
import com.expert.wsensor.expertcollect.util.DataUtil;
import com.expert.wsensor.expertcollect.util.SensorSharedUtil;
//import com.expert.wsensor.expertwirelesssensordemo.R;
import com.expert.wsensor.expertwirelesssensordemo.adapter.BleDeviceListAdapter;
import com.expert.wsensor.expertwirelesssensordemo.view.UIHelper;
import com.inuker.bluetooth.library.Code;
import com.inuker.bluetooth.library.search.SearchRequest;
import com.inuker.bluetooth.library.search.SearchResult;
import com.inuker.bluetooth.library.search.response.SearchResponse;

import butterknife.Bind;
import butterknife.ButterKnife;


/**
 * @author SF-lpp nb
 * 本界面展示如何搜索传感器并展示传感器列表
 * 起名为绑定传感器，其实只是使用偏好文件存储指定传感器的信息
 * 开发者可根据具体业务流程更改
 */
public class BindSensorActivity extends Activity {
	
//	@Bind(R.id.tv_consuming)
	TextView tvConsuming;
//	@Bind(R.id.tv_ele)
	TextView tvEle;
//	@Bind(R.id.tv_macAddress)
	TextView tvMacAddress;
//	@Bind(R.id.tb_empty)
	ProgressBar tbEmpty;
//	@Bind(R.id.lv_deviceList)
	ListView lvDeviceList;
//	@Bind(R.id.Sl_EWG_list)
	SwipeRefreshLayout SlEWGList;
	BleDeviceListAdapter mAdapter;
	ExpertBluetoothClient bleClient;
	Context mContext;
	/**
	 * 传感器搜索回调
	 */
	SearchResponse response=new SearchResponse() {
		@Override
		public void onSearchStarted() {
		
		}
		
		@Override
		public void onDeviceFounded(SearchResult device) {
			mAdapter.addDevice(device.device, device.rssi,
					DataUtil.bytesToHex(device.scanRecord));
			mAdapter.notifyDataSetChanged();
		}
		
		@Override
		public void onSearchStopped() {
		}
		
		@Override
		public void onSearchCanceled() {
		}
	};
	private Dialog loadingDialog;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
//		setContentView(R.layout.activity_bind_sensor);
//		ButterKnife.bind(this);
//		mContext=this;
//		bleClient=ClientManager.getClient(mContext);
//		checkBleSwitch();
//		setView();
	}
	
	@Override
	protected void onResume() {
		super.onResume();
		//搜索传感器
		bleClient.search(getBleSearchOption(), response);
	}
	
	private void setView() {
		//获取当前绑定的传感器mac
		
		String macAddress = ClientManager.getClientManager().getBindedSensor(mContext);;
		if (!TextUtils.isEmpty(macAddress)) {
			tvMacAddress.setText("当前："+macAddress);
		}
		lvDeviceList.setEmptyView(tbEmpty);
		//下拉刷新
		SlEWGList.setOnRefreshListener(() -> {
			mAdapter.clear();
			bleClient.search(getBleSearchOption(), response);
			SlEWGList.setRefreshing(false);
		});
		mAdapter = new BleDeviceListAdapter(mContext);
		lvDeviceList.setAdapter(mAdapter);
		OnClickViewItem();
	}
	
	private void OnClickViewItem() {
		lvDeviceList.setOnItemClickListener((parent, view, position, id) -> {
			//获取之前绑定的传感器mac,如果之前绑定的传感器处于连接状态则断开之前的传感器。
			String macAddress = ClientManager.getClientManager().getBindedSensor(mContext);
			if (!TextUtils.isEmpty(macAddress)&&
					ClientManager.getClientManager().isConnected(mContext)) {
				ClientManager.getClientManager().disconnectBle(mContext,macAddress);
			}
			//获取点击的item
			BluetoothDevice device = (BluetoothDevice) mAdapter.getItem(position);
			String _address = device.getAddress();
			//绑定传感器
			ClientManager.getClientManager().bindSensor(mContext,_address);
			tvMacAddress.setText("当前："+_address);
			Toast.makeText(mContext, "绑定成功" + _address, Toast.LENGTH_SHORT).show();
			connectSensor(_address);
		});
	}
	
	/**
	 * 连接传感器
	 */
	private void connectSensor(String macAddess) {
		 UIHelper.showConfirmDialog(mContext, "提示", "已绑定传感器，是否现在连接", () -> {
			loadingDialog=UIHelper.showLoading(mContext,"连接中");
			ClientManager.getClientManager().connectBle(mContext, macAddess, (code, elect) -> {
				loadingDialog.dismiss();
				loadingDialog.cancel();
				if (code == Code.REQUEST_SUCCESS) {
					Toast.makeText(mContext,"连接成功",Toast.LENGTH_SHORT).show();
					tvEle.setText(elect);
					Sensor sensor=Sensor.getCurrentSensor(mContext);
					String describe="传感器类型: "+sensor.getSensorType()+"\n"+
							"传感器版本号: "+sensor.getSoftCode()+"\n"+
							"传感器SN: "+ sensor.getSnCode();
					tvMacAddress.setText("当前："+macAddess+"\n"+describe);
				} else if (code == Code.REQUEST_FAILED) {
					Toast.makeText(mContext,"连接失败",Toast.LENGTH_SHORT).show();
				}
			});
		});
	}
	
	
	/**
	 * 扫描BLE设备2次，每次5s
	 * @return
	 */
	private SearchRequest getBleSearchOption() {
		return new SearchRequest.Builder()
				.searchBluetoothLeDevice(5000, 2)
				.build();
	}
	
	/**
	 * PAMS无需检测蓝牙权限只需检测蓝牙开关是否打开
	 */
	private void checkBleSwitch() {
		if (!bleClient.isBluetoothOpened()) {
			UIHelper.showConfirmDialog(mContext, "提示", "蓝牙开关未打开,请在设置->蓝牙 中打开", () -> {
				Intent intent = new Intent();
				intent.setAction(Settings.ACTION_BLUETOOTH_SETTINGS);
				intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
				startActivity(intent);
			});
		}
	}
	
	
}
