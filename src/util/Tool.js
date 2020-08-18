import HttpApi from './HttpApi'
import moment from 'moment'
import DeviceStorage, { ALLOW_TIME, AREA123_INFO, DEVICE_INFO } from '../util/DeviceStorage';
import AppData from './AppData';

/**
 *省略文本长度
 * @param {*} text
 * @param {*} targetlength
 * @returns
 */
export function omitTextLength(text, targetlength) {
    let result = ''
    if (text.length > targetlength) {
        result = text.substring(0, targetlength) + '...'
    } else {
        result = text
    }
    return result
}

export async function checkTimeAllow() {
    return new Promise(async (resolve, reject) => {
        let flag = false;
        let time = moment().format('YYYY-MM-DD HH:mm:ss');
        let result = await DeviceStorage.get(ALLOW_TIME);///从本地缓存中获取允许上传的时间段数据
        let timeList = result.allowTimeInfo;
        if (timeList[timeList.length - 1].isCross === 1) {
            let newCell = { ...timeList[timeList.length - 1], isCross: -1 };
            timeList.unshift(newCell);
        }
        // console.log('timeList:', timeList)
        for (let index = 0; index < timeList.length; index++) {
            const item = timeList[index];
            let bgt = item.isCross === -1 ? moment().add(-1, 'day').format('YYYY-MM-DD ') + item.begin : moment().format('YYYY-MM-DD ') + item.begin;
            let edt = item.isCross === 1 ? moment().add(1, 'day').format('YYYY-MM-DD ') + item.end : moment().format('YYYY-MM-DD ') + item.end;
            if (time > bgt && time < edt) {
                // console.log('符合的是')
                // console.log('bgt:', bgt)
                // console.log('edt:', edt)
                flag = true;///只要有一个时间段符合，就可以了
                break;
            }
        }
        // console.log('flag:', flag)
        resolve(flag)
    })
}


/**
 * 将数据库查询的 数据进行 二层结构转换
 * 
 * 12级
 */
export function transfromDataTo2level(area12result) {
    let tempObj = {};
    area12result.forEach((item) => {
        if (tempObj[item.area1_id]) { /// 如果它已经有了某个一级属性
            if (item.area2_id)
                tempObj[item.area1_id].children.push({ value: item.area1_name + '/' + item.area2_name, label: item.area2_name, key: item.area1_id + '/' + item.area2_id })
        } else {
            if (item.area2_id) { /// 有二级
                tempObj[item.area1_id] = {
                    label: item.area1_name,
                    value: item.area1_name + '',
                    key: item.area1_id + '',
                    children: [{ value: item.area1_name + '/' + item.area2_name, label: item.area2_name, key: item.area1_id + '/' + item.area2_id }]
                }
            } else { /// 没有二级
                tempObj[item.area1_id] = {
                    label: item.area1_name,
                    value: item.area1_name + '',
                    key: item.area1_id + '',
                    children: []
                };
            }
        }
    })
    let jsonList = [];
    for (let key in tempObj) {
        jsonList.push(tempObj[key]);
    }
    return jsonList;
}

/**
 * 根据当前时间段，查询对应的时间区间
 */
export function findDurtion(list) {
    let today = moment().format('YYYY-MM-DD ');
    let tomorrow = moment().add(1, 'day').format('YYYY-MM-DD ');
    let currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    // let currentTime = today + '23:41:00';///测试
    let result = null;
    let newList = list.map((item) => {
        if (!item.isCross) {
            item.begin = today + item.begin;
            item.end = today + item.end;
        } else {
            item.begin = today + item.begin;
            item.end = tomorrow + item.end;
        }
        return item;
    })
    for (var i = 0; i < newList.length; i++) {
        let item = newList[i];
        let nextItem = i === newList.length - 1 ? newList[newList.length - 1] : newList[i + 1];
        if (currentTime >= item.begin && currentTime <= item.end) {
            result = item;
            break;
        } else if (currentTime >= item.end && currentTime <= nextItem.begin) {
            result = nextItem;
            break;
        } else if (currentTime <= item.begin && i === 0) {
            result = item;
            break;
        }
    }
    return result;
}

