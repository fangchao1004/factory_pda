package com.expert.wsensor.expertwirelesssensordemo.adapter;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

//import com.expert.wsensor.expertwirelesssensordemo.R;

import java.util.ArrayList;

/**
 * <pre>
 *     author : dell
 *     time   : 2018/1/4
 *     desc   :
 *     version: 1.0
 * </pre>
 */
public class BleDeviceListAdapter extends BaseAdapter {
    private LayoutInflater mInflater;
    private ArrayList<BluetoothDevice> mLeDevices;
    private ArrayList<Integer> RSSIs;
    private ArrayList<String> scanRecords;

    public BleDeviceListAdapter(Context context) {
        mLeDevices = new ArrayList<BluetoothDevice>();
        RSSIs = new ArrayList<Integer>();
        scanRecords = new ArrayList<String>();
        this.mInflater = LayoutInflater.from(context);
    }

    public void addDevice(BluetoothDevice device, int RSSI, String scanRecord) {
        if (!mLeDevices.contains(device)) {
            this.mLeDevices.add(device);
            this.RSSIs.add(RSSI);
            this.scanRecords.add(scanRecord);
        } else {
            for (int i = 0; i < mLeDevices.size(); i++) {
                BluetoothDevice d = mLeDevices.get(i);
                if (device.getAddress().equals(d.getAddress())) {
                    RSSIs.set(i, RSSI);
                    scanRecords.set(i, scanRecord);
                }
            }
        }
    }

    public BluetoothDevice getDevice(int position) {
        // TODO Auto-generated method stub
        return mLeDevices.get(position);
    }

    @Override
    public int getCount() {
        // TODO Auto-generated method stub
        return mLeDevices.size();
    }

    @Override
    public Object getItem(int arg0) {
        // TODO Auto-generated method stub
        return mLeDevices.get(arg0);
    }

    @Override
    public long getItemId(int arg0) {
        // TODO Auto-generated method stub
        return 0;
    }

    @SuppressLint("InflateParams")
    @Override
    public View getView(int position, View view, ViewGroup arg2) {
        // TODO Auto-generated method stub

        ViewHolder viewholder;
        if (view == null) {
//            view = mInflater.inflate(R.layout.item_devicelist, null);
//            viewholder = new ViewHolder();
//            viewholder.deviceName = view
//                    .findViewById(R.id.tv_devicelist_name);
//            viewholder.deviceAddress = view
//                    .findViewById(R.id.tv_devicelist_address);
//            viewholder.deviceRSSI = view
//                    .findViewById(R.id.tv_devicelist_rssi);
//            view.setTag(viewholder);
        } else {
            viewholder = (ViewHolder) view.getTag();
        }
        String name = mLeDevices.get(position).getName();
        if (name != null) {
//            viewholder.deviceName.setText(name);
        } else {
//            viewholder.deviceName.setText("Unknow Device");
        }
//        viewholder.deviceAddress.setText("地址： " + mLeDevices.get(position).getAddress());
//        viewholder.deviceRSSI.setText("信号： " + RSSIs.get(position).toString());
        return view;
    }

    static class ViewHolder {
        TextView deviceName;
        TextView deviceAddress;
        TextView deviceRSSI;
    }

    public void clear() {
        // TODO Auto-generated method stub
        mLeDevices.clear();
        RSSIs.clear();
        scanRecords.clear();
        this.notifyDataSetChanged();
    }

}
