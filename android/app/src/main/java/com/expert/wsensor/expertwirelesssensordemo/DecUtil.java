package com.expert.wsensor.expertwirelesssensordemo;

import java.text.DecimalFormat;

/**
 * <pre>
 *     author : dell
 *     time   : 2018/04/04
 *     desc   :
 *     version: 1.0
 * </pre>
 */
public class DecUtil {

    //小数点后4位
    public static float getDecimalFour(float f){
        DecimalFormat df = new DecimalFormat("#.0000");
        return Float.valueOf(df.format(f));
    }
    //小数点后2位
    public static float getDecimaltwo(float f){
        DecimalFormat df = new DecimalFormat("#.00");
        return Float.valueOf(df.format(f));
    }
    //小数点后2位
    public static float getDecimalOne(float f){
        DecimalFormat df = new DecimalFormat("#.0");
        return Float.valueOf(df.format(f));
    }

}
