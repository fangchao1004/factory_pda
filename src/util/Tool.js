import HttpApi from './HttpApi'
import moment from 'moment'
import AppData from './AppData'

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
    let flag = false;
    let time = moment().format('YYYY-MM-DD HH:mm:ss');
    let timeList = await getAllowTimeInfo();///从数据库获取允许上传的时间段数据
    for (let index = 0; index < timeList.length; index++) {
        const item = timeList[index];
        let bgt = moment().format('YYYY-MM-DD ') + item.begin;
        let edt = item.isCross === 0 ? moment().format('YYYY-MM-DD ') + item.end : moment().add(1, 'day').format('YYYY-MM-DD ') + item.end;
        if (time > bgt && time < edt) {
            flag = true;
            break;
        }
    }
    AppData.isAllowTime = flag;
}
function getAllowTimeInfo() {
    return new Promise((resolve, reject) => {
        let sql = `select * from allow_time where effective = 1`
        HttpApi.obs({ sql }, (res) => {
            let result = [];
            if (res.data.code === 0) {
                result = res.data.data
            }
            resolve(result);
        })
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