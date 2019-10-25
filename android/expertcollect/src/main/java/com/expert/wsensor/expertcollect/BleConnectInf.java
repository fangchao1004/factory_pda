package com.expert.wsensor.expertcollect;

/**
 * @author SF-lpp nb
 */
public interface BleConnectInf {
    /**
     * 传感器连接回调
     * @param code 连接状态
     * @param elect 传感器电量(EWG01 EWG01P)
     */
    void connectBleResponse(int code, String elect);
}
