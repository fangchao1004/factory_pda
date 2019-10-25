package com.expert.wsensor.expertwirelesssensordemo.activity;

import android.app.Activity;
import android.app.Dialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.expert.wsensor.expertcollect.BleConnectInf;
import com.expert.wsensor.expertcollect.ClientManager;
import com.expert.wsensor.expertcollect.CollectedCallBack;
import com.expert.wsensor.expertcollect.ConstantCollect;
import com.expert.wsensor.expertcollect.OrderProvider;
import com.expert.wsensor.expertcollect.entity.SenSorOrder;
import com.expert.wsensor.expertcollect.entity.Sensor;
import com.expert.wsensor.expertcollect.entity.SensorData;
import com.expert.wsensor.expertcollect.util.CollectionUtil;
//import com.expert.wsensor.expertwirelesssensordemo.R;
import com.expert.wsensor.expertwirelesssensordemo.view.UIHelper;
import com.inuker.bluetooth.library.Code;
import com.inuker.bluetooth.library.Constants;
import com.inuker.bluetooth.library.connect.listener.BleConnectStatusListener;

import butterknife.Bind;
import butterknife.ButterKnife;
import butterknife.OnClick;

/**
 * @author SF-lpp nb
 */
public class CollectTmpRevActivity extends Activity implements CollectedCallBack, BleConnectInf {
//	@Bind(R.id.right_img)
//	ImageView rightImg;
//	@Bind(R.id.tv_ele)
//	TextView tvEle;
//	@Bind(R.id.tv_tmp)
//	TextView tvTmp;
//	@Bind(R.id.bt_collectTmp)
//	Button btCollectTmp;
//	@Bind(R.id.tv_rev)
//	TextView tvRev;
//	@Bind(R.id.bt_collectRev)
//	Button btCollectRev;
	
	CollectionUtil collectionUtil;
	ScreenStadeReceiver_Tmp stadeReceiver;
	private Dialog loadingDialog;
	private String bleAddress;
	private Context mContext;
	private boolean isCollecting;
	
	private enum CollectTag {
		//温度
		TMP,
		//转速
		REV,
	}
	private CollectTag collectTag;
	/**
	 * 连接状态变化监听
	 */
	private final BleConnectStatusListener mBleConnectStatusListener = new
			BleConnectStatusListener() {
				@Override
				public void onConnectStatusChanged(String s, int i) {
					if (i == Constants.STATUS_CONNECTED) {
						//监听到连接上了指定mac传感器
						refreshRightImg(true);
					} else if (i == Constants.STATUS_DISCONNECTED) {
						//监听到断开了指定mac传感器
						refreshRightImg(false);
						stopCollect();
					}
				}
			};
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
//		setContentView(R.layout.activity_collect_tmp_rev);
//		ButterKnife.bind(this);
//		mContext=this;
//		isCollecting=false;
//		bleAddress = ClientManager.getClientManager().getBindedSensor(mContext);
//		collectionUtil=new CollectionUtil(mContext,this);
//		refreshRightImg(ClientManager.getClientManager().isConnected(mContext));
//		registerScreenReceiver();
//		//监听传感器状态
//		ClientManager.getClient(this).registerConnectStatusListener(bleAddress,
//				mBleConnectStatusListener);
	}
	
	private void registerScreenReceiver() {
		stadeReceiver = new ScreenStadeReceiver_Tmp();
		IntentFilter filter = new IntentFilter();
		filter.addAction(Intent.ACTION_SCREEN_ON);
		filter.addAction(Intent.ACTION_SCREEN_OFF);
		registerReceiver(stadeReceiver, filter);
	}
	
