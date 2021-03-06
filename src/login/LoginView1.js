import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, Alert, StatusBar, DeviceEventEmitter } from 'react-native'
import { Button, Provider, Toast } from '@ant-design/react-native';
import NfcManager from 'react-native-nfc-manager';
import HttpApi, { URL_OBJ } from '../util/HttpApi';
import DeviceStorage, { USER_CARD, LOCAL_BUGS, LOCAL_RECORDS, LAST_DEVICES_INFO, SAMPLE_INFO, DEVICE_INFO } from '../util/DeviceStorage'
import AppData, { NET_CONNECT, NET_DISCONNECT, TESTLIST } from '../util/AppData'
import { checkTimeAllow, bindWithSchemeInfo } from '../util/Tool'
import ToastExample from '../util/ToastExample'
import NetInfo from '@react-native-community/netinfo'
import moment from 'moment'

export default class LoginView1 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tag: {},
        }
    }
    componentDidMount() {
        this.startInit()
        // DeviceStorage.delete(LOCAL_BUGS);
        // DeviceStorage.delete(LOCAL_RECORDS);
        // DeviceStorage.delete(DEVICE_INFO);
    }
    componentWillUnmount() {
        console.log('loginView1 卸载');
        this.stopDetection();
        NetInfo.removeEventListener('connectionChange', this.netHandler)
    }
    startInit = async () => {
        await this.getInitConfig()
        this.checkNfcHandler();
        this.checkAccount();
        this.startMonitorNet();
    }
    getInitConfig = async () => {
        console.log('App 初始化')
        let res = await HttpApi.getConfigURLTable()
        if (res.data.code === 0) {
            URL_OBJ.MAIN_URL = res.data.data.filter((item) => { return item.id === 2 })[0].api_address
            console.log('URL_OBJ:', URL_OBJ.MAIN_URL)
        }
    }
    startMonitorNet = () => {
        NetInfo.isConnected.fetch().done((isConnected) => {
            // console.log("检测网络是否连接:", isConnected);////true
        });
        //    检测网络连接信息
        NetInfo.fetch().done((connectionInfo) => {
            // console.log('当前检测网络连接信息:', connectionInfo); ///此时 一般为wifi 或 4g
        });
        //    检测网络变化事件
        NetInfo.addEventListener('connectionChange', this.netHandler)
    }
    netHandler = (networkType) => {
        // console.log('检测网络变化事件:', networkType); ////{type: "wifi", effectiveType: "unknown"} 或 {type: "cellular", effectiveType: "4g"} 或 {type: "none", effectiveType: "unknown"}
        AppData.isNetConnetion = networkType.type !== 'none';
        // console.log("AppData.isNetConnetion:", AppData.isNetConnetion);
        if (AppData.isNetConnetion) {
            Toast.success('连接上网络', 0.5);
            DeviceEventEmitter.emit(NET_CONNECT);
        } else {
            Toast.fail('网络断开', 0.5);
            DeviceEventEmitter.emit(NET_DISCONNECT);
        }
    }
    render() {
        return (
            <Provider>
                <StatusBar
                    animated={true}
                    translucent={true}
                    hidden={false}
                    backgroundColor={'transparent'}
                />
                <View style={styles.main}>
                    <Image style={styles.logo} source={require('../../assets/home/logo.png')} />
                    <Text style={{ color: '#DDDDDD' }} >{"<设备刷卡登录>"}</Text>
                    {/* <Text>{JSON.stringify(this.state.tag)}</Text> */}
                    <Button
                        type='primary'
                        onPress={() => {
                            this.props.navigation.navigate('LoginView2')
                        }}>
                        账号密码登录
                    </Button>
                    <Text>{this.state.value}</Text>
                </View>
                <Text style={styles.ver}>{AppData.record[0].version}</Text>
                {/* <Button onPress={() => {
                    ToastExample.readFromTxt("测试", (res) => {
                        console.log('readFromTxt:', res)
                    })
                }}>read txt</Button>
                <Button onPress={() => {
                    ToastExample.pushDataToTxt("测试", JSON.stringify(TESTLIST), (res) => {
                        console.log('res:', res)
                    })
                }}>push to txt</Button>
                <Button onPress={() => {
                    ToastExample.deleteFile("测试", (res) => {
                        console.log('测试 deleteFile:', res)
                    })
                }}>deleteFile</Button> */}
            </Provider>
        );
    }
    checkAccount = () => {
        DeviceStorage.get(USER_CARD).then((value) => {
            // console.log('本机存储card信息：', value);
            // console.log("AppData存储的全局变量:", AppData);
            if (value) {
                this.setState({
                    tag: value
                })
                if (!AppData.loginFlag) {
                    this.LoginHandler(value);
                }
            }
        })
    }
    checkNfcHandler = () => {
        NfcManager.isSupported()
            .then(supported => {
                // ToastAndroid.show(supported ? "支持nfc" : "不支持nfc", ToastAndroid.SHORT);
                if (supported) {
                    // Toast.success('设备支持NFC',1)
                    this.startDetection();
                } else {
                    Toast.fail('设备不支持NFC', 1)
                }
            })
    }
    saveUserNFCInStorageHandler = (param) => {
        DeviceStorage.save(USER_CARD, { id: param.id });
    }
    /**
     * 贴卡操作，发现的NFC信息
     */
    onTagDiscovered = async (tag) => {
        // console.log('发现新的NFC : tag 数据', tag); ///nfc贴卡后的数据
        this.setState({
            tag: tag
        })
        ///如果是未登录的情况下。默认只检查员工NFC
        ///如果已经登录了，则只检查设备NFC
        if (!AppData.loginFlag) {
            this.LoginHandler(tag)
        } else {
            console.log('检查到贴卡（巡检）操作，已经登录，默认是设备的nfc');
            if (AppData.isNetConnetion) {///在线
                ////这里要先去后台查询，如果是设备的NFC,就跳转到报表界面。否则就提示用户该NFC号码，不是设备的NFC号码
                this.getDeviceInfoFromDB(tag.id)
            } else {///离线
                if (!AppData.is_all_time) {
                    let isAllowTime = await checkTimeAllow();
                    if (!isAllowTime) {
                        Toast.show('当前不是巡检时间，请在规定时间内进行巡检工作');
                        return;
                    }
                }
                this.getSomeInfoFromLocalStorage();
            }
        }
    }
    startDetection = () => {
        // console.log('支持nfc,开启功能入口');
        NfcManager.registerTagEvent(this.onTagDiscovered) ///注册该事件，相当于开启此功能入口
            .then(result => {
                // console.log('registerTagEvent OK', result)
            })
            .catch(error => {
                console.warn('registerTagEvent fail', error)
            })
    }
    stopDetection = () => {
        // ToastAndroid.show("关闭nfc功能入口", ToastAndroid.SHORT);
        NfcManager.unregisterTagEvent()///反注册该事件，相当于关闭此功能入口
            .then(result => {
                // console.log('unregisterTagEvent OK', result)
            })
            .catch(error => {
                console.warn('unregisterTagEvent fail', error)
            })
    }
    LoginHandler = (tag) => {
        ToastExample.getMac((macAddress) => {
            let sql = `select * from mac_address where address = '${macAddress}'`
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code == 0 && res.data.data.length > 0) {
                    AppData.mac_address = res.data.data[0].address;
                    AppData.tool_address = res.data.data[0].tool_address;
                    AppData.pda_name = res.data.data[0].des;
                    AppData.area0_id = res.data.data[0].area0_id;
                    AppData.is_all_time = res.data.data[0].is_all_time;
                    if (tag && tag.id) {
                        HttpApi.loginByNFC({ nfcid: tag.id, type: 1 }, (response) => {
                            if (response.status == 200) {
                                if (response.data.code == 0) {
                                    this.props.navigation.navigate('MainView') ///登录成功
                                    this.saveUserNFCInStorageHandler(tag)
                                    AppData.userNFC = tag.id;
                                    AppData.loginFlag = true;
                                    AppData.username = response.data.data.username;
                                    AppData.user_id = response.data.data.id;
                                    let sql = `INSERT INTO login_logs (mac_address,pad_login_type,pda_name,version,client_type,account,time) VALUES ('${AppData.mac_address}',1,'${AppData.pda_name}','${AppData.record[0].version}',1,'${AppData.name}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
                                    HttpApi.obs({ sql }) ///添加登录日志记录
                                } else {
                                    console.log('cardid不存在，不允许登录');
                                }
                            }
                        })
                    }
                } else {
                    Toast.info('当前设备未注册-请联系管理员进行注册');
                }
            })
        })
    }
    getDeviceInfoFromDB = async (NFCId) => {
        let NFCinfo = await this.getNFCInfo(NFCId)
        // console.log("NFCinfo:::", NFCinfo);///nfc表中的信息
        if (NFCinfo) { ///如果这个NFC已经注册了
            if (NFCinfo.type === 2) {
                if (!AppData.is_all_time) {
                    let isAllowTime = await checkTimeAllow();
                    if (!isAllowTime) {
                        Toast.show('当前不是巡检时间，请在规定时间内进行巡检工作');
                        return;
                    }
                }
                this.getDeviceInfoByNFC(NFCinfo);
            } else {
                Alert.alert('此员工卡数据已经存在于NFC表中', NFCinfo.name);
            }
        } else { ///没有注册
            // console.log('AppData:', AppData)
            if (AppData.username === 'admin') {
                Alert.alert(
                    '注意!',
                    '该射频卡没有在数据库注册，是否利用本设备进行注册?',
                    [
                        { text: '取消', onPress: () => console.log('取消操作'), style: 'cancel' },
                        { text: '确定', onPress: () => this.openRegisterDeviceView() },
                    ],
                    { cancelable: true }
                )
            } else {
                Alert.alert('注意!', '该射频卡没有在数据库注册，请联系管理员进行注册');
            }
        }
    }
    ///在线情况下。获取设备的相关信息。
    getDeviceInfoByNFC = (NFCinfo) => {
        let result = [];
        let sql = `select nt.* from (
            select d.id as device_id,d.name as device_name,d.type_id as device_type_id,dts.name as device_type_name,dts.sample_name as sample_table_name ,d.nfc_id,nfcs.name as nfc_name,nfcs.nfcid,d.area_id,area_3.name as area_name,rt.id as last_record_id,rt.device_status,samples.content as sp_content,rt.content as rt_content,rt.user_id,users.name as user_name,rt.createdAt as rt_createdAt,rt.updatedAt as rt_updatedAt,d.switch
            from devices d 
            left join 
            ( select * from (select max(a.id) as maxid from records a where a.effective = 1 group by a.device_id) t 
            left join (select * from records where records.effective = 1) r on t.maxid = r.id) rt
            on d.id = rt.device_id 
            left join (select * from device_types where device_types.effective = 1) dts on dts.id = d.type_id 
            left join (select * from area_3 where effective = 1) area_3 on area_3.id = d.area_id 
            left join (select * from users where users.effective = 1) users on users.id = rt.user_id 
            left join (select * from samples where samples.effective = 1) samples on d.type_id = samples.device_type_id 
            left join (select * from nfcs where nfcs.effective = 1) nfcs on d.nfc_id = nfcs.id
            where d.effective = 1
            order by d.id) nt
            where nt.nfc_id = '${NFCinfo.id}'`
        HttpApi.obs({ sql }, async (res) => {
            if (res.data.code === 0) {
                result = res.data.data;
                let sampleData = await DeviceStorage.get(SAMPLE_INFO);
                let tempResult = bindWithSchemeInfo(result, sampleData.sampleInfo);///完成方案到设备的关联绑定
                this.props.navigation.navigate('ReportView1', { "deviceInfo": tempResult[0] })
            } else {
                let notice = '此设备射频卡数据已经存在于NFC表中' + NFCinfo.name
                Toast.info(notice, 2);
            }
        })
    }

    getNFCInfo = (param) => {
        let p = new Promise((resolve, reject) => {
            HttpApi.getNFCInfo({ nfcid: param, effective: 1 }, (res) => {
                if (res.data.code === 0) {
                    resolve(res.data.data[0]);
                } else {
                    resolve(null);
                }
            })
        })
        return p;
    }
    openRegisterDeviceView = () => {
        // console.log('确认进行设备注册', this.state.tag.id);
        this.props.navigation.navigate('RegisterDeviceView', { 'nfcid': this.state.tag.id })
    }
    getSomeInfoFromLocalStorage = async () => {
        let list = AppData.last_devices_info;
        for (let index = 0; index < list.length; index++) {
            const deviceInfo = list[index];
            if (deviceInfo.nfcid === this.state.tag.id) {
                // console.log('匹配到', deviceInfo);
                this.props.navigation.navigate('ReportView1', { "deviceInfo": deviceInfo })
                return;
            }
        }
    }
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        alignItems: 'center',
    },
    logo: {
        width: 200,
        height: 200,
        marginTop: 100,
    },
    btn: {
        marginTop: 150,
    },
    ver: {
        alignSelf: "center",
        color: "#DDDDDD"
    }
})