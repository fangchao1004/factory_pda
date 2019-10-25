package com.expert.wsensor.expertwirelesssensordemo.activity;

import android.app.Activity;
import android.app.Dialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.expert.wsensor.expertcollect.BleConnectInf;
import com.expert.wsensor.expertcollect.BleDataResultGat;
import com.expert.wsensor.expertcollect.ClientManager;
import com.expert.wsensor.expertcollect.CollectedCallBack;
import com.expert.wsensor.expertcollect.ConstantCollect;
import com.expert.wsensor.expertcollect.entity.SenSorOrder;
import com.expert.wsensor.expertcollect.entity.Sensor;
import com.expert.wsensor.expertcollect.entity.SensorData;
import com.expert.wsensor.expertcollect.util.BleDataResolveUtil;
import com.expert.wsensor.expertcollect.util.CollectionUtil;
import com.expert.wsensor.expertcollect.util.SensorSharedUtil;
import com.expert.wsensor.expertwirelesssensordemo.ChartHelper;
import com.expert.wsensor.expertwirelesssensordemo.DecUtil;
//import com.expert.wsensor.expertwirelesssensordemo.R;
import com.expert.wsensor.expertwirelesssensordemo.SpecLineChartHelper;
import com.expert.wsensor.expertwirelesssensordemo.view.UIHelper;
import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.highlight.Highlight;
import com.github.mikephil.charting.listener.OnChartValueSelectedListener;
import com.inuker.bluetooth.library.Code;
import com.inuker.bluetooth.library.Constants;
import com.inuker.bluetooth.library.connect.listener.BleConnectStatusListener;

import butterknife.Bind;
import butterknife.ButterKnife;
import butterknife.OnClick;

/**
 * @author SF-lpp nb
 */
public class CollectVibActivity extends Activity implements BleConnectInf, CollectedCallBack, OnChartValueSelectedListener {
	
//	@Bind(R.id.right_img)
//	ImageView rightImg;
//	@Bind(R.id.tv_ele)
//	TextView tvEle;
//	@Bind(R.id.cb_v_savewave)
//	CheckBox cbVSavewave;
//	@Bind(R.id.tv_acc)
//	TextView tvAcc;
//	@Bind(R.id.rl_acc)
//	RelativeLayout rlAcc;
//	@Bind(R.id.tv_speed)
//	TextView tvSpeed;
//	@Bind(R.id.rl_speed)
//	RelativeLayout rlSpeed;
//	@Bind(R.id.tv_dis)
//	TextView tvDis;
//	@Bind(R.id.rl_dis)
//	RelativeLayout rlDis;
//	@Bind(R.id.rl_vib_show_info)
//	LinearLayout rlVibShowInfo;
//	@Bind(R.id.bt_collectBtn)
//	Button btCollectBtn;
//	@Bind(R.id.lc_chart)
//	LineChart mChart;
//	@Bind(R.id.tv_index_value)
//	TextView tvIndexValue;
//	@Bind(R.id.tv_index_value_y)
//	TextView tvIndexValueY;
//	@Bind(R.id.lc_chart1)
//	LineChart mChart1;
//	@Bind(R.id.tv_index_value1)
//	TextView tvIndexValue1;
//	@Bind(R.id.tv_index_value_y1)
//	TextView tvIndexValueY1;
	
	Context mContext;
	private Dialog loadingDialog;
	ScreenStatueReceiver statueReceiver;
	CollectionUtil collectUtil;
	SenSorOrder senSorOrder;
	/**
	 * 采集类型标记
	 */
	private CollectTag collectTag;
	private Sensor sensor;

	@Override
	public void onValueSelected(Entry e, Highlight h) {
		float x= DecUtil.getDecimalOne(e.getX());
		float y=DecUtil.getDecimaltwo(e.getY());
//		tvIndexValue.setText("X轴坐标"+x+"ms");
//		tvIndexValueY.setText("Y轴坐标"+y+chartHelper.getUnit());
	}

	@Override
	public void onNothingSelected() {

	}

	private enum CollectTag {
		//加速度
		ACC,
		//速度
		SPEED,
		//位移
		DIS;
		
	}
	