export function filterDevicesByDateScheme(deviceList) {
    let todayDateNum = moment().toDate().getDate();///多少号
    let todayDayNum = moment().toDate().getDay() === 0 ? 7 : moment().toDate().getDay();///周几
    // console.log('todayDateNum:', todayDateNum, 'todayDayNum:', todayDayNum)
    let resultList = [];
    if (deviceList) {
        deviceList.forEach((item) => {
            if (item.date_value_list && item.sche_cyc_id && item.cycleDate_id) {
                if ((String(item.cycleDate_id) === "1" && item.date_value_list.split(',').indexOf(String(todayDayNum)) !== -1)
                    || (String(item.cycleDate_id) === "2" && item.date_value_list.split(',').indexOf(String(todayDateNum)) !== -1)) { ///当
                    resultList.push(item);
                }
            } else {
                resultList.push(item);
            }
        })
    }
    return resultList;
}

/**
 * 将设备信息和这个设备所属类的模版绑定上方案数据
 */
export function bindWithSchemeInfo(last_devices_info, sampleInfo) {
    for (let i = 0; i < last_devices_info.length; i++) {
        let item = last_devices_info[i];
        for (let j = 0; j < sampleInfo.length; j++) {
            let element = sampleInfo[j];
            if ((item.device_type_id === element.device_type_id) && element.scheme_data) {
                item.scheme_data = element.scheme_data;
                break;
            } else { item.scheme_data = null }
        }
    }
    return last_devices_info;
}
/**
 * 根据方案数据-过滤模版数据
 * sampleList:
 * [{key: "0", title_name: "标题3", type_id: "12", default_values: "", title_remark: ""}
 * {key: "4", title_name: "标题5", type_id: "12", default_values: "", title_remark: ""}]
 * 
 * schemeData:
 * [
 * {key_id:0,
 * scheme_info:[
 * {cyc_scheme_id: 13, atm_scheme_id: 6, date_title: "每月15,20号", cycleDate_id: 2, date_value: 15, allowTime_title: "13点到15点半",begin: "13:00:00",end: "15:30:00",isCross: 0,atm_type_name: "白班"},
 * {cyc_scheme_id: 13, atm_scheme_id: 6, date_title: "每月15,20号", cycleDate_id: 2, date_value: 20, allowTime_title: "13点到15点半",begin: "13:00:00",end: "15:30:00",isCross: 0,atm_type_name: "白班"}
 * ]},
 * {key_id: 4,
 * scheme_info:[
 * {cyc_scheme_id: 14, atm_scheme_id: null, date_title: "每个周六", cycleDate_id: 1, date_value: 6,allowTime_title: null,begin: null,end: null,isCross: null,atm_type_name: null}
 * ]}
 * ]
 * 
 */
