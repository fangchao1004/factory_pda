import React, { Component } from 'react';
import { Tabs } from '@ant-design/react-native'
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableHighlight, DeviceEventEmitter } from 'react-native'
import { UPDATE_DEVICE_INFO, NET_DISCONNECT } from '../util/AppData'
import DeviceStorage, { DEVICE_INFO } from '../util/DeviceStorage'

const screenW = Dimensions.get('window').width;
const screenH = Dimensions.get('window').height;
const tabs = [
    { title: '待检' },
    { title: '故障' },
    { title: '全部' },
];
var tabIndex = 0;

export default class DeviceTabs extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refresh: false,
            listDataOfAll: [],
            listDataOfError: [],
            listDataOfUnCheck: []
        }
    }
    // componentWillReceiveProps() {
    // if (this.state.listDataOfAll.length === 0) { this.init(); }
    // }
    componentDidMount() {
        this.subscription = DeviceEventEmitter.addListener(UPDATE_DEVICE_INFO, this.replaceDeviceDataFromLocal);///巡检记录上传成功后。会通知去更新设备的状态。或是巡检记录record。缓存本地。同时改变缓存中设备的状态信息
        this.sub3 = DeviceEventEmitter.addListener(NET_DISCONNECT, this.replaceDeviceDataFromLocal);
        this.init();
    }
    replaceDeviceDataFromLocal = async () => {
        ////是否要将所有的设备状态都重置 成  待检
        ////要从本地缓存的设备信息中。做为当前设备状态的临时副本
        // console.log('监听到设备状态更新了。要从本地缓存的设备信息中。做为当前设备状态的临时副本222');
        let device_info = await DeviceStorage.get(DEVICE_INFO);
        if (device_info) {
            this.groupByStatusAndRender(device_info.deviceInfo);
        }
        ////将本地的缓存作为渲染的数据。当在离线时。完成recrod提交后，要改变本地的设备中的 设备状态。 然后通知此处，重新获取本地的副本。。。。。（这一切都是在离线的情况下。）
    }
    componentWillUnmount() {
        this.subscription.remove();
    }
    render() {
        // console.log('listDataOfAll:', this.state.listDataOfAll);
        return (
            <View style={{ height: screenH - 100, backgroundColor: '#FFFFFF' }}>
                <Tabs tabs={tabs}
                    tabBarActiveTextColor='#0F8EE9'
                    // tabBarInactiveTextColor='#555555'
                    tabBarUnderlineStyle={{ height: 5 }}
                    onChange={(tab, index) => {
                        tabIndex = index;
                        if (index === 0) {
                            this.props.refreshCount(this.state.listDataOfUnCheck.length)
                        } else if (index === 1) {
                            this.props.refreshCount(this.state.listDataOfError.length)
                        } else {
                            this.props.refreshCount(this.state.listDataOfAll.length)
                        }
                    }}
                >
                    <View style={styles.flatListView}>
                        <FlatList
                            style={styles.flatList}
                            data={this.state.listDataOfUnCheck}
                            renderItem={(item) => this.renderItemHandler(item, 'uncheck')}
                            // 下拉刷新数据
                            refreshing={this.state.refresh}
                            onRefresh={() => {
                                this.init();
                            }}
                        />
                    </View>
                    <View style={styles.flatListView}>
                        <FlatList
                            style={styles.flatList}
                            data={this.state.listDataOfError}
                            renderItem={(item) => this.renderItemHandler(item, 'error')}
                            // 下拉刷新数据
                            refreshing={this.state.refresh}
                            onRefresh={() => {
                                this.init();
                            }}
                        />
                    </View>
                    <View style={styles.flatListView}>
                        <FlatList
                            style={styles.flatList}
                            data={this.state.listDataOfAll}
                            renderItem={(item) => this.renderItemHandler(item, 'all')}
                            // 下拉刷新数据
                            refreshing={this.state.refresh}
                            onRefresh={() => {
                                this.init();
                            }}
                        />
                    </View>
                </Tabs>
            </View>
        );
    }
    init = async () => {
        console.log("DeviceTabs init");
        setTimeout(() => {
            this.setState({
                refresh: false
            })
        }, 2000);////两秒后，强制关闭刷新界面显示
        this.setState({
            refresh: true
        })
        ///直接从本地拿 设备信息
        this.replaceDeviceDataFromLocal();
    }

    groupByStatusAndRender = (finallyData) => {
        // console.log('此时联网：', AppData.isNetConnetion);
        // console.log('设备渲染数据L', finallyData);
        let errorDevices = [];
        let uncheckDevices = [];
        // console.log('finallyData:', finallyData);////登录成功后，进入设备列表模块。获取当前所有的设备信息
        finallyData.forEach(element => {
            element.key = element.id + ""
            if (element.status === 2) {///error
                errorDevices.push(element);
            } else if (element.status === 3) {///uncheck
                uncheckDevices.push(element);
            }
        });
        this.setState({
            listDataOfAll: finallyData,
            listDataOfError: errorDevices,
            listDataOfUnCheck: uncheckDevices,
            refresh: false
        })
        if (tabIndex === 0) {
            this.props.refreshCount(uncheckDevices.length)
        } else if (tabIndex === 1) {
            this.props.refreshCount(errorDevices.length)
        } else {
            this.props.refreshCount(finallyData.length)
        }
    }
    renderItemHandler = (data, type) => {
        let record = data.item;
        let bgColor;
        if (type === 'all') {
            if (record.status === 1) { bgColor = '#66CC33' }
            else if (record.status === 2) { bgColor = '#CC3366' }
            else if (record.status === 3) { bgColor = '#BBBBBB' }
        } else if (type === 'error') {
            bgColor = '#CC3366'
        } else if (type === 'uncheck') {
            bgColor = '#BBBBBB';
        }
        return (
            <TouchableHighlight
                underlayColor='#EDEDED'
                onPress={() => {
                    ///这里要根据record.status的值 判断到底是进入设备详情界面还是故障详情界面
                    this.props.navigation.navigate('DeviceDetailView', { data: record })
                }}>
                <View key={record.index} style={{ borderBottomWidth: 2, borderColor: '#FFFFFF', padding: 5, backgroundColor: bgColor, borderRadius: 10 }}>
                    <Text style={{ color: '#ffffff' }}>设备类型: {record.type_name}</Text>
                    <Text style={{ color: '#ffffff' }}>设备名称: {record.name}</Text>
                    <Text style={{ color: '#ffffff' }}>所在区域: {record.area_name}</Text>
                    {/* <Text style={{ color: '#555555' }}>NFC编码: {record.nfc_name}</Text> */}
                </View>
            </TouchableHighlight>
        )
    }
}

const styles = StyleSheet.create({
    flatListView: {
        alignItems: 'center',
        height: screenH - 155,
    },
    flatList: {
        backgroundColor: '#FFFFFF', width: screenW * 0.95
    },
    subView: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 150,
        backgroundColor: '#fff',
    }
})