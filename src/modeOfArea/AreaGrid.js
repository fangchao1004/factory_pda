import React from 'react';
import { ScrollView, Text, View, Image, RefreshControl, Dimensions, StyleSheet } from 'react-native';
import { Grid, Toast } from '@ant-design/react-native';
import HttpApi from '../util/HttpApi';
const screenW = Dimensions.get('window').width;
const screenH = Dimensions.get('window').height;

const ImgSourceObj = {
    "1": require('../../assets/devices/device_1.png'),
    "2": require('../../assets/devices/device_2.png'),
    "3": require('../../assets/devices/device_3.png'),
}
var currentArea;
export default class AreaGrid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            devicesData: [],
            isRefreshing: false
        }
    }
    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.data)
            this.init(nextProps.data)
    }
    componentDidMount() {
        if (this.props.data)
            this.init(this.props.data)
    }
    init = (params) => {
        let data = [];
        params.forEach((item, index) => {
            currentArea = item.area_id
            data.push(
                {
                    icon: <Image style={{ width: 32, height: 32 }} source={ImgSourceObj[item.status]} />,
                    text: item.name,
                    status: item.status === 1 ? '正常' : (item.status === 2 ? '故障' : '待检')
                }
            )
        })
        this.setState({
            devicesData: data
        })
    }
    onRefresh = async () => {
        setTimeout(() => {
            this.setState({
                isRefreshing: false
            })
        }, 1000);
        this.props.onRefresh();
    }
    getDevicesInfo = () => {
        let p = new Promise((resolve, reject) => {
            HttpApi.getDeviceInfo({ area_id: currentArea }, (res) => {
                resolve(res.data.data);
            })
        })
        return p;
    }
    render() {
        return (
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={this.onRefresh}
                        title="Loading..."
                    />
                }
            >
                <View style={[{ padding: 10 }]}>
                    {this.state.devicesData.length > 0 ?
                        <View style={styles.bgView}>
                            <Grid data={this.state.devicesData}
                                onPress={(item, index) => {
                                    let text = '设备当前状态:' + item.status;
                                    Toast.info(text, 2)
                                }} />
                        </View>
                        :
                        <View style={styles.bgView}>
                            <Text>此区域没有设备</Text>
                        </View>
                    }
                </View>
            </ScrollView >
        );
    }
}

const styles = StyleSheet.create({
    bgView: {
        width: screenW * 0.95,
        height: screenH - 170,
        alignItems: 'center'
    }
})