export function filterSampleInfoBySchemeData(sampleList, schemeData) {
    console.log('原始sampleList:', sampleList)
    console.log('原始schemeData:', schemeData)
    let todayDateNum = moment().toDate().getDate();///多少号
    let todayDayNum = moment().toDate().getDay() === 0 ? 7 : moment().toDate().getDay();///周几
    let currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    let todayStr = moment().format('YYYY-MM-DD ');
    let tomorrowStr = moment().add('day', 1).format('YYYY-MM-DD ')
    let finaResult = [];
    if (!schemeData) {
        return sampleList
    }
    if (schemeData && sampleList) {
        ///循环遍历schemeData 先判断cyc_scheme_id日期方案，如果不为null,就继续判断周期是星期还是月，再根据date_value，判断今天（周几or多少号）再等不等于它的值。
        schemeData.forEach((item) => {
            let todayIsInDate = false;///今天是否在日期方案中有对应的值相等 -- 针对每一题
            let currentTimeIsInAtm = false;///当前时间是否在时间段方案的区间中 -- 针对每一题
            item.needRemove = true;///先默认所有题都需要移除。即 它所属的方案当前日期时刻都不满足
            ///先知道 每一项 它所对应的 cyc_scheme_id 和 atm_scheme_id 分别是什么 是否都存在
            const scheme_info = item.scheme_info;
            const cyc_scheme_id = scheme_info[0].cyc_scheme_id;
            const atm_scheme_id = scheme_info[0].atm_scheme_id;
            // console.log('key_id:', item.key_id)
            if (cyc_scheme_id && atm_scheme_id) {/// 某些日期+某些时间段
                scheme_info.forEach((cell) => {///对每一个日期与时间段方案的组合情况 如（a,b）*（1,2）=> {a,1},{a,2},{b,1},{b,2}
                    /// cell 代表某一种 天+时间段 的组合情况
                    if (cell.cycleDate_id === 1) {///星期
                        todayIsInDate = cell.date_value === todayDayNum
                    } else if (cell.cycleDate_id === 2) {///月
                        todayIsInDate = cell.date_value === todayDateNum
                    }
                    if (cell.isCross === 0) {///如果不跨天
                        if (currentTime > (todayStr + cell.begin) && currentTime < (todayStr + cell.end)) {
                            currentTimeIsInAtm = true;
                        }
                    } else {
                        if (currentTime > (todayStr + cell.begin) && currentTime < (tomorrowStr + cell.end)) {
                            currentTimeIsInAtm = true;
                        }
                    }
                    if (todayIsInDate && currentTimeIsInAtm) {///如果当前日期和时刻，有一种方案的组合情况满足那么这题就要存在，否则就要过滤
                        item.needRemove = false;///有对应的日期和时间段类 不需要移除了
                    }
                })
            } else if (!cyc_scheme_id && atm_scheme_id) {///每一天的某些时间段
                scheme_info.forEach((cell) => {
                    if (cell.isCross === 0) {///如果不跨天
                        if (currentTime > (todayStr + cell.begin) && currentTime < (todayStr + cell.end)) { currentTimeIsInAtm = true; }
                    } else {
                        if (currentTime > (todayStr + cell.begin) && currentTime < (tomorrowStr + cell.end)) { currentTimeIsInAtm = true; }
                    }
                    if (currentTimeIsInAtm) { item.needRemove = false; }
                })
            } else if (cyc_scheme_id && !atm_scheme_id) {///某些天所有时间段
                scheme_info.forEach((cell) => {
                    if (cell.cycleDate_id === 1) {///星期
                        todayIsInDate = cell.date_value === todayDayNum
                    } else if (cell.cycleDate_id === 2) {///月
                        todayIsInDate = cell.date_value === todayDateNum
                    }
                    if (todayIsInDate) { item.needRemove = false; }
                })
            }

        })
        // console.log('处理以后的schemeData:', schemeData)
        /// 到此已经知道 schemeData 哪些题需要移除。再把schemeData和sampleList根据key的值来对应上
        sampleList.forEach((sampleItem) => {
            schemeData.forEach((schemeItem) => {
                if (sampleItem.key === String(schemeItem.key_id)) {
                    sampleItem.needRemove = schemeItem.needRemove;
                }
            })
        })
        sampleList.forEach((item) => {
            if (!item.needRemove) {
                finaResult.push(item);
            }
        })
    }
    console.log('finaResult:', finaResult)
    return finaResult
}

/**
 * 数组，根据某些字段分组
 */
