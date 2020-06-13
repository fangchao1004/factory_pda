import React, { Component } from 'react';
import { View, Text, ScrollView, Dimensions, DeviceEventEmitter, Image } from 'react-native'
import { Grid, Toast } from '@ant-design/react-native'
import AppData, { UPDATE_DEVICE_INFO } from '../util/AppData'
import DeviceStorage, { AREA_INFO, DEVICE_INFO } from '../util/DeviceStorage'
import { omitTextLength, groupBy } from '../util/Tool'
const screenH = Dimensions.get('window').height;
const screenW = Dimensions.get('window').width;

let device_info = null;
///新的区域界面结构
class AreaGroupView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            areaData: []
        }
    }
    componentDidMount() {
        this.init();
        this.subscription = DeviceEventEmitter.addListener(UPDATE_DEVICE_INFO, this.init);///巡检记录上传成功后。会通知去更新设备的状态。或是巡检记录record。缓存本地。同时改变缓存中设备的状态信息
    }
    init = async () => {
        ///获取设备信息，并且根据区域分组，判断该区域中的设备是否有待检的
        device_info = await DeviceStorage.get(DEVICE_INFO);
        console.log('device_info:', device_info)
        let sorted_arr = groupBy(device_info.deviceInfo, (item) => {
            return [item.area_id];
        })
        let temp_result = [];
        sorted_arr.forEach((one_arr) => {
            let obj = {};
            obj.area_id = one_arr[0].area_id;
            let isComplete = true;
            /// 只要当前区域内的设备有一个是待检，那么就没有检查完
            one_arr.forEach((item) => {
                if (item.status === 3) {
                    isComplete = false;
                }
            })
            // if (one_arr.length === 1) { isComplete = true; }///测试
            obj.isComplete = isComplete;
            obj.device_arr = one_arr;
            temp_result.push(obj);
        })
        console.log('temp_result:', temp_result)
        ///获取（第三级）区域信息
        let area_info = await DeviceStorage.get(AREA_INFO);
        console.log('area_info:', area_info)
        if (area_info) {
            let tempArr = [];
            area_info.areaInfo.forEach(element => {
                temp_result.forEach((item) => {
                    if (element.id === item.area_id) { element.isComplete = item.isComplete }
                })
                let imgSrc = element.isComplete ? require('../../assets/area_1.png') : require('../../assets/area_0.png')
                tempArr.push({
                    allText: element.name,
                    text: omitTextLength(element.name, 6),
                    id: element.id,
                    icon: <Image style={{ width: 32, height: 32 }} source={imgSrc} />
                });
            });
            this.setState({
                areaData: tempArr
            })
        }
    }
    filterDeviceInfoByAreaId = (areaItem) => {
        if (device_info) {
            let allDevices = device_info.deviceInfo;
            let result = [];
            allDevices.forEach((oneDevice) => {
                if (oneDevice.area_id === areaItem.id) { result.push(oneDevice) }
            })
            this.props.navigation.navigate("AreaDeviceView", { 'deviceArr': result, 'areaName': areaItem.allText });
        }
    }
    render() {
        return (
            <View style={{ width: screenW, height: screenH - 110, padding: 10, }}>
                <ScrollView>
                    <Grid data={this.state.areaData}
                        onPress={(item, index) => {
                            // let text = '区域id:' + item.id;
                            // Toast.info(text, 1)
                            // this.props.navigation.navigate("AreaDeviceView", { 'areaid': item.id });
                            this.filterDeviceInfoByAreaId(item);
                        }} />
                </ScrollView>
            </View >
        );
    }
}

export default AreaGroupView;