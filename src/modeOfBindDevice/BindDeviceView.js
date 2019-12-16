import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, DeviceEventEmitter, Image, TouchableOpacity } from 'react-native'
import { InputItem, Toast, Modal, Button } from '@ant-design/react-native'
import DeviceStorage, { USER_CARD, USER_INFO, LOCAL_BUGS, LOCAL_RECORDS, DEVICE_INFO } from '../util/DeviceStorage'
import AppData, { NET_CONNECT } from '../util/AppData'
import HttpApi from '../util/HttpApi'
import ToastExample from '../util/ToastExample'


const screenW = Dimensions.get('window').width;
const screenH = Dimensions.get('window').height;

export default class BindDeviceView extends Component {
    constructor(props) {
        super(props)
        // this.state = {
        //     isConnected: false,///有没有连接上测具
        // }
    }
    // checkConneted = () => {
    //     console.log('检查连接状态：');
    //     ToastExample.isConnected((isConnected) => {
    //         console.log(isConnected);
    //         this.setState({ isConnected })
    //     })
    // }
    render() {
        // this.checkConneted();
        return (
            <View style={styles.main}>
                <View style={{ width: screenW, height: 70, backgroundColor: '#41A8FF', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>测具绑定</Text>
                </View>
                <View style={{ marginTop: 20, width: screenW * 0.9 }}>
                    <Text>说明: 1，请点击绑定按钮。2，点击连接设备。提示已连接则成功。</Text>
                    <Button
                        style={{ marginTop: 20 }}
                        type='primary'
                        onPress={() => {
                            // console.log("AppData:", AppData)
                            if (AppData.tool_address && AppData.tool_address !== '')
                                ToastExample.bindDevice(AppData.tool_address);
                            else { Toast.show('此设备无匹配的测具-请联系管理员处理'); }
                        }}>
                        绑定设备
                    </Button>
                    <Button
                        style={{ marginTop: 20 }}
                        type='primary'
                        onPress={() => {
                            ToastExample.connectDevice();
                        }}>
                        连接/断开
                    </Button>
                    {/* <Button
                        type='primary'
                        onPress={() => {
                            ToastExample.collectTmp(v => {
                            });
                        }}>
                        采集温度
                    </Button>
                    <Button
                        type='primary'
                        onPress={() => {
                            ToastExample.stopCollect();
                        }}>
                        停止采集
                    </Button>
                    <Button
                        type='primary'
                        onPress={() => {
                            ToastExample.collectVib(v => {
                            });
                        }}>
                        采集速度
                    </Button> */}
                </View>
            </View>
        );
    }

    /**
     * 退出登录
     */
    logoutHandler = async () => {
        ///打开对话框
        Modal.alert('注意！', '是否确定要退出登录？如果再次登录，本地所有的设备状态都将被重置成待检状态', [
            {
                text: '取消'
            },
            {
                text: '确定', onPress: () => {
                    this.doLogout();
                }
            }
        ]);
    }

    doLogout = async () => {
        let bugs = await DeviceStorage.get(LOCAL_BUGS);
        let records = await DeviceStorage.get(LOCAL_RECORDS);
        if (bugs) {
            Toast.show('请先联网同步上传本地缓存的巡检记录', 2);
            return;
        }
        if (records) {
            records.localRecords.forEach(oneRecord => {
                if (!oneRecord.isUploaded) {
                    Toast.show('请先联网同步上传缓存的巡检记录');
                    return;
                }
            });
        }
        //清除本地存储的card信息
        DeviceStorage.delete(USER_CARD);
        DeviceStorage.delete(USER_INFO);
        DeviceStorage.delete(LOCAL_BUGS);
        DeviceStorage.delete(LOCAL_RECORDS);

        this.props.navigation.navigate('LoginView1')
        AppData.loginFlag = false;
        AppData.username = null;
        AppData.userNFC = null
    }

}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        alignItems: 'center',
    },
    infoTxt: {
        fontSize: 20
    }
})