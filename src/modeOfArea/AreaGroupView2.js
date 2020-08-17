import React, { Component } from 'react';
import DeviceStorage, { AREA123_INFO } from '../util/DeviceStorage';
import { View, Text, Dimensions, StyleSheet, Image } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import { Grid } from '@ant-design/react-native';
import { omitTextLength, filterDeviceCount0 } from '../util/Tool';
const screenH = Dimensions.get('window').height;
const screenW = Dimensions.get('window').width;

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
    }
    init = async () => {
        let AllData = this.props.navigation.state.params
        // console.log('AreaGroupView2 AllData:', AllData)
        let afterFilter = filterDeviceCount0(AllData.children);
        if (afterFilter) {
            let areaData = afterFilter.map((item) => {
                let imgSrc = require('../../assets/area_0.png')
                return {
                    text: omitTextLength(item.title, 20), ...item,
                    icon: <Image style={{ width: 32, height: 32 }} source={imgSrc} />,
                }
            })
            this.setState({ areaData, title: AllData.text })
        }
        // ///获取三级结构数据
        // let data = await DeviceStorage.get(AREA123_INFO);
        // console.log('data.area123Info:', data.area123Info)
        // let areaData = data.area123Info.map((item) => {
        //     return { text: item.title, ...item }
        // })
        // this.setState({ areaData })
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
                                // let text = '区域id:' + item.id;
                                // Toast.info(text, 1)
                                // this.props.navigation.navigate("AreaDeviceView", { 'areaid': item.id });
                                // this.filterDeviceInfoByAreaId(item);
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