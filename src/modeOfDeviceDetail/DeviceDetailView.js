import React, { Component } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, TouchableHighlight, DeviceEventEmitter } from 'react-native'
import { DatePicker, List, Provider, Button, Toast } from '@ant-design/react-native'
import HttpApi from '../util/HttpApi';
import AppData, { UPDATE_DEVICE_INFO } from '../util/AppData'
import moment from 'moment';
const screenW = Dimensions.get('window').width;
const screenH = Dimensions.get('window').height;

var finally_data
var user_data;
var AllData;
/**
 * 设备详情界面,设备历史记录
 */
class DeviceDetailView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            timeValue: null,
            deviceRecordDataArr: []
        }
    }
    componentDidMount() {
        this.subscription = DeviceEventEmitter.addListener(UPDATE_DEVICE_INFO, this.refreshHandler);
        this.initHandler();
    }
    componentWillUnmount() {
        this.subscription.remove();
    }
    refreshHandler = () => {
        this.initHandler();
    }
    initHandler = async () => {
        AllData = this.props.navigation.state.params
        user_data = await this.getUserData();
        let record_info_arr = await this.getRecordInfo(AllData.data.id);///根据设备id 取查询该设备的记录表
        finally_data = await this.transfromConstruct(record_info_arr);
        finally_data.sort(function (a, b) {
            return b.id - a.id
        })
        finally_data.map((item) => (item.key = item.id + ""))
        this.setState({
            deviceRecordDataArr: finally_data
        })
    }
    getUserData = () => {
        let p = new Promise((resolve, reject) => {
            HttpApi.getUserInfo({}, (res) => {
                if (res.data.code === 0) {
                    resolve(res.data.data)
                }
            })
        })
        return p;
    }
    getRecordInfo = (device_id) => {
        let p = new Promise((resolve, reject) => {
            HttpApi.getRecordInfo({ device_id: device_id }, (res) => {
                resolve(res.data.data);
            })
        })
        return p;
    }
    findUserName = (recordItem) => {
        let p = new Promise((resolve, reject) => {
            let result = ''
            user_data.forEach((item) => {
                if (item.id === recordItem.user_id) {
                    result = item
                }
            })
            resolve(result)
        })
        return p;
    }
    transfromConstruct = async (data) => {
        for (let item of data) {
            item.userInfo = await this.findUserName(item)
        }
        return data
    }
    /**
     * 日期筛选
     */
    onChange = (value) => {
        let selectedArr = [];
        let selectOneDayStart = new Date(value).getTime();
        let selectOneDayEnd = new Date(value).getTime() + 24 * 3600 * 1000 - 1;
        // console.log(selectOneDayStart, selectOneDayEnd);
        finally_data.forEach(element => {
            let itemTime = new Date(element.createdAt).getTime();
            if (itemTime > selectOneDayStart && itemTime < selectOneDayEnd) {
                selectedArr.push(element);
            }
        });
        this.setState({
            timeValue: value,
            deviceRecordDataArr: selectedArr
        })
    }
    renderDeviceStatusItem = (data, index) => {
        let record = data.item;
        return (
            <TouchableHighlight
                underlayColor='#EDEDED'
                onPress={() => {
                    this.goToRecordDetailView(record);
                }}>
                <View style={{ borderBottomWidth: 1, borderColor: '#DDDDDD', height: 40, flexDirection: 'row', width: screenW, paddingTop: 15 }}>
                    <Text style={{ color: '#41A8FF', marginLeft: 10 }}>{moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                    {this.renderStatus(record.device_status)}
                    <Text style={{ marginLeft: 32 }}>上传者: {record.userInfo.name}</Text>
                </View>
            </TouchableHighlight>
        )
    }
    renderStatus = (value) => {
        let colorValue;
        let str;
        if (value === 1) { ///正常
            str = '正常'
            colorValue = '#33CC33'
        } else if (value === 2) {
            str = '故障'
            colorValue = '#FF3300'
        } else {
            str = '待检'
            colorValue = 'black'
        }
        return <Text style={{ marginLeft: 32, color: colorValue }}>{str}</Text>
    }
    goToRecordDetailView = (record) => {
        if (record.device_status === 1) { Toast.success('设备状态正常', 1); return }
        this.props.navigation.navigate('RecordDetailView2', { "recordData": record, "deviceInfo": { name: AllData.data.name } })
    }
    render() {
        return (
            <Provider>
                <View style={styles.mainView}>
                    <View style={{ width: screenW, height: 70, backgroundColor: '#41A8FF' }}>
                        <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>设备详情</Text>
                    </View>
                    <View style={{ width: screenW }}>
                        <List>
                            <DatePicker
                                value={this.state.timeValue}
                                mode="date"
                                extra={<Text>日期查询</Text>}
                                minDate={new Date(2019, 0, 1)}
                                maxDate={new Date(2029, 11, 31)}
                                onChange={(v) => { if (AppData.isNetConnetion) { this.onChange(v) } }}
                                format="YYYY-MM-DD"
                            >
                                <List.Item arrow="horizontal">
                                    <Button type={'primary'} style={{ width: 110, height: 30 }} onPress={() => {
                                        if (AppData.isNetConnetion) {
                                            this.setState({
                                                timeValue: null,
                                                deviceRecordDataArr: finally_data
                                            })
                                        }
                                    }}>查询全部</Button>
                                </List.Item>
                            </DatePicker>
                        </List>
                    </View>
                    <View style={styles.bottomView}>
                        <Text style={{ fontSize: 16, marginBottom: 10, color: '#41A8FF' }}>设备状态历史记录</Text>

                        <View style={styles.recordList}>
                            {this.state.deviceRecordDataArr.length > 0 ?
                                <FlatList
                                    data={this.state.deviceRecordDataArr}
                                    renderItem={(item) => this.renderDeviceStatusItem(item)} /> :
                                <Text>空</Text>
                            }
                        </View>
                    </View>
                </View>
            </Provider>
        );
    }
}

export default DeviceDetailView;

const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        alignItems: 'center',
    },
    bottomView: {
        width: screenW,
        height: screenH - 105,
        alignItems: 'center',
        // backgroundColor: 'blue',
    },
    recordList: {
        width: screenW * 0.95,
        height: screenH - 145,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#F0F0F0'
        // backgroundColor: 'red',
    }
})