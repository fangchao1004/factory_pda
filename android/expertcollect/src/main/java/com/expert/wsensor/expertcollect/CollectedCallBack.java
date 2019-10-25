package com.expert.wsensor.expertcollect;

import com.expert.wsensor.expertcollect.entity.SensorData;

/**
 * @author SF-lpp nb
 */
public interface CollectedCallBack {
    void informData(SensorData result);
    void onCollectAbnormal(String msg);//返回采集数据异常
}