	/**
	 * 绑定的sensor mac
	 */
	private String bleAddress;
	/**
	 * 是否正在采集
	 */
	private boolean isCollecting;
	private ChartHelper chartHelper;
	private SpecLineChartHelper chartHelper1;
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
//		setContentView(R.layout.activity_collect_vib);
//		ButterKnife.bind(this);
//		mContext = this;
//		registerScreenReceiver();
//		initData();
//		setView();
//		//监听传感器状态
//		ClientManager.getClient(this).registerConnectStatusListener(bleAddress,
//				mBleConnectStatusListener);
	}
	
	private void initData() {
//		bleAddress = ClientManager.getClientManager().getBindedSensor(mContext);
//		chartHelper=new ChartHelper(mChart);
//		chartHelper1=new SpecLineChartHelper(mChart1);
//		isCollecting = false;
//		collectTag = CollectTag.ACC;
//		collectUtil=new CollectionUtil(mContext,this);
	}
	
	private void setView() {
//		refreshRightImg(ClientManager.getClientManager().isConnected(mContext));
//		changeVibShow(new float[]{18, 16, 16}, new int[]{Color.GREEN, Color.GRAY, Color.GRAY});
//		cbVSavewave.setChecked(false);
//		chartHelper.initChartView(this,"m/s²");
//		chartHelper1.initChartView(this,"m/s²");
//		mChart.setOnChartValueSelectedListener(this);
//		mChart1.setOnChartValueSelectedListener(new OnChartValueSelectedListener() {
//			@Override
//			public void onValueSelected(Entry e, Highlight h) {
//				float x= DecUtil.getDecimalOne(e.getX());
//				float y=DecUtil.getDecimaltwo(e.getY());
//				tvIndexValue1.setText("X轴坐标"+x+"hz");
//				tvIndexValueY1.setText("Y轴坐标"+y+chartHelper1.getUnit());
//			}
//
//			@Override
//			public void onNothingSelected() {
//
//			}
//		});
	}
	
