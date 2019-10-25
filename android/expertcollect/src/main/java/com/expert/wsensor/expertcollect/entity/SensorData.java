package com.expert.wsensor.expertcollect.entity;

import android.text.SpannableString;

import com.expert.wsensor.expertcollect.ConstantCollect;

/**
 * @author SF-lpp nb
 */
public class SensorData {
	private TmpData tmpData;
	private RevData revData;
	private VibData vibData;
	private VibWaveData vibWaveData;
	
	public TmpData getTmpData() {
		return tmpData;
	}
	
	public void setTmpData(TmpData tmpData) {
		this.tmpData = tmpData;
	}
	
	public RevData getRevData() {
		return revData;
	}
	
	public void setRevData(RevData revData) {
		this.revData = revData;
	}
	
	public VibData getVibData() {
		return vibData;
	}
	
	public void setVibData(VibData vibData) {
		this.vibData = vibData;
	}
	
	public VibWaveData getVibWaveData() {
		return vibWaveData;
	}
	
	public void setVibWaveData(VibWaveData vibWaveData) {
		this.vibWaveData = vibWaveData;
	}
	
	public static class TmpData extends SensorData {
		String ele;
		String tmpValue;
		
		public String getEle() {
			return ele;
		}
		
		public void setEle(String ele) {
			this.ele = ele;
		}
		
		public String getTmpValue() {
			return tmpValue;
		}
		
		public void setTmpValue(String tmpValue) {
			this.tmpValue = tmpValue;
		}
	}
	
	public static class RevData extends SensorData {
		String ele;
		String revValue;
		
		public String getEle() {
			return ele;
		}
		
		public void setEle(String ele) {
			this.ele = ele;
		}
		
		public String getRevValue() {
			return revValue;
		}
		
		public void setRevValue(String revValue) {
			this.revValue = revValue;
		}
	}
	
	public static class VibData extends SensorData {
		String ele;
		String accValue;
		String speedValue;
		String disValue;
		
		public String getEle() {
			return ele;
		}
		
		public void setEle(String ele) {
			this.ele = ele;
		}
		
		public String getAccValue() {
			return accValue;
		}
		
		public void setAccValue(String accValue) {
			this.accValue = accValue;
		}
		
		public String getSpeedValue() {
			return speedValue;
		}
		
		public void setSpeedValue(String speedValue) {
			this.speedValue = speedValue;
		}
		
		public String getDisValue() {
			return disValue;
		}
		
		public void setDisValue(String disValue) {
			this.disValue = disValue;
		}
	}
	
	public static class VibWaveData extends SensorData {
		float ele;
		float accValue;
		float speedValue;
		float disValue;
		float[] waveValue;
		
		public float getEle() {
			return ele;
		}
		
		public void setEle(float ele) {
			this.ele = ele;
		}
		
		public float getAccValue() {
			return accValue;
		}
		
		public void setAccValue(float accValue) {
			this.accValue = accValue;
		}
		
		public float getSpeedValue() {
			return speedValue;
		}
		
		public void setSpeedValue(float speedValue) {
			this.speedValue = speedValue;
		}
		
		public float getDisValue() {
			return disValue;
		}
		
		public void setDisValue(float disValue) {
			this.disValue = disValue;
		}
		
		public float[] getWaveValue() {
			return waveValue;
		}
		
		public void setWaveValue(float[] waveValue) {
			this.waveValue = waveValue;
		}
	}
	
	
}
