import HttpApi from './HttpApi'
import moment from 'moment'
import DeviceStorage, { ALLOW_TIME } from '../util/DeviceStorage';
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
        for (let index = 0; index < timeList.length; index++) {
            const item = timeList[index];
            let bgt = moment().format('YYYY-MM-DD ') + item.begin;
            let edt = item.isCross === 0 ? moment().format('YYYY-MM-DD ') + item.end : moment().add(1, 'day').format('YYYY-MM-DD ') + item.end;
            if (time > bgt && time < edt) {
                flag = true;
                break;
            }
        }
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