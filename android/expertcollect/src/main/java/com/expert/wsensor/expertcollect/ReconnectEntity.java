package com.expert.wsensor.expertcollect;

/**
 * @author SF-lpp nb
 */
public class ReconnectEntity {

    public ReconnectEntity(int duration, int times) {
        this.duration = duration;
        this.times = times;
    }

    /**
     * 重连时每次搜索时间
     */
    private int duration;
    /**
     * 重连时尝试搜索次数
     */
    private int times;
    
    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public int getTimes() {
        return times;
    }

    public void setTimes(int times) {
        this.times = times;
    }
}
