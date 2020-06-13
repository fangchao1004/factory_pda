import React, { Component } from 'react';
import { Tabs } from '@ant-design/react-native'
import { View, Dimensions, DeviceEventEmitter } from 'react-native'
import HttpApi from '../util/HttpApi'
import AreaGrid from './AreaGrid';
import AppData, { UPDATE_DEVICE_INFO, NET_CONNECT } from '../util/AppData'
const screenH = Dimensions.get('window').height;
var tabs = [];
var allDevicesData;
var allAreaData;

export default class AreaTabs extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refresh: false,
            tabs: []
        }
    }
    componentWillReceiveProps() {
        if (this.state.tabs.length === 0 && AppData.isNetConnetion) { this.init() }
    }
    componentDidMount() {
        // this.subscription = DeviceEventEmitter.addListener(UPDATE_DEVICE_INFO, this.refreshHandler);
        // this.sub2 = DeviceEventEmitter.addListener(NET_CONNECT, this.refreshHandler);
        // if (AppData.isNetConnetion) { this.init(); }
    }
    componentWillUnmount() {
        this.subscription.remove();
        this.sub2.remove();
    }
    refreshHandler = () => {
        if (AppData.isNetConnetion) { this.init(); }
    }
    render() {
        // console.log('当前数据：', this.state.devicesDataOfCurrentArea)
        return (
            <View style={{ height: screenH - 100, backgroundColor: '#ffffff', }}>
                <Tabs tabs={this.state.tabs}
                    tabBarActiveTextColor='#0F8EE9'
                    tabBarInactiveTextColor='#000000'
                    tabBarUnderlineStyle={{ height: 5 }}
                >
                    {this.renderAreaGrids()}
                </Tabs>
            </View>
        );
    }
    init = async () => {
        tabs = [];
        allDevicesData = await this.getDeviceInfo();
        allAreaData = await this.getAreInfo(); ///获取区域数据
        allAreaData.forEach((item) => {
            tabs.push({ title: item.name, id: item.id }); ///生成表头tabs
        })
        this.setState({ tabs })
    }
    renderAreaGrids = () => {
        let resultArr = []
        ////要知道有多少的区域分组
        if (allAreaData && allAreaData.length > 0) {
            allAreaData.forEach((item, index) => {
                let resutl_arr = this.filterHandler(item.id)
                resultArr.push(
                    <View key={index}>
                        <AreaGrid data={resutl_arr} onRefresh={() => { if (AppData.isNetConnetion) { this.init() } }} />
                    </View>
                )
            })
        }
        return resultArr
    }
    filterHandler = (selectedAreaId) => {
        return allDevicesData.filter((item) => (item.area_id === selectedAreaId))
    }
    getDeviceInfo = () => {
        return new Promise((resolve, reject) => {
            let result = [];
            let sql = `select d.*,a.name as area_name from devices d 
            left join (select * from area_3 where effective = 1) a on d.area_id = a.id 
            where d.effective = 1
            order by d.area_id`
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data;
                }
                resolve(result);
            })
        })
    }
    getAreInfo = () => {
        let p = new Promise((resolve, reject) => {
            HttpApi.getAreaInfo({}, (res) => {
                resolve(res.data.data);
            })
        })
        return p;
    }
}