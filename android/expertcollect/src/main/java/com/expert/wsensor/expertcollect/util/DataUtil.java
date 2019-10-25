package com.expert.wsensor.expertcollect.util;

/**
 * @author SF lpp-nb
 */
public class DataUtil {
	public static final char[] HEX_VAR = "0123456789ABCDEF".toCharArray();
	
	/**
	 * byte数组转16进制字符串
	 * @param var0
	 * @return
	 */
	public static String bytesToHex(byte[] var0) {
		char[] var1 = new char[var0.length * 2];
		
		for(int var2 = 0; var2 < var0.length; ++var2) {
			int var3 = var0[var2] & 255;
			var1[var2 * 2] = HEX_VAR[var3 >>> 4];
			var1[var2 * 2 + 1] = HEX_VAR[var3 & 15];
		}
		
		return new String(var1);
	}
	
	public static byte[] str2Byte(String var0) {
		String[] var1 = new String[var0.length() / 2];
		byte[] var2 = new byte[var0.length() / 2];
		
		int var3;
		for(var3 = 0; var3 < var2.length; ++var3) {
			var1[var3] = var0.substring(2 * var3, 2 * var3 + 2);
		}
		
		for(var3 = 0; var3 < var2.length; ++var3) {
			var2[var3] = (byte)Integer.parseInt(var1[var3], 16);
		}
		
		return var2;
	}
	
	
	public static String byteToString(byte[] var0) {
		StringBuilder var1 = new StringBuilder();
		
		for(int var2 = 0; var2 < var0.length; ++var2) {
			var1.append(String.format("%02X", var0[var2]));
		}
		
		return var1.toString();
	}
	
}