//	@OnClick({R.id.right_img, R.id.rl_acc, R.id.rl_speed, R.id.rl_dis,R.id.bt_collectBtn})
//	public void onViewClicked(View view) {
//		switch (view.getId()) {
//			case R.id.right_img:
//				clickSwitchConnect();
//				break;
//			case R.id.rl_acc:
//				collectTag = CollectTag.ACC;
//				changeVibShow(new float[]{18, 16, 16},
//						new int[]{Color.GREEN, Color.GRAY, Color.GRAY});
//				break;
//			case R.id.rl_speed:
//				collectTag = CollectTag.SPEED;
//				changeVibShow(new float[]{16, 18, 16},
//						new int[]{Color.GRAY, Color.GREEN, Color.GRAY});
//				break;
//			case R.id.rl_dis:
//				collectTag = CollectTag.DIS;
//				changeVibShow(new float[]{16, 16, 18},
//						new int[]{Color.GRAY, Color.GRAY, Color.GREEN});
//				break;
//			case R.id.bt_collectBtn:
//				if (filter()) {
//					return;
//				}
//				if (isCollecting) {
//					stopCollect();
//				} else {
//					collect();
//				}
//				break;
//			default:
//				break;
//		}
//	}
	
	
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
						CollectVibActivity.this);
				loadingDialog = UIHelper.showLoading(mContext, "连接中...");
			});
		}
		
	}
	
	/**
	 * 连接状态回调
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
	 * 采集结果
	 * @param sensorData
	 */
	@Override
	public void informData(SensorData sensorData) {
//		if (cbVSavewave.isChecked()){
//			SensorData.VibWaveData data=  sensorData.getVibWaveData();
//			showWaveResult(data);
//		}else {
//			SensorData.VibData data=  sensorData.getVibData();
//			showVibResult(data);
//		}
	}
	
	/**
	 * 采集异常
	 * @param msg
	 */
	@Override
	public void onCollectAbnormal(String msg) {
		Toast.makeText(mContext,msg,Toast.LENGTH_SHORT).show();
	}
	/**
	 * 展示单个特征值采集结果
	 */
	private void showVibResult(SensorData.VibData data) {
//		tvEle.setText(data.getEle());
//		if (collectTag==CollectTag.ACC){
//			tvAcc.setText(data.getAccValue());
//			tvSpeed.setText("0.0");
//			tvDis.setText("0");
//		}else if (collectTag==CollectTag.SPEED){
//			tvAcc.setText("0.0");
//			tvSpeed.setText(data.getSpeedValue());
//			tvDis.setText("0");
//		}else if (collectTag==CollectTag.DIS){
//			tvAcc.setText("0.0");
//			tvSpeed.setText("0.0");
//			tvDis.setText(data.getDisValue());
//		}
	}
	
	/**
	 * 展示波形采集结果
	 */
	private void showWaveResult(SensorData.VibWaveData data) {
//		tvEle.setText(String.valueOf(data.getEle()));
//
//		if (sensor.isEwg01p()){
//			//EWG01P传感器采集到的数据包含 三个特征值和波形
//			tvAcc.setText(String.valueOf(data.getAccValue()));
//			tvSpeed.setText(String.valueOf(data.getSpeedValue()));
//			tvDis.setText(String.valueOf(data.getDisValue()));
//		}else {
//			//EWG01传感器采集到的数据仅仅包含指定类型特征值和波形
//			if (collectTag==CollectTag.ACC){
//				tvAcc.setText(String.valueOf(data.getAccValue()));
//				tvSpeed.setText("0.0");
//				tvDis.setText("0");
//			}else if (collectTag==CollectTag.SPEED){
//				tvAcc.setText("0.0");
//				tvSpeed.setText(String.valueOf(data.getSpeedValue()));
//				tvDis.setText("0");
//			}else if (collectTag==CollectTag.DIS){
//				tvAcc.setText("0.0");
//				tvSpeed.setText("0.0");
//				tvDis.setText(String.valueOf(data.getDisValue()));
//			}
//		}
//		chartHelper.showWave(data.getWaveValue());
//		chartHelper1.showWave(data.getWaveValue());
	}
	
	/**
	 * 开始采集
	 * ConstantCollect.COLLECTION_FREQUENCY_5120   EWG01P EWG01 ZD710
	 * ConstantCollect.COLLECTION_FREQUENCY_12800  EWG01P
	 */
	private void collect() {
//		String collectionType=getCollectType();
//		sensor = Sensor.getCurrentSensor(this);
//		if (cbVSavewave.isChecked()){
//			senSorOrder =collectUtil.getWaveOrder(collectionType,ConstantCollect.COLLECTION_FREQUENCY_5120,
//					ConstantCollect.COLLECTION_POINT_2048, sensor.getSensorType());
//		}else {
//			senSorOrder =collectUtil.getVibOrder(sensor.getSensorType(),collectionType,ConstantCollect.COLLECTION_FREQUENCY_5120);
//		}
//
//		isCollecting = true;
//		setViewClickable(false);
//		collectUtil.startCheck(sensor,senSorOrder);
//		btCollectBtn.setText("停止");
	}
	
	//停止采集
	private void stopCollect() {
//		if (isCollecting&&cbVSavewave.isChecked()){
//			Dialog stopLoadingDialog=UIHelper.showLoading(this,"正在停止采集...");
//			new Handler().postDelayed(() -> {
//				if (stopLoadingDialog !=null&& stopLoadingDialog.isShowing()) {
//					stopLoadingDialog.dismiss();
//				}
//			},2000);
//		}
//		isCollecting = false;
//		collectUtil.stopCheckout();
//		btCollectBtn.setText("采集");
//		setViewClickable(true);
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
	
	/**
	 * 获取采集类型
	 * @return
	 */
	public String getCollectType() {
		String collectionType;
		if (collectTag == CollectTag.ACC) {
			//加速度
			collectionType=ConstantCollect.COLLECTION_TYPE_ACCELERATION;
		} else if (collectTag == CollectTag.SPEED) {
			//速度
			collectionType=ConstantCollect.COLLECTION_TYPE_SPEED;
		} else {
			//位移
			collectionType=ConstantCollect.COLLECTION_TYPE_DISPLACEMENT;
		}
		
		return collectionType;
	}
	
	/**
	 * 刷新图标显示
	 */
	private void refreshRightImg(boolean isConn) {
//		if (isConn) {
//			rightImg.setBackgroundResource(R.mipmap.ble_conned);
//		} else {
//			rightImg.setBackgroundResource(R.mipmap.ble_disconn);
//		}
	}
	
	
	private void changeVibShow(float[] size, int[] color) {
//		tvAcc.setTextSize(size[0]);
//		tvAcc.setTextColor(color[0]);
//		tvSpeed.setTextSize(size[1]);
//		tvSpeed.setTextColor(color[1]);
//		tvDis.setTextSize(size[2]);
//		tvDis.setTextColor(color[2]);
	}
	
	@Override
	protected void onDestroy() {
		super.onDestroy();
		if (isCollecting){
			collectUtil.stopCheckout();
		}
		if (!TextUtils.isEmpty(bleAddress)) {
			ClientManager.getClient(this).unregisterConnectStatusListener(bleAddress, mBleConnectStatusListener);
		}
		unregisterReceiver(statueReceiver);
	}
	
	/**
	 * 注册屏幕监听
	 */
	private void registerScreenReceiver() {
		statueReceiver = new ScreenStatueReceiver();
		IntentFilter filter = new IntentFilter();
		filter.addAction(Intent.ACTION_SCREEN_ON);
		filter.addAction(Intent.ACTION_SCREEN_OFF);
		registerReceiver(statueReceiver, filter);
	}
	
	private void setViewClickable(boolean clickable){
//		rlAcc.setClickable(clickable);
//		rlSpeed.setClickable(clickable);
//		rlDis.setClickable(clickable);
//		cbVSavewave.setClickable(clickable);
	}
	
	/**
	 * 屏幕状态监听--息屏后停止采集
	 */
	public class ScreenStatueReceiver extends BroadcastReceiver {
		String SCREEN_OFF = "android.intent.action.SCREEN_OFF";
		String SCREEN_ON = "android.intent.action.SCREEN_ON";
		
		@Override
		public void onReceive(Context context, Intent intent) {
			if (SCREEN_OFF.equals(intent.getAction())) {
				stopCollect();
			} else if (SCREEN_ON.equals(intent.getAction())) {
				setViewClickable(true);
			}
		}
	}
}
