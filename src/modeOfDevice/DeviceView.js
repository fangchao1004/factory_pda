import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import DeviceTabs from './DeviceTabs';
import { Button } from '@ant-design/react-native';
const screenW = Dimensions.get('window').width;
const screenH = Dimensions.get('window').height;

const testData = {
    area_id: 14,
    area_name: "汽轮机",
    device_id: 66,
    device_name: "漕河泾测试设备",
    device_status: 1,
    device_type_id: 41,
    device_type_name: "一次风空预器",
    last_record_id: 197,
    nfc_id: 9,
    nfc_name: "漕河泾--模拟设备2",
    nfcid: "31255880",
    rt_content: '[{"key":"1","title_name":"标题1","type_id":"4","default_values":"a/b/c","value":"","bug_id":null},{"key":"2","title_name":"测温","type_id":"10","default_values":"","value":"","bug_id":null},{"key":"3","title_name":"测震x轴","type_id":"11","default_values":"","value":"","bug_id":null},{"key":"4","title_name":"测震y轴","type_id":"11","default_values":"","value":"","bug_id":null},{"key":"5","title_name":"油位","type_id":"2","default_values":"","value":"","bug_id":null}]',
    rt_createdAt: "2019-09-25T03:25:21.000Z",
    rt_updatedAt: "2019-09-25T03:25:21.000Z",
    sample_table_name: "一次风空预器表单",
    sp_content: '[{"key":"1","title_name":"标题1","type_id":"4","default_values":"a/b/c"},{"key":"2","title_name":"测温","type_id":"10","default_values":""},{"key":"3","title_name":"测震x轴","type_id":"11","default_values":""},{"key":"4","title_name":"测震y轴","type_id":"11","default_values":""},{"key":"5","title_name":"油位","type_id":"2","default_values":""}]',
    user_id: 0,
    user_name: "管理员"
}

export default class DeviceView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            itemCount: ''
        }
    }
    render() {
        return (
            <View style={styles.main}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: screenW, height: 70, backgroundColor: '#41A8FF' }}>
                    <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>设备列表</Text>
                    {/* <Button
                        style={{ marginTop: 20 }}
                        onPress={() => {
                            this.props.navigation.navigate('ReportView1', { "deviceInfo": testData })
                        }}>测试点击</Button> */}
                    <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>总数: {this.state.itemCount}</Text>
                </View>
                <View style={{ alignItems: 'center', width: screenW, height: screenH - 170 }}>
                    <DeviceTabs navigation={this.props.navigation} refreshCount={this.refreshCountHandler} />
                </View>
            </View>
        );
    }

    refreshCountHandler = (value) => {
        this.setState({
            itemCount: value + ''
        })
    }
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        alignItems: 'center',
    }
})