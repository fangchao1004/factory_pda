import React, { Component } from 'react';
import { ScrollView, View, Text, Dimensions, StyleSheet, Image } from 'react-native'
import { Grid, Provider, Toast } from '@ant-design/react-native'
import { omitTextLength } from '../util/Tool'
const screenW = Dimensions.get('window').width;

const ImgSourceObj = {
    "1": require('../../assets/devices/device_1.png'),
    "2": require('../../assets/devices/device_2.png'),
    "3": require('../../assets/devices/device_3.png'),
}

/**
 * XXX区域中的 所有设备。
 * 设备按区域划分
 */
export default class AreaDeviceView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            areaName: '',
            devicesData: []
        }
    }
    componentDidMount() {
        this.init();
    }
    init = () => {
        let AllData = this.props.navigation.state.params
        let deviceArr = AllData.deviceArr;
        // console.log(AllData);
        let data = [];
        deviceArr.forEach((item, index) => {
            currentArea = item.area_id
            data.push(
                {
                    icon: <Image style={{ width: 32, height: 32 }} source={ImgSourceObj[item.status]} />,
                    text: omitTextLength(item.name, 18),
                    status: item.status === 1 ? '正常' : (item.status === 2 ? '故障' : '待检')
                }
            )
        })
        this.setState({
            devicesData: data,
            areaName: AllData.areaName
        })
    }

    render() {
        return (
            <Provider>
                <View style={styles.main}>
                    <View style={{ width: screenW, height: 70, backgroundColor: '#41A8FF', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>当前区域</Text>
                        <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>{omitTextLength(this.state.areaName, 15)}</Text>
                    </View>
                    <ScrollView>
                        <View style={{ width: screenW, padding: 10, }}>
                            {this.state.devicesData.length > 0 ?
                                <Grid data={this.state.devicesData}
                                    onPress={(item, index) => {
                                        let text = '设备当前状态:' + item.status;
                                        Toast.info(text, 1)
                                    }} />
                                : <Text style={{ alignSelf: 'center', }}>此区域暂无设备</Text>}
                        </View>
                    </ScrollView>
                </View>
            </Provider>
        );
    }
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        alignItems: 'center',
    }
})