/**
 * 全局数据
 */
export default object = {
    areaDeviceTree: [],///区域和设备形成的JSON树
    last_devices_info: [],
    is_all_time: 0,
    area0_id: null,
    mac_address: null,
    tool_addres: null,
    pda_name: null,
    user_id: null,
    username: null,
    userNFC: null,
    levelname: null,
    loginFlag: false,
    name: null,
    isNetConnetion: false,
    checkedAt: null,/// 当前贴卡弹出ReportView1的时间戳 ‘YYYY-MM-DD HH:mm:ss’
    record: [ /// 版本更新记录 描述 只起记录作用
        // { version: '0.0.1', des: '测试' },
        // { version: '0.1.0', des: '通用模块的增加-独立缺陷增加 remark 字段的初始化值' },
        // { version: '0.1.1', des: 'remark 调整' },
        // { version: '0.1.2', des: '独立缺陷区域支持二级选择' },
        // { version: '0.1.3', des: '副标题-数字输入框-图片选择器-添加' },
        // { version: '0.1.4', des: '解决reportView1中,虚拟键盘与FlatList冲突的问题' },
        // { version: '0.1.5', des: '添加缺陷等级，修复采集时崩溃的问题' },
        // { version: '0.1.6', des: '解决records中content包含deviceInfo的问题' },
        // { version: '0.1.7', des: '解决不能离线打卡的问题' },
        // { version: '0.1.8', des: '添加运行/停运切换的功能' },
        // { version: '0.1.9', des: '处理小红旗不显示的问题' },
        // { version: '0.2.0', des: 'test' },
        // { version: '0.2.1', des: '解决重复上传record的问题（页面卸载后网络状态监听器没有移除）' },
        // { version: '0.2.2', des: 'loginView1中恢复网络状态的监听功能' },
        // { version: '0.2.3', des: '根据时间段-筛选查询到所有待检设备' },
        // { version: '0.2.4', des: 'mac地址限定功能' },
        // { version: '0.2.5', des: 'mac地址数据库端限定功能' },
        // { version: '0.2.6', des: '时间段和设备的映射关系调整' },
        // { version: '0.2.7', des: '支持NFC替换功能' },
        // { version: '0.2.8', des: '再次尝试解决-record缓存重复上传的问题（每次上传一个record记录时，就将本地缓存中的对应record记录的isUploaded置成true）' },
        // { version: '0.2.9', des: '离线功能重新开发,可以渲染前一次的record中的bug_id，防止同一个缺陷多次上传' },
        // { version: '0.3.0', des: '修改返回退出应用的操作' },
        // { version: '0.3.1', des: '巡检表单中的项目和设备个体会根据对应的方案做过滤' },
        // { version: '0.3.1_test', des: '测试环境' },
        // { version: '0.3.2_test', des: '0.3.2测试版本,0.3.1测试版本的bug修复,同时设备区域会根据须检查的巡检点所属三级区域进行过滤' },
        // { version: '0.3.2', des: '0.3.2正式版本' },
        // { version: '0.3.2.1', des: '解决跨天打点问题' },
        // { version: '0.3.3_test', des: '设备区域颜色变动，添加登录日志功能' },
        // { version: '0.3.5', des: '支持缺陷上传时，app推送信息' },
        // { version: '0.3.5.1', des: '上传独立缺陷完成后，清空数据' },
        // { version: '0.3.6 test', des: '分区功能-自定义停运过滤功能' },
        // { version: '0.3.6.1 test', des: '修改离线打点时上传按钮的loading逻辑，处理多次点击可能出现的重复上传一个缺陷的问题' },
        // { version: '0.3.6.2 test', des: '卡片登录无法获取设备列表问题解决' },
        // { version: '0.3.6.3 test', des: '解决离线巡检时间差造成的缺陷记录重复覆盖的问题' },
        // { version: '0.3.6.4', des: '0.3.6.4 正式环境版' },
        // { version: '0.3.6.5', des: '0.3.6.5 正式环境版' },
        // { version: '0.3.6.6', des: '0.3.6.6 正式环境版' },
        // { version: '0.3.6.7', des: '0.3.6.7 正式环境版' },
        // { version: '0.3.6.8 test', des: '0.3.6.8 test 测试环境，支持缓存数据的文件存储' },
        // { version: '0.3.6.8', des: '0.3.6.8 正式环境，支持缓存数据的文件存储' },
        // { version: '0.3.6.9 test', des: '0.3.6.9 测试环境，巡检记录自动存储为文件' },
        // { version: '0.3.6.9', des: '0.3.6.9 正式环境，巡检记录自动存储为文件' },
        // { version: '0.3.7.0 test', des: '0.3.7.0 测试环境，设备重启后仍然能恢复上一刻的巡检进度' },
        // { version: '0.3.7.0', des: '0.3.7.0 正式环境，设备重启后仍然能恢复上一刻的巡检进度' },
        // { version: '0.3.7.1', des: '0.3.7.1 正式环境，添加操作日志' },
        // { version: '0.3.7.2', des: '0.3.7.2 正式环境，设备状态历史记录倒序排列' },
        { version: '0.3.8', des: '0.3.8 60服务正式环境，服务地址切换；支持动态配置' },
    ]
};

export const UPDATE_DEVICE_INFO = 'updateDeviceInfo'
export const NET_CONNECT = 'netConnect'///网络已连接
export const NET_DISCONNECT = 'netDisconnect'///网络已断开



export const TESTLIST = { "name": "张三", "age": "10岁" }