import Axios from 'axios';

/// old
// const Testuri2 = 'http://ixiaomu.cn:3008/'///小木服务器地址 3010测试环境 3008正式环境
// const Testuri = Testuri2;
// export const SERVER_URL = Testuri;

export const CONFIG_URL = 'http://ixiaomu.cn:3333/'///配置服务器
export const URL_OBJ = { MAIN_URL: '' }

class HttpApi {
    static getConfigURLTable() {
        let sql = `select * from url_address_table where id in (2) `
        return Axios.post(CONFIG_URL + 'obs', { sql })
    }
    /**
     * obs操作---慎用
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static obs(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'obs', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }

    /**
     * 通过账号密码登录
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static loginByUserInfo(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'loginByUserInfo', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 通过NFC登录
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static loginByNFC(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'loginByNFC', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 通过NFC获取设备信息
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getDeviceInfoByNFC(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'getDeviceInfoByNFC', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 通过设备的类型获取对应的模版
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getDeviceSampleByTypeId(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'find_sample', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 上传设备记录表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static upLoadDeviceRecord(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'insert_record', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }

    /**
     * 更新设备的状态 正常-故障-待检  等
     * @param {*} query 
     * @param {*} update 
     * @param {*} f1 
     * @param {*} f2 
     */
    static updateDeviceStatus(query, update, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'update_device', { query, update: update.$set }).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 获取用户表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getUserInfo(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'find_user', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 获取设备表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getDeviceInfo(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'find_device', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 获取设备类型表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getDeviceTypeInfo(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'find_device_type', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 获取区域表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getAreaInfo(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'find_area', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 获取NFC表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getNFCInfo(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'find_nfc', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 插入NFC表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static insertNFCInfo(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'insert_nfc', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 移除NFC表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static removeNFCInfo(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'remove_nfc', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 插入设备表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static insertDeviceInfo(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'insert_device', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 获取record记录表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getRecordInfo(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'find_record', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 获取Level表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getLevelInfo(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'find_level', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 报告其他故障，插入problems表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static uploadProblems(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'insert_problem', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }

    /**
     * 报告bugs，插入bugs表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static uploadBugs(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'insert_bug', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }

    /**
     * 查询bugs
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getBugs(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'find_bug', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }

    /**
     * 删除bugs
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static removeBugs(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'remove_bug', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }

    /**
     * 获取专工信息。
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getMajorInfo(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'find_major', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }

    static getBugLevel(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'find_bug_level', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }

    /**
     * 上传文件
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static uploadFile(params, f1, f2) {
        let config = {
            headers: { 'Content-Type': 'multipart/form-data;boundary=' + new Date().getTime() }
        }
        Axios.post(URL_OBJ.MAIN_URL + 'upload_file', params, config).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }

    static getSampleWithSchemeInfo(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'getSampleWithSchemeInfo', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }

    /**
     * app推送消息接口
     */
    static pushnotice(params, f1, f2) {
        Axios.post(URL_OBJ.MAIN_URL + 'push_notice', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }

    static ping(f1) {
        Axios.post(URL_OBJ.MAIN_URL + 'find_major', {})
            .then(function (res) {
                f1({ flag: true })
            })
            .catch(function (err) {
                f1({ flag: false, err })
            })
    }
}

export default HttpApi;