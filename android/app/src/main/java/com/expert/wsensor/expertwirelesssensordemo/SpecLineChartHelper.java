package com.expert.wsensor.expertwirelesssensordemo;

import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.util.Log;

import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.components.Description;
import com.github.mikephil.charting.components.Legend;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.components.YAxis;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineData;
import com.github.mikephil.charting.data.LineDataSet;
import com.github.mikephil.charting.formatter.IAxisValueFormatter;

import java.util.ArrayList;
import java.util.List;
import a.a.a.a;

public class SpecLineChartHelper {
        private LineChart mChart;
        protected Typeface mTfLight;
        private int collectFrequency;//频率
        private int collectPoint;//点数

        public String getUnit() {
            return unit;
        }

        String unit;

        public SpecLineChartHelper(LineChart lineChart) {
            this.mChart=lineChart;
        }
        public SpecLineChartHelper setCollectFrequency(int f){
            this.collectFrequency=f;
            return this;
        }

        public SpecLineChartHelper setCollectPoint(int p){
            this.collectPoint=p;
            return this;
        }

        public void initChartView(Context context, String unit){
            mTfLight = Typeface.createFromAsset(context.getAssets(), "OpenSans-Light.ttf");
            // no description text
            mChart.getDescription().setEnabled(false);
            // enable touch gestures
            mChart.setTouchEnabled(true);
            mChart.setTop(1);
            mChart.setDragDecelerationFrictionCoef(0.9f);
            setUnit(unit);
            // enable scaling and dragging
            mChart.setDragEnabled(true);
            mChart.setScaleEnabled(true);
            mChart.setScaleYEnabled(false); //是否可以缩放 仅y轴
            mChart.setDrawGridBackground(false);
            mChart.setHighlightPerDragEnabled(true);
            mChart.getAxisRight().setEnabled(false);
            // if disabled, scaling can be done on x- and y-axis separately
            mChart.setPinchZoom(true);
            // set an alternative background color
            mChart.setBackgroundColor(Color.parseColor("#ffffff"));

            setLegend();

        }

        public void setUnit(String unit){
            this.unit=unit;
            Description description=new Description();
            description.setText("X轴:Hz Y轴:"+unit);
            mChart.setDescription(description);
        }


        private void setLegend() {
            // get the legend (only possible after setting data)
            Legend l = mChart.getLegend();

            // modify the legend ...
            l.setForm(Legend.LegendForm.LINE);
            l.setTypeface(mTfLight);
            l.setTextSize(11f);
            l.setTextColor(Color.BLACK);
            l.setVerticalAlignment(Legend.LegendVerticalAlignment.BOTTOM);
            l.setHorizontalAlignment(Legend.LegendHorizontalAlignment.LEFT);
            l.setOrientation(Legend.LegendOrientation.HORIZONTAL);
            l.setDrawInside(false);
//        l.setYOffset(11f);
        }


        private void setAxis(String unit) {
            float _max=mChart.getYMax();
            float _min=mChart.getYMin();

            XAxis xAxis = mChart.getXAxis();
            xAxis.setTypeface(mTfLight);
            xAxis.setTextSize(10f);
            xAxis.setTextColor(Color.BLACK);
            xAxis.setDrawGridLines(false);
            xAxis.setDrawAxisLine(true);
            xAxis.setLabelCount(11, true);
            xAxis.setPosition(XAxis.XAxisPosition.BOTTOM);

            IAxisValueFormatter custom = new MyAxisValueFormatter(unit);
//            YAxis leftAxis = mChart.getAxisLeft();
//            leftAxis.setTypeface(mTfLight);
//            leftAxis.setTextColor(Color.BLACK);
//            leftAxis.setValueFormatter(custom);
//            leftAxis.setDrawGridLines(true);
//            leftAxis.setLabelCount(6,false);
//            leftAxis.setGranularityEnabled(true);
//            leftAxis.setDrawZeroLine(true);
//        leftAxis.setAxisMaximum((float) dMax);
//        leftAxis.setAxisMinimum((float) dMin);
        }

        public void showWave(float[] bytes){
            ArrayList<Entry> bVals=new ArrayList<>();
            int length = a.a(2048);
            float[] xF=new float[length];
            float interval=5120.0f/2048;
            StringBuilder vd= new StringBuilder();
            a.a(bytes, 2048, xF,0);
            for (int i=0;i<length;i++){
                bVals.add(new Entry(i*interval,xF[i]));
                vd.append(",").append(xF[i]);
            }
            Log.e("-----------------", vd.toString());
            showWave(bVals);
            setAxis(unit);
            mChart.animateX(1000);
        }

        public void showWave(List<Entry> entries) {
            LineDataSet set2;

//            if (mChart.getData() != null &&
//                    mChart.getData().getDataSetCount() > 0&&mChart.getData().getDataSetByIndex(0)!=null) {
//                set2 = (LineDataSet) mChart.getData().getDataSetByIndex(0);
//                set2.setValues(entries);
//                Log.e("aaaaaa","bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
//                mChart.getData().notifyDataChanged();
//                mChart.notifyDataSetChanged();
//            } else {
//                // create a dataset and give it a type
//                set2 = new LineDataSet(entries, " ");
//                set2.setAxisDependency(YAxis.AxisDependency.LEFT);
//                set2.setColor(Color.BLUE);
//                set2.setLineWidth(2f);
//                set2.setFillAlpha(65);
//                set2.setDrawCircles(false);
//                set2.setValueFormatter((value, entry, dataSetIndex, viewPortHandler) -> String.valueOf(value));
//                set2.setHighLightColor(Color.rgb(244, 117, 117));
//
//                // create a data object with the datasets
//                LineData data = new LineData(set2);
//                data.setValueTextColor(Color.BLACK);
//                data.setValueTextSize(9f);
//                // set data
//                mChart.setData(data);
//            }
        }
}

