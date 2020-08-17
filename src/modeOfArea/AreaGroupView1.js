import React, { Component } from 'react';
import DeviceStorage, { AREA123_INFO, DEVICE_INFO } from '../util/DeviceStorage';
import { View, Text, Dimensions, Image } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import { Grid } from '@ant-design/react-native';
import { omitTextLength, combinAreaAndDevice, filterAreaLinkDeviceListByDeviceCount, filterDeviceCount0 } from '../util/Tool';
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
    }
    init = async () => {
        ///获取三级结构数据
        let data = await DeviceStorage.get(AREA123_INFO);
        // console.log('data.area123Info:', data.area123Info)
        let areaData = data.area123Info.map((item) => {
            let imgSrc = require('../../assets/area_0.png')
            return {
                text: omitTextLength(item.title, 20), ...item,
                icon: <Image style={{ width: 32, height: 32 }} source={imgSrc} />,
            }
        })
        let deviceData = await DeviceStorage.get(DEVICE_INFO);
        // console.log('deviceData:', deviceData.deviceInfo)
        let result = combinAreaAndDevice(areaData, deviceData.deviceInfo);
        // console.log('result:', result)
        let afterFilter = filterDeviceCount0(result)
        this.setState({ areaData: afterFilter })
    }
    render() {
        return (
            // <View>
            //     <Text>AreaGroupView1</Text>
            // </View>
            <View style={{ width: screenW, height: screenH - 110, padding: 10, }}>
                <ScrollView>
                    <Grid data={this.state.areaData}
                        onPress={(item, index) => {
                            // console.log('item:', item)
                            this.props.navigation.navigate("AreaGroupView2", item);
                            // let text = '区域id:' + item.id;
                            // Toast.info(text, 1)
                            // this.props.navigation.navigate("AreaDeviceView", { 'areaid': item.id });
                            // this.filterDeviceInfoByAreaId(item);
                        }} />
                </ScrollView>
            </View >
        );
    }
}