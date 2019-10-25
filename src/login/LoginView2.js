import React, { Component } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Dimensions, Text } from 'react-native'
import { Button, InputItem, Toast, Provider } from '@ant-design/react-native';
import HttpApi from '../util/HttpApi';
import DeviceStorage, { USER_INFO } from '../util/DeviceStorage'
import AppData from '../util/AppData'
import { checkTimeAllow } from '../util/Tool'
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
        this.checkUserInfoInStorageHandler();
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
        if (this.state.username.length == 0 || this.state.password.length == 0) {
            Toast.fail('账号和密码都不能为空', 1)
            return;
        }
        let userData = { username: this.state.username, password: this.state.password, effective: 1 };
        HttpApi.getUserInfo(userData, (response) => {
            if (response.status == 200) {
                if (response.data.code == 0 && response.data.data.length > 0) {
                    // console.log("数据LLL222：", response.data.data);
                    this.props.navigation.navigate('MainView')
                    this.saveUserInfoInStorageHandler();
                    this.saveUserInfoInGloabel(response.data.data[0]);
                    checkTimeAllow();
                } else {
                    Toast.fail('用户名密码错误', 1)
                }
            }
        })
    }
    saveUserInfoInGloabel = async (data) => {
        AppData.username = this.state.username;
        AppData.loginFlag = true;
        AppData.user_id = data.id;
        AppData.name = data.name;
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
            console.log('本机存储USER_INFO信息：', value);
            if (value) {
                // console.log(value);
                this.setState({
                    username: value.username,
                    password: value.password
                })
            }
        })
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