import React, { Component } from 'react';
import DeviceStorage, { AREA123_INFO } from '../util/DeviceStorage';
import { View, Text, Dimensions, StyleSheet, Image } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import { Grid } from '@ant-design/react-native';
import { omitTextLength } from '../util/Tool';
const screenH = Dimensions.get('window').height;
const screenW = Dimensions.get('window').width;
const ImgSourceObj = {
    "1": require('../../assets/devices/device_1.png'),
    "2": require('../../assets/devices/device_2.png'),
    "3": require('../../assets/devices/device_3.png'),
}
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
    }
    //     let imgSrc = element.isComplete ? require('../../assets/area_1.png') : require('../../assets/area_0.png')
    // tempArr.push({
    //     allText: element.name,
    //     text: omitTextLength(element.name, 6),
    //     id: element.id,
    //     icon: <Image style={{ width: 32, height: 32 }} source={imgSrc} />
    // });
    init = async () => {
        let AllData = this.props.navigation.state.params
        console.log('AllData:', AllData)
        if (AllData.children) {
            let areaData = AllData.children.map((item) => {
                return {
                    text: omitTextLength(item.name, 20), ...item,
                    icon: <Image style={{ width: 32, height: 32 }} source={ImgSourceObj[item.status]} />,
                    status: item.status === 1 ? '正常' : (item.status === 2 ? '故障' : '待检')
                }
            })
            this.setState({ areaData, title: AllData.text })
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