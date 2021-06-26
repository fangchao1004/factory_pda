import React, { Component } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Dimensions, DeviceEventEmitter } from 'react-native'
import { Button, InputItem, Toast, Provider } from '@ant-design/react-native';
import HttpApi from '../util/HttpApi';
import DeviceStorage, { USER_INFO } from '../util/DeviceStorage'
import AppData, { NET_CONNECT, NET_DISCONNECT } from '../util/AppData'
import { checkTimeAllow } from '../util/Tool'
import ToastExample from '../util/ToastExample'
import NetInfo from '@react-native-community/netinfo'
import moment from 'moment';

const screenW = Dimensions.get('window').width;
/**
 * 账户密码登录
 */
class LoginView2 extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            password: ''
        }
    }
    componentDidMount() {
        this.startMonitorNet();
        this.checkUserInfoInStorageHandler();
    }
    componentWillUnmount() {
        console.log('loginView1 卸载');
        NetInfo.removeEventListener('connectionChange', this.netHandler)
    }
    render() {
        return (
            <Provider>
                <View style={styles.main}>
                    <KeyboardAvoidingView behavior='position'>
                        <View style={{ width: screenW, alignItems: 'center' }}>
                            <Image source={require("../../assets/home/logo.png")} style={styles.logo} />
                        </View>
                        <View style={{ width: screenW, alignItems: "center" }}>
                            <InputItem
                                width={screenW * 0.9}
                                clear
                                value={this.state.username}
                                placeholder="请输入账号"
                                onChange={(value) => this.inputUsernameHandler(value)}
                            >
                                <Image source={require('../../assets/login/username.png')} style={styles.itemIcon} />
                            </InputItem>
                            <InputItem
                                width={screenW * 0.9}
                                clear
                                type={"password"}
                                value={this.state.password}
                                placeholder={"请输入密码"}  ///
                                onChange={(value) => this.inputPasswordHandler(value)}
                            >
                                <Image source={require('../../assets/login/password.png')} style={styles.itemIcon} />
                            </InputItem>
                            <View style={styles.sub}>
                                <Button style={styles.btn} onPress={() => {
                                    this.setState({
                                        username: '',
                                        password: ''
                                    })
                                }}>取消</Button>
                                <Button style={styles.btn} type='primary'
                                    onPress={this.loginHandler}
                                >登录</Button>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                    <Button
                        type='ghost'
                        onPress={() => {
                            this.props.navigation.goBack();
                        }}>
                        返回刷卡登录
                    </Button>
                </View>
            </Provider>
        );
    }
    inputUsernameHandler = (value) => {
        if (value.indexOf(' ') != -1) {
            value = value.replace(/\s*/g, "");
        }
        this.setState({
            username: value
        })
    }
    inputPasswordHandler = (value) => {
        if (value.indexOf(' ') != -1) {
            value = value.replace(/\s*/g, "");
        }
        this.setState({
            password: value
        })
    }
    loginHandler = () => {
        ToastExample.getMac((macAddress) => {
            if (!AppData.isNetConnetion) {
                Toast.fail('请检查当前网络状态');
                return;
            }
            if (this.state.username.length == 0 || this.state.password.length == 0) {
                Toast.fail('账号和密码都不能为空', 1)
                return;
            }
            AppData.mac_address = macAddress;
            AppData.pda_name = '演示机';
            AppData.area0_id = 1;
            AppData.is_all_time = 1;
            let sql = `select users.*,levels.name as levelname from users 
                    left join (select * from levels where effective = 1) levels on levels.id = users.level_id
                    where users.username = '${this.state.username}' 
                    and users.password = '${this.state.password}' 
                    and users.effective = 1`
            HttpApi.obs({ sql }, (data) => {
                if (data.data.code == 0 && data.data.data.length > 0) {
                    this.props.navigation.navigate('MainView')
                    this.saveUserInfoInStorageHandler();
                    this.saveUserInfoInGloabel(data.data.data[0]);
                    // checkTimeAllow(); 测试用登录成功后打印巡检时间段信息
                    let sql = `INSERT INTO login_logs (mac_address,pad_login_type,pda_name,version,client_type,account,time) VALUES ('${AppData.mac_address}',0,'${AppData.pda_name}','${AppData.record[0].version}',1,'${AppData.name}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
                    HttpApi.obs({ sql }) ///添加登录日志记录
                } else {
                    Toast.fail('用户名密码错误', 1)
                }
            })
            // let sql1 = `select * from mac_address where address = '${macAddress}'`
            // HttpApi.obs({ sql: sql1 }, (res) => {
            //     if (res.data.code == 0 && res.data.data.length > 0) {
            //         AppData.mac_address = res.data.data[0].address;
            //         AppData.tool_address = res.data.data[0].tool_address;
            //         AppData.pda_name = res.data.data[0].des;
            //         AppData.area0_id = res.data.data[0].area0_id;
            //         AppData.is_all_time = res.data.data[0].is_all_time;
            //         let sql = `select users.*,levels.name as levelname from users 
            //         left join (select * from levels where effective = 1) levels on levels.id = users.level_id
            //         where users.username = '${this.state.username}' 
            //         and users.password = '${this.state.password}' 
            //         and users.effective = 1`
            //         HttpApi.obs({ sql }, (data) => {
            //             if (data.data.code == 0 && data.data.data.length > 0) {
            //                 this.props.navigation.navigate('MainView')
            //                 this.saveUserInfoInStorageHandler();
            //                 this.saveUserInfoInGloabel(data.data.data[0]);
            //                 // checkTimeAllow(); 测试用登录成功后打印巡检时间段信息
            //                 let sql = `INSERT INTO login_logs (mac_address,pad_login_type,pda_name,version,client_type,account,time) VALUES ('${AppData.mac_address}',0,'${AppData.pda_name}','${AppData.record[0].version}',1,'${AppData.name}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
            //                 HttpApi.obs({ sql }) ///添加登录日志记录
            //             } else {
            //                 Toast.fail('用户名密码错误', 1)
            //             }
            //         })
            //     } else {
            //         Toast.info('当前设备未注册-请联系管理员进行注册');
            //     }
            // })


        });
    }
    saveUserInfoInGloabel = async (data) => {
        AppData.username = this.state.username;
        AppData.loginFlag = true;
        AppData.user_id = data.id;
        AppData.name = data.name;
        AppData.levelname = data.levelname;
        AppData.userNFC = await this.getUserNFC(data.nfc_id);
    }
    getUserNFC = (nfc_id) => {
        let p = new Promise((resolve, rej) => {
            let result = ''
            HttpApi.getNFCInfo({ id: nfc_id }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data[0].nfcid
                }
                resolve(result);
            })
        })
        return p;
    }
    saveUserInfoInStorageHandler = () => {
        DeviceStorage.save(USER_INFO, { username: this.state.username, password: this.state.password });
    }
    checkUserInfoInStorageHandler = () => {
        DeviceStorage.get(USER_INFO).then((value) => {
            // console.log('本机存储USER_INFO信息：', value);
            if (value) {
                // console.log(value);
                this.setState({
                    username: value.username,
                    password: value.password
                })
            }
        })
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
}

export default LoginView2;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        alignItems: 'center',
    },
    sub: {
        width: screenW * 0.9,
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30
    },
    btn: {
        width: 100,
        height: 48,
    },
    logo: {
        width: 200,
        height: 200,
        marginTop: 50,
        marginBottom: 30,
    },
    itemIcon: {
        width: 26,
        height: 26,
        marginLeft: 20
    },
})