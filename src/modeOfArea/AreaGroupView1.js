import React, { Component } from 'react';
import { View, Dimensions, Image, DeviceEventEmitter } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import { Grid } from '@ant-design/react-native';
import { omitTextLength, filterDeviceCount0, getAreaWithDeviceTree } from '../util/Tool';
import AppData, { UPDATE_DEVICE_INFO } from '../util/AppData';
const screenH = Dimensions.get('window').height;
const screenW = Dimensions.get('window').width;

export default class AreaGroupView1 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            areaData: [],
        }
    }
    componentDidMount() {
        this.init();
        this.subscription = DeviceEventEmitter.addListener(UPDATE_DEVICE_INFO, this.doHandler);///巡检记录上传成功后。会通知去更新设备的状态。或是巡检记录record。缓存本地。同时改变缓存中设备的状态信息
    }
    componentWillUnmount() {
        this.subscription.remove();
    }
    init = async () => {
        await getAreaWithDeviceTree();
        this.doHandler();
    }
    doHandler = () => {
        let afterFilter = filterDeviceCount0(AppData.areaDeviceTree)
        // console.log('AreaGroupView1 afterFilter:', afterFilter)
        let result2 = afterFilter.map((item) => {
            let imgSrc = item.finish_count === item.device_count ? require('../../assets/area_1.png') : require('../../assets/area_0.png')
            return {
                text: omitTextLength(item.title, 20), ...item,
                icon: <Image style={{ width: 32, height: 32 }} source={imgSrc} />,
            }
        })
        this.setState({ areaData: result2 })
    }
    render() {
        return (
            <View style={{ width: screenW, height: screenH - 110, padding: 10, }}>
                <ScrollView>
                    <Grid data={this.state.areaData}
                        onPress={(item, index) => {
                            this.props.navigation.navigate("AreaGroupView2", item);
                        }} />
                </ScrollView>
            </View >
        );
    }
}