/**
 * 全局数据
 */
const object = {
    user_id: null,
    username: null,
    userNFC: null,
    loginFlag: false,
    name: null,
    isNetConnetion: true,
};

export const UPDATE_DEVICE_INFO = 'updateDeviceInfo'
export const NET_CONNECT = 'netConnect'///网络已连接
export const NET_DISCONNECT = 'netDisconnect'///网络已断开

export default object;