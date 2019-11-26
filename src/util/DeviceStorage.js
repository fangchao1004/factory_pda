import React from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export const USER_CARD = 'UserCard'
export const USER_INFO = 'UserInfo'
export const NFC_INFO = 'NfcInfo'
export const AREA_INFO = 'AreaInfo' /// 初期表示 第三级区域
export const AREA1_INFO = 'Area1Info' /// 初期表示 第一级区域
export const AREA12_INFO = 'Area12Info'/// 一二 两级区域数据
export const AREA123_INFO = 'Area123Info'/// 全部三级区域
export const DEVICE_INFO = 'DeviceInfo'
export const SAMPLE_INFO = 'SampleInfo'
export const MAJOR_INFO = 'MajorInfo'
export const LOCAL_BUGS = 'LocalBugs'
export const LOCAL_RECORDS = 'LocalRecords'
export const LAST_DEVICES_INFO = 'LastDevicesInfo' ////所有设备最近的一次全面信息(包含了每个设备最近一次的record)
export const BUG_LEVEL_INFO = 'BugLevelInfo' ////缺陷等级数据

class DeviceStorage {
    /**
     * 获取
     * @param key
     * @returns {Promise<T>|*|Promise.<TResult>}
     */
    static get(key) {
        return AsyncStorage.getItem(key).then((value) => {
            const jsonValue = JSON.parse(value);
            return jsonValue;
        });
    }


    /**
     * 保存
     * @param key
     * @param value
     * @returns {*}
     */
    static save(key, value) {
        return AsyncStorage.setItem(key, JSON.stringify(value));
    }


    /**
     * 更新
     * @param key
     * @param value
     * @returns {Promise<T>|Promise.<TResult>}
     */
    static update(key, value) {
        return DeviceStorage.get(key).then((item) => {
            value = typeof value === 'string' ? value : Object.assign({}, item, value);
            return AsyncStorage.setItem(key, JSON.stringify(value));
        });
    }


    /**
     * 删除
     * @param key
     * @returns {*}
     */
    static delete(key) {
        return AsyncStorage.removeItem(key);
    }
}

export default DeviceStorage;