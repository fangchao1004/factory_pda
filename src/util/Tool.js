import HttpApi from './HttpApi'
import moment from 'moment'
import AppData from './AppData'

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
        let sql = `select * from allow_time`
        HttpApi.obs({ sql }, (res) => {
            let result = [];
            if (res.data.code === 0) {
                result = res.data.data
            }
            resolve(result);
        })
    })
}