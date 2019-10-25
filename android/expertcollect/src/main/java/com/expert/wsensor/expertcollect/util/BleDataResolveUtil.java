package com.expert.wsensor.expertcollect.util;


import com.expert.wsensor.expertcollect.BleDataResultGat;

public class BleDataResolveUtil {
    /**
     * 温度
     */
    public static String getTmpReasonable(byte[] num){
        return BleDataResultGat.getTmpReasonable(num);
    }
    /**
     * 速度
     */
    public static String getSpeedReasonable(byte[]  num){
        return BleDataResultGat.getSpeedReasonable(num);
    }
    
    /**
     * 加速度
     */
    public static String getAccReasonable(byte[]  num){
        return BleDataResultGat.getAccReasonable(num);
    }
    
    /**
     * 位移
     */
    public static String getDisReasonable(byte[]  num){
        return BleDataResultGat.getDisReasonable(num);
    }
    
    /**
     * 获取波形有效值数组
     */
    public static float[] getWaveVal(String collectionType,byte[] bytes){
        return BleDataResultGat.getWaveVal(collectionType,bytes);
    }
    
    /**
     * 获取波形有效值数组
     * @param collectionType
     * @param bytes
     * @return
     */
    public static float[] getWaveVal_EWG01P(String collectionType,byte[] bytes){
        return BleDataResultGat.getWaveVal_EWG01P(collectionType,bytes);
    }
    
    

}
