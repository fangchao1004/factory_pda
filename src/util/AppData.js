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
    isAllowTime: true,/// 当前是否为允许巡检的时间
    checkedAt: null,/// 当前贴卡弹出ReportView1的时间戳 ‘YYYY-MM-DD HH:mm:ss’
};

export const UPDATE_DEVICE_INFO = 'updateDeviceInfo'
export const NET_CONNECT = 'netConnect'///网络已连接
export const NET_DISCONNECT = 'netDisconnect'///网络已断开

export default object;