/**
 * 全局数据
 */
export default object = {
    mac_address: null,
    tool_addres: null,
    user_id: null,
    username: null,
    userNFC: null,
    levelname: null,
    loginFlag: false,
    name: null,
    isNetConnetion: false,
    checkedAt: null,/// 当前贴卡弹出ReportView1的时间戳 ‘YYYY-MM-DD HH:mm:ss’
    record: [ /// 版本更新记录 描述 只起记录作用
        // { version: '0.0.1', ver: '测试' },
        // { version: '0.1.0', ver: '通用模块的增加-独立缺陷增加 remark 字段的初始化值' },
        // { version: '0.1.1', ver: 'remark 调整' },
        // { version: '0.1.2', ver: '独立缺陷区域支持二级选择' },
        // { version: '0.1.3', ver: '副标题-数字输入框-图片选择器-添加' },
        // { version: '0.1.4', ver: '解决reportView1中,虚拟键盘与FlatList冲突的问题' },
        // { version: '0.1.5', ver: '添加缺陷等级，修复采集时崩溃的问题' },
        // { version: '0.1.6', ver: '解决records中content包含deviceInfo的问题' },
        // { version: '0.1.7', ver: '解决不能离线打卡的问题' },
        // { version: '0.1.8', ver: '添加运行/停运切换的功能' },
        // { version: '0.1.9', ver: '处理小红旗不显示的问题' },
        // { version: '0.2.0', ver: 'test' },
        // { version: '0.2.1', ver: '解决重复上传record的问题（页面卸载后网络状态监听器没有移除）' },
        // { version: '0.2.2', ver: 'loginView1中恢复网络状态的监听功能' },
        // { version: '0.2.3', ver: '根据时间段-筛选查询到所有待检设备' },
        // { version: '0.2.4', ver: 'mac地址限定功能' },
        // { version: '0.2.5', ver: 'mac地址数据库端限定功能' },
        // { version: '0.2.6', ver: '时间段和设备的映射关系调整' },
        // { version: '0.2.7', ver: '支持NFC替换功能' },
        { version: '0.2.8', ver: '再次尝试解决-record缓存重复上传的问题（每次上传一个record记录时，就将本地缓存中的对应record记录的isUploaded置成true）' },
    ]
};

export const UPDATE_DEVICE_INFO = 'updateDeviceInfo'
export const NET_CONNECT = 'netConnect'///网络已连接
export const NET_DISCONNECT = 'netDisconnect'///网络已断开