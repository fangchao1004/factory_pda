/**
 * 全局数据
 */
export default object = {
    user_id: null,
    username: null,
    userNFC: null,
    loginFlag: false,
    name: null,
    isNetConnetion: true,
    isAllowTime: true,/// 当前是否为允许巡检的时间
    checkedAt: null,/// 当前贴卡弹出ReportView1的时间戳 ‘YYYY-MM-DD HH:mm:ss’
    record: [ /// 版本更新记录 描述 只起记录作用
        // { version: '0.0.1', ver: '测试' },
        // { version: '0.1.0', ver: '通用模块的增加-独立缺陷增加 remark 字段的初始化值' },
        // { version: '0.1.1', ver: 'remark 调整' },
        { version: '0.1.2', ver: '独立缺陷区域支持二级选择' },
    ]
};

export const UPDATE_DEVICE_INFO = 'updateDeviceInfo'
export const NET_CONNECT = 'netConnect'///网络已连接
export const NET_DISCONNECT = 'netDisconnect'///网络已断开