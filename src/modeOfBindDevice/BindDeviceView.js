import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { Toast, Button } from '@ant-design/react-native'
import DeviceStorage, { USER_CARD, USER_INFO, LOCAL_BUGS, LOCAL_RECORDS } from '../util/DeviceStorage'
import AppData from '../util/AppData'
import ToastExample from '../util/ToastExample'


const screenW = Dimensions.get('window').width;
const screenH = Dimensions.get('window').height;

export default class BindDeviceView extends Component {
    constructor(props) {
        super(props)
    }

    render() {
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
                            else { Toast.show('此设备无匹配的测具-请联系管理员处理', 1); }
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
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        alignItems: 'center',
    },
})