//	@OnClick({R.id.right_img, R.id.bt_collectTmp, R.id.bt_collectRev})
	public void onViewClicked(View view) {
//		switch (view.getId()) {
//			case R.id.right_img:
//				clickSwitchConnect();
//				break;
//			case R.id.bt_collectTmp:
//				if (filter()) {
//					return;
//				}
//				if (isCollecting) {
//					stopCollect();
//				} else {
//					collectTmp();
//				}
//				break;
//			case R.id.bt_collectRev:
//				if (filter()) {
//					return;
//				}
//				if (isCollecting) {
//					stopCollect();
//				} else {
//					collectRev();
//				}
//				break;
//		}
	}
	
	/**
	 * 采集温度
	 */
	private void collectTmp() {
//		collectTag=CollectTag.TMP;
//		Sensor sensor = Sensor.getCurrentSensor(this);
//		//第二个参数为发射率，如果使用的是EWG01p传感器和设定发射率
//		SenSorOrder order= collectionUtil.getTmpOrder(sensor.getSensorType(), ConstantCollect.TMP_EMISSIVITY);
////		if (sensor.getSensorType().equals(ConstantCollect.SENSOR_TYPE_EWG01P)){
////			//发射率可设置为0~1之间的数值
////			SenSorOrder order= collectionUtil.getTmpOrder(sensor.getSensorType(), "0.01");
////		}
//		isCollecting=true;
//		collectionUtil.startCheck(sensor,order);
//		btCollectTmp.setText("停止");
	}
	
	/**
	 * 采集转速
	 */
	private void collectRev() {
		collectTag=CollectTag.REV;
		Sensor sensor = Sensor.getCurrentSensor(this);
		if (!sensor.isEwg01p()){
			Toast.makeText(mContext,"非EWG01P传感器,不具备测转速",Toast.LENGTH_SHORT).show();
			return;
		}
		//第二个参数为发射率，如果使用的是EWG01p传感器和设定发射率
		SenSorOrder order= collectionUtil.getRevOrder(sensor.getSensorType());
		isCollecting=true;
		collectionUtil.startCheck(sensor,order);
//		btCollectRev.setText("停止");
	}
	
	
	private boolean filter() {
		if (TextUtils.isEmpty(bleAddress)) {
			Toast.makeText(this, "未绑定传感器", Toast.LENGTH_SHORT).show();
			return true;
		}
		if (!ClientManager.getClientManager().isConnected(mContext)) {
			Toast.makeText(this, "未连接传感器", Toast.LENGTH_SHORT).show();
			return true;
		}
		return false;
	}
	
	
	//停止采集
	private void stopCollect() {
//		isCollecting = false;
//		collectionUtil.stopCheckout();
//		btCollectTmp.setText("采集");
//		btCollectRev.setText("采集");
	}
	
	/**
	 * 连接回调
	 * @param code 连接状态
	 * @param elect 传感器电量(EWG01 EWG01P)
	 */
	@Override
	public void connectBleResponse(int code, String elect) {
		loadingDialog.dismiss();
		if (code == Code.REQUEST_SUCCESS) {
			Toast.makeText(this, "连接成功", Toast.LENGTH_SHORT).show();
//			tvEle.setText(elect);
		} else if (code == Code.REQUEST_FAILED) {
			Toast.makeText(this, "连接失败", Toast.LENGTH_SHORT).show();
		}
	}
	
	/**
	 * 数据采集回调
	 * @param result
	 */
	@Override
	public void informData(SensorData result) {
		if (collectTag==CollectTag.TMP){
			SensorData.TmpData data=  result.getTmpData();
//			tvTmp.setText(data.getTmpValue());
//			tvEle.setText(data.getEle());
		}else if (collectTag==CollectTag.REV){
			SensorData.RevData data=  result.getRevData();
//			tvRev.setText(data.getRevValue());
//			tvEle.setText(data.getEle());
		}
	}
	
	/**
	 * 数据采集异常
	 * @param msg
	 */
	@Override
	public void onCollectAbnormal(String msg) {
		Toast.makeText(mContext,msg,Toast.LENGTH_SHORT).show();
	}
	
	/**
	 * 传感器连接/断开
	 */
	private void clickSwitchConnect() {
		if (TextUtils.isEmpty(bleAddress)) {
			Toast.makeText(this, "未绑定传感器", Toast.LENGTH_SHORT).show();
			return;
		}
		if (ClientManager.getClientManager().isConnected(mContext)) {
			//断开
			UIHelper.showConfirmDialog(this, "提示", "确定断开当前连接？", () ->
					ClientManager.getClientManager().disconnectBle(this, bleAddress));
		} else {
			//连接
			UIHelper.showConfirmDialog(this, "提示", "确定连接" + bleAddress, () -> {
				ClientManager.getClientManager().connectBle(mContext, bleAddress,
						CollectTmpRevActivity.this);
				loadingDialog = UIHelper.showLoading(mContext, "连接中...");
			});
		}
		
	}
	
	private void refreshRightImg(boolean isConn) {
//		if (isConn) {
//			rightImg.setBackgroundResource(R.mipmap.ble_conned);
//		} else {
//			rightImg.setBackgroundResource(R.mipmap.ble_disconn);
//		}
	}
	
	@Override
	protected void onDestroy() {
		super.onDestroy();
		unregisterReceiver(stadeReceiver);
		if (!TextUtils.isEmpty(bleAddress)) {
			ClientManager.getClient(this).unregisterConnectStatusListener(bleAddress, mBleConnectStatusListener);
		}
		
	}
	
	public class ScreenStadeReceiver_Tmp extends BroadcastReceiver {
		String SCREEN_OFF = "android.intent.action.SCREEN_OFF";
		String SCREEN_ON = "android.intent.action.SCREEN_ON";
		
		@Override
		public void onReceive(Context context, Intent intent) {
			if (SCREEN_OFF.equals(intent.getAction())) {
				stopCollect();
			}
		}
	}
}
