package com.expert.wsensor.expertwirelesssensordemo;

import com.github.mikephil.charting.components.AxisBase;
import com.github.mikephil.charting.formatter.IAxisValueFormatter;

import java.text.DecimalFormat;

/**
 * <pre>
 *     author : dell
 *     time   : 2018/04/4
 *     desc   :
 *     version: 1.0
 * </pre>
 */
public class MyAxisValueFormatter implements IAxisValueFormatter {
    private DecimalFormat mFormat;
    private String unit;
    private boolean useUnit=false;

    public MyAxisValueFormatter(String unit, boolean useUnit) {
        mFormat = new DecimalFormat("###,###,###,##0.00");
        this.unit=unit;
        this.useUnit=useUnit;
    }
    public MyAxisValueFormatter(String unit) {
        mFormat = new DecimalFormat("###,###,###,##0.00");
        this.unit=unit;
    }

    @Override
    public String getFormattedValue(float value, AxisBase axis) {
        if (useUnit){
            return mFormat.format(value)+unit;
        }
        return mFormat.format(value);
    }
}
