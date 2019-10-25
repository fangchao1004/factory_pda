package com.expert.wsensor.expertcollect;

import com.example.jardd.Gbd_war;

/**
 * @author SF-lpp nb
 */
public class BleDataResultGat {
    public static float wave_result;
    public static float[] value;
    
    /**
     * 数据采集回执解析电量
     * @param num
     * @return
     */
    public static int getEleWhenCollect(byte[]  num){
        return Integer.parseInt(String.format("%02X",num[10]),16);
    }
    
    /**
     * 连传感器连接回执解析电量
     * @param num
     * @return
     */
    public static int getEleWhenConnect(byte[]  num){
        return Integer.parseInt(String.format("%02X", num[12]), 16);
    }
    
    
    /**
     * 解析温度
     * @param num
     * @return
     */
    public static String getTmpReasonable(byte[] num){
        return Gbd_war.getTmpReasonable(num);
    }
    
    public static String getTmpReasonable_EWG01P(byte[] num){
        return Gbd_war.getTmpReasonable_EWG01P(num);
    }
    public static String getSpeedReasonable(byte[]  num){
        return Gbd_war.getSpeedReasonable(num);
    }
    public static String getAccReasonable(byte[]  num){
        return Gbd_war.getAccReasonable(num);
    }
    public static String getDisReasonable(byte[]  num){
        return Gbd_war.getDisReasonable(num);
    }
    public static String getDisRev(byte[]  num){
        return Gbd_war.getRev(num);
    }
    public static float[] getWaveVal(String collectionType,byte[] bytes){
        float[] f=Gbd_war.getWaveVal(collectionType,bytes);
        wave_result=Gbd_war.wave_result;
        return f;
    }
    
    public static float[] getWaveVal_EWG01P(String collectionType,byte[] bytes){
        float[] f=Gbd_war.getWaveVal_EWG01P(collectionType,bytes);
        value=Gbd_war.value;
        return f;
    }


}
