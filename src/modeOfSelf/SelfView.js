import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, DeviceEventEmitter, Image, TouchableOpacity } from 'react-native'
import { InputItem, Toast, Modal } from '@ant-design/react-native'
import DeviceStorage, { USER_CARD, USER_INFO, LOCAL_BUGS, LOCAL_RECORDS, DEVICE_INFO } from '../util/DeviceStorage'
import AppData, { NET_CONNECT } from '../util/AppData'
import HttpApi from '../util/HttpApi'

const screenW = Dimensions.get('window').width;

export default class SelfView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userInfo: null
        }
    }
    componentWillReceiveProps() {
        if (!this.state.userInfo && AppData.isNetConnetion) { this.init() }
    }
    componentDidMount() {
        this.sub2 = DeviceEventEmitter.addListener(NET_CONNECT, this.refreshHandler);
        if (AppData.isNetConnetion) { this.init(); }
        else {
            this.getDataFromStorage();
        }
    }
    componentWillUnmount() {
        this.sub2.remove();
    }
    refreshHandler = () => {
        this.init();
    }
    init = async () => {
        let userInfoData = {}
        let oneUserInfo = await this.getUserInfo();
        if (oneUserInfo[0].level_id) {
            let oneLevelInfo = await this.getLevelInfo(oneUserInfo[0].level_id);
            userInfoData = { ...oneUserInfo[0], levelname: oneLevelInfo[0].name, nfcid: AppData.userNFC }
        } else {
            userInfoData = { ...oneUserInfo[0], nfcid: AppData.userNFC }
        }
        this.setState({
            userInfo: userInfoData
        })
    }
    getDataFromStorage = () => {
        this.setState({
            userInfo: { name: AppData.name, username: AppData.username, levelname: AppData.levelname }
        })

    }
    getUserInfo = () => {
        return new Promise((resolve, reject) => {
            HttpApi.getUserInfo({ username: AppData.username }, (res) => {
                resolve(res.data.data);
            })
        })
    }
    getLevelInfo = (level_id) => {
        return new Promise((resolve, reject) => {
            HttpApi.getLevelInfo({ id: level_id, effective: 1 }, (res) => {
                resolve(res.data.data);
            })
        })
    }

    render() {
        return (
            <View style={styles.main}>
                <View style={{ width: screenW, height: 70, backgroundColor: '#41A8FF', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>个人中心</Text>
                    <TouchableOpacity
                        onPress={this.logoutHandler}
                    >
                        <Image style={{ width: 26, height: 26, marginRight: 10, marginTop: 28 }} source={require('../../assets/logout.png')} />
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 20, width: screenW * 0.9 }}>
                    <InputItem type={'text'} labelNumber={6} editable={false} value={this.state.userInfo ? this.state.userInfo.name : ''}>{'名称:'}</InputItem>
                    <InputItem type={'text'} labelNumber={6} editable={false} value={this.state.userInfo ? this.state.userInfo.username : ''}>{'登录账号:'}</InputItem>
                    <InputItem type={'text'} labelNumber={6} editable={false} value={this.state.userInfo ? this.state.userInfo.levelname : ''}>{'所属部门:'}</InputItem>
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