export function groupBy(array, f) {
    var groups = {};
    array.forEach(function (o) {
        var group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return Object.keys(groups).map(function (group) {
        return groups[group];
    });
}
export function pickUpMajorFromBugsAndPushNotice(bugList) {
    // console.log('bugList:', bugList)
    let tempList = bugList.map((item) => { return item.major_id })
    let distictMajorList = Array.from(new Set(tempList)) ///专业id去重复
    // console.log('distictMajorList:', distictMajorList)
    if (distictMajorList) { pushNoticeHandler(distictMajorList); }
}

export function pushNoticeHandler(major_id_list) {
    console.log('推送操作', major_id_list)
    ///根据 major_id_list 多个专业 找到这些专业都有什么人
    let sql = `select distinct user_id from user_map_major where mj_id in (${major_id_list.join(',')}) and effective = 1`
    HttpApi.obs({ sql }, (res) => {
        if (res.data.code === 0 && res.data.data.length > 0) {
            let useridList = res.data.data.map((item) => { return item.user_id })
            // console.log('useridList:', useridList)
            HttpApi.pushnotice({ user_id: useridList, title: '缺陷通知', text: '您有最新的相关缺陷,请注意查看' })
        }
    })
}

export function copyArrayItem(array, times = 1) {
    let temp = [];
    for (let index = 0; index < times; index++) {
        temp = [...temp, ...array]
    }
    return temp
}

export function logHandler(content = '', error = '') {
    let sql = `insert into bug_log (createdAt,content,error,name,version,area0_id) values ('${moment().format('YYYY-MM-DD HH:mm:ss')}','${content}','${error}','${AppData.name}','${AppData.record[0].version || '/'}',${AppData.area0_id})`
    HttpApi.obs({ sql }, (_) => { })
}

/**
 *将数据库查询的 数据进行 三层结构转换
 *123级
 * 三级的节点都可以被选择 (默认三级都可选)
 * 只有在添加 巡检点时 只能选择第三级
 * 在添加缺陷时，三级区域范围都可以被选择
 * @export
 * @param {*} area123result
 * @param {boolean} [all3=true]
 * @returns
 */
export function transfromDataTo3level(area123result, all3 = true) {
    let tempObj = {};
    area123result.forEach((item) => {
        if (tempObj[item.area2_id]) { /// 如果它已经有了某个二级属性
            if (item.area3_id)
                tempObj[item.area2_id].children.push({ area3_id: item.area3_id, value: item.area1_id + '-' + item.area2_id + '-' + item.area3_id, title: item.area3_name, key: item.area1_id + '-' + item.area2_id + '-' + item.area3_id })
        } else {
            if (item.area3_id) { /// 有三级
                tempObj[item.area2_id] = {
                    area2_id: item.area2_id,
                    title: item.area2_name,
                    value: item.area1_id + '-' + item.area2_id,
                    key: item.area1_id + '-' + item.area2_id,
                    selectable: all3,
                    children: [{ area3_id: item.area3_id, value: item.area1_id + '-' + item.area2_id + '-' + item.area3_id, title: item.area3_name, key: item.area1_id + '-' + item.area2_id + '-' + item.area3_id }]
                }
            }
            else if (!item.area3_id && item.area2_id) { /// 没有三级
                tempObj[item.area2_id] = {
                    area2_id: item.area2_id,
                    title: item.area2_name,
                    value: item.area1_id + '-' + item.area2_id,
                    key: item.area1_id + '-' + item.area2_id,
                    selectable: all3,
                    children: []
                };
            }
        }
    })
    let jsonList = [];
    for (let key in tempObj) {
        jsonList.push(tempObj[key]);
    }
    /// jsonList 到此步 二三级已经形成了 所需的数据结构 继续解析 一级区域数据
    let rootObj = {}
    area123result.forEach((item) => {
        rootObj[item.area1_id] = {
            area1_id: item.area1_id,
            order_key: item.order_key, ///新增order_key
            title: item.area1_name,
            value: item.area1_id + '',
            key: item.area1_id + '',
            selectable: all3,
            children: [],
        }
    })
    let rootList = [];
    for (let key in rootObj) {
        rootList.push(rootObj[key]);
    }
    rootList.forEach((area1item) => {
        jsonList.forEach((area2item) => {
            if (area1item.value === area2item.value.split('-')[0] + '') {
                area1item.children.push(area2item)
            }
        })
    })
    return rootList;
}

/**
 * 适用与1级及以下
 * @param {*} result 
 */
export function sortByOrderKey2(result) {
    let copyResult = JSON.parse(JSON.stringify(result))
    copyResult.sort((x, y) => {
        return x.order_key - y.order_key
    })
    return copyResult
}

/**
 * 将三级区间结构数+巡检点信息之间进行绑定
 * 形成了4级结构
 * 因为要统计每一层的status2_count 所以无法用递归算法
 * @export
 * @param {*} level3List
 * @param {*} devicesList
 * @returns
 */
export function combinAreaAndDevice(level3List, devicesList) {
    level3List.forEach((area1Item) => {
        area1Item.device_count = 0;
        area1Item.finish_count = 0;
        if (area1Item && area1Item.children.length > 0) {
            let area2ItemList = area1Item.children;
            area2ItemList.forEach((area2Item) => {
                area2Item.device_count = 0;
                area2Item.finish_count = 0;
                if (area2Item && area2Item.children.length > 0) {
                    let area3ItemList = area2Item.children;
                    area3ItemList.forEach((area3Item) => {
                        area3Item.children = []
                        area3Item.device_count = 0;
                        area3Item.finish_count = 0;
                        devicesList.forEach((deviceItem) => {
                            if (area3Item.area3_id === deviceItem.area_id) {
                                area3Item.device_count = area3Item.device_count + 1;
                                area2Item.device_count = area2Item.device_count + 1;
                                area1Item.device_count = area1Item.device_count + 1;
                                if (deviceItem.status !== 3) {
                                    area3Item.finish_count = area3Item.finish_count + 1;
                                    area2Item.finish_count = area2Item.finish_count + 1;
                                    area1Item.finish_count = area1Item.finish_count + 1;
                                }
                                area3Item.children.push(deviceItem)
                            }
                        })
                    })
                }
            })
        }
    }
    )
    return level3List
}
export function filterDeviceCount0(list) {
    let afterFilter = list.filter((item) => {
        return item.device_count > 0
    })
    return afterFilter
}
export async function getAreaWithDeviceTree() {
    let data = await DeviceStorage.get(AREA123_INFO);
    let deviceData = await DeviceStorage.get(DEVICE_INFO);
    let result1 = combinAreaAndDevice(data.area123Info, deviceData.deviceInfo);
    AppData.areaDeviceTree = result1;
}