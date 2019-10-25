package com.expert.wsensor.expertcollect;


import com.example.jardd.allinone.a;

import java.util.UUID;



/**
 * @author SF-lpp nb
 */
public class ConstantCollect {
	/**
	 * 读写服务地址
	 */
	public static final UUID CONSTANT_service_uuid = a.a;
	public static final UUID CONSTANT_read_gatt_uuid = a.b;
	public static final UUID CONSTANT_write_gatt_uuid = a.c;
	/**
	 * 采样频率
	 */
	public static final String COLLECTION_FREQUENCY_5120 = a.e;
	public static final String COLLECTION_FREQUENCY_12800 = a.f;
	/**
	 * 采样点数
	 */
	public static final String COLLECTION_POINT_256 = a.g;
	public static final String COLLECTION_POINT_512 = a.h;
	public static final String COLLECTION_POINT_1024 = a.i;
	public static final String COLLECTION_POINT_2048 = a.j;
	/**
	 * 采样类型
	 * 温度
	 */
	public static final String COLLECTION_TYPE_TMP = a.k;
	/**
	 * 速度
	 */
	public static final String COLLECTION_TYPE_SPEED = a.l;
	/**
	 * 加速度
	 */
	public static final String COLLECTION_TYPE_ACCELERATION = a.m;
	/**
	 * 位移
	 */
	public static final String COLLECTION_TYPE_DISPLACEMENT = a.n;
	/**
	 * 转速 EWG01P 特有
	 */
	public static final String COLLECTION_TYPE_REV = a.o;
	/**
	 * 传感器类型
	 */
	public static final String SENSOR_TYPE_ZD710 = a.p;
	public static final String SENSOR_TYPE_EWG01 = a.q;
	public static final String SENSOR_TYPE_EWG01P = a.r;
	/**
	 * 主动获取工作状态指令
	 */
	public static final String CONSTANT_GET_WORKCODE = a.s;
	
	/**
	 * 默认温度发射率
	 */
	
	public static final String TMP_EMISSIVITY="0.95";
	
}
