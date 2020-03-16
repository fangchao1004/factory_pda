import React, { Component } from 'react';
import { View, Text, ScrollView, Dimensions, DeviceEventEmitter, Image } from 'react-native'
import { Grid, Toast } from '@ant-design/react-native'
import AppData, { UPDATE_DEVICE_INFO } from '../util/AppData'
import DeviceStorage, { AREA_INFO, DEVICE_INFO } from '../util/DeviceStorage'
import { omitTextLength } from '../util/Tool'
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
        let area_info = await DeviceStorage.get(AREA_INFO);
        if (area_info) {
            let tempArr = [];
            area_info.areaInfo.forEach(element => {
                tempArr.push({
                    allText: element.name,
                    text: omitTextLength(element.name, 6),
                    id: element.id,
                    icon: <Image style={{ width: 32, height: 32 }} source={require('../../assets/area1.png')} />
                });
            });
            this.setState({
                areaData: tempArr
            })
        }
        device_info = await DeviceStorage.get(DEVICE_INFO);
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