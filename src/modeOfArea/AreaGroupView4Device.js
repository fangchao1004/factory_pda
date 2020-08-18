import React, { Component } from 'react';
import { View, Text, Dimensions, StyleSheet, Image, DeviceEventEmitter } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import { Grid } from '@ant-design/react-native';
import { omitTextLength } from '../util/Tool';
import AppData, { UPDATE_DEVICE_INFO } from '../util/AppData';
const screenW = Dimensions.get('window').width;
const ImgSourceObj = {
    "1": require('../../assets/devices/device_1.png'),
    "2": require('../../assets/devices/device_2.png'),
    "3": require('../../assets/devices/device_3.png'),
}
var current_id;
export default class AreaGroupView4Device extends Component {
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
        let param_id = this.props.navigation.state.params.area3_id;
        if (param_id && param_id !== current_id) {
            current_id = param_id;
        }
        console.log('area3 current_id:', current_id)
        let findItem = {};
        ///根据 id 去 AppData.areaDeviceTree 中去查询到最新的数据
        AppData.areaDeviceTree.forEach((area1Item) => {
            area1Item.children.forEach((area2Item) => {
                area2Item.children.forEach((area3Item) => {
                    if (area3Item.area3_id === current_id) {
                        findItem = area3Item;
                    }
                })
            })
        })
        if (findItem.children) {
            let areaData = findItem.children.map((item) => {
                return {
                    text: omitTextLength(item.name, 20), ...item,
                    icon: <Image style={{ width: 32, height: 32 }} source={ImgSourceObj[item.status]} />,
                    status: item.status === 1 ? '正常' : (item.status === 2 ? '故障' : '待检')
                }
            })
            this.setState({ areaData, title: findItem.title })
        }
    }
    render() {
        return (
            <View style={styles.main}>
                <View style={{ width: screenW, height: 70, backgroundColor: '#41A8FF', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>当前巡检点</Text>
                    <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>{omitTextLength(this.state.title, 15)}</Text>
                </View>
                <ScrollView>
                    <View style={{ width: screenW, padding: 10, }}>
                        <Grid data={this.state.areaData}
                            onPress={(item, index) => {
                                console.log('device item:', item)
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