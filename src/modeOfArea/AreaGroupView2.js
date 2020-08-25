import React, { Component } from 'react';
import { View, Text, Dimensions, StyleSheet, Image, DeviceEventEmitter } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import { Grid } from '@ant-design/react-native';
import { omitTextLength, filterDeviceCount0 } from '../util/Tool';
import AppData, { UPDATE_DEVICE_INFO } from '../util/AppData';
const screenW = Dimensions.get('window').width;
var current_id;
export default class AreaGroupView2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            areaData: [],
            title: '',
        }
    }
    componentDidMount() {
        this.init();
        this.subscription = DeviceEventEmitter.addListener(UPDATE_DEVICE_INFO, this.init);///巡检记录上传成功后。会通知去更新设备的状态。或是巡检记录record。缓存本地。同时改变缓存中设备的状态信息
    }
    componentWillUnmount() {
        this.subscription.remove();
    }
    init = async () => {
        let param_id = this.props.navigation.state.params.area1_id;
        if (param_id && param_id !== current_id) {
            current_id = param_id;
        }
        console.log('area1 current_id:', current_id)
        let findItem = {};
        ///根据 id 去 AppData.areaDeviceTree 中去查询到最新的数据
        AppData.areaDeviceTree.forEach((area1Item) => {
            if (area1Item.area1_id === current_id) {
                findItem = area1Item;
            }
        })
        let afterFilter = filterDeviceCount0(findItem.children || []);
        if (afterFilter) {
            let areaData = afterFilter.map((item) => {
                let imgSrc = item.finish_count === item.device_count ? require('../../assets/area_1.png') : require('../../assets/area_0.png')
                return {
                    text: omitTextLength(item.title, 15), ...item,
                    icon: <Image style={{ width: 32, height: 32 }} source={imgSrc} />,
                }
            })
            this.setState({ areaData, title: findItem.title })
        }
    }
    render() {
        return (
            <View style={styles.main}>
                <View style={{ width: screenW, height: 70, backgroundColor: '#41A8FF', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>当前区域</Text>
                    <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>{omitTextLength(this.state.title, 15)}</Text>
                </View>
                <ScrollView>
                    <View style={{ width: screenW, padding: 10, }}>
                        <Grid data={this.state.areaData}
                            onPress={(item, index) => {
                                this.props.navigation.navigate("AreaGroupView3", item);
                            }} />
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        alignItems: 'center',
    }
})