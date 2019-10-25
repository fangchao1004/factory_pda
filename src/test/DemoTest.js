import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Image, Dimensions, ToastAndroid } from 'react-native'
import { Modal, Button, Drawer, Provider, Portal, Toast } from '@ant-design/react-native'
import AppData from '../util/AppData'
import HttpApi from '../util/HttpApi';
const screenW = Dimensions.get('window').width;

var copyDataAll = [];
class DemoTest extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            value: null,
            titleData: null
        }
    }
    componentDidMount() {
        this.initFromData();
    }
    initFromData = () => {
        let AllData = this.props.navigation.state.params
        if (!AllData || !AllData.sampleData || !AllData.deviceInfo) {
            return;
        }
        copyDataAll = JSON.parse(JSON.stringify(AllData))
        let copyDataTable = JSON.parse(copyDataAll.sampleData.content);
        // console.log('总数据:', copyDataAll);
        copyDataTable.map((item) => (item.value = '', item.bug_id = null))
        // console.log('表单数据:', copyDataTable);
        this.setState({
            data: copyDataTable,
            titleData: { title: copyDataAll.sampleData.table_name, devicename: copyDataAll.deviceInfo.name }
        })
    }

    openModal = (item) => {
        // ToastAndroid.show('长按', ToastAndroid.SHORT);
        if (!item.item.bug_id) {
            return;
        }
        Modal.alert('提示', '是否重置该条缺陷记录？', [
            {
                text: '取消',
                onPress: () => {
                    //console.log('取消');
                },
            },
            {
                text: '确定', onPress: () => {
                    // console.log('ok', item)
                    let tempdata = JSON.parse(JSON.stringify(this.state.data))
                    tempdata.forEach((ele) => {
                        if (ele.key === item.item.key) {
                            ele.bug_id = null
                        }
                    })
                    this.setState({
                        data: tempdata
                    })
                }
            },
        ]);
    }

    getBugId = (id, key) => {
        let tempArr = JSON.parse(JSON.stringify(this.state.data));
        tempArr.forEach((item) => {
            if (item.key === key + '') {
                item.bug_id = id;
            }
        })
        this.setState({
            data: tempArr
        })
    }

    upLoadRecordHandler = () => {
        var key = Toast.loading('数据上传中...')
        let status = 1;///1正常，2故障
        this.state.data.forEach((item) => {
            if (item.bug_id) { status = 2 }
        })
        // console.log('长传record数据:');
        // console.log('content:', this.state.data);
        // console.log('deviceInfo:', copyDataAll.deviceInfo.id, copyDataAll.deviceInfo.type_id);
        // console.log('table_name:', copyDataAll.sampleData.table_name);
        // console.log('user_id', AppData.user_id);
        // console.log('device_status', status);
        let recordData = {};
        recordData.device_id = copyDataAll.deviceInfo.id;
        recordData.device_type_id = copyDataAll.deviceInfo.type_id;
        recordData.table_name = copyDataAll.sampleData.table_name;
        recordData.device_status = status;
        recordData.content = JSON.stringify(this.state.data);
        recordData.user_id = AppData.user_id;

        HttpApi.upLoadDeviceRecord(recordData, (res) => {
            // console.log(res.data.data);
            if (res.data.code === 0) {
                Portal.remove(key)
                Toast.success('设备巡检记录上传成功', 1);
                setTimeout(() => {
                    this.props.navigation.goBack();
                }, 1100);
            } else {
                Portal.remove(key)
                Toast.fail('设备巡检记录上传失败', 1);
            }
        })
    }

    render() {
        return (
            <Provider>
                <View style={{ flex: 1, width: screenW, alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                    <View style={{ width: screenW }}>
                        <View style={{ width: screenW, height: 70, backgroundColor: '#41A8FF' }}>
                            <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>设备点检</Text>
                        </View>
                        <Text style={{ alignSelf: 'center', fontSize: 20, marginTop: 10, color: '#000000' }}>{this.state.titleData ? this.state.titleData.title : ''}</Text>
                        <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                            <Text style={{ margin: 10, fontSize: 14, color: '#000000' }}><Text style={{ color: '#000000' }}>设备名: </Text>{this.state.titleData ? this.state.titleData.devicename : ''}</Text>
                            <Text style={{ margin: 10, fontSize: 14, color: '#000000' }}><Text style={{ color: '#000000' }}>上传者: </Text>{AppData.username}</Text>
                        </View>
                    </View>
                    <FlatList
                        style={{ width: screenW, backgroundColor: '#F9F9F9' }}
                        contentContainerStyle={{ width: screenW * 0.9, alignSelf: 'center' }}
                        data={this.state.data}
                        renderItem={(item, index) =>
                            <TouchableOpacity
                                style={{ flex: 1, height: 44, flexDirection: "row", alignItems: 'center', borderBottomColor: '#bfbfbf', borderBottomWidth: 1 }}
                                onPress={() => {
                                    this.setState({
                                        value: item.item.key
                                    })
                                    // console.log('click', item);
                                    item.deviceInfo = copyDataAll.deviceInfo;
                                    item.callBackBugId = this.getBugId;
                                    this.props.navigation.navigate('DemoTest2', item)
                                }}
                                onLongPress={() => this.openModal(item)}
                            >
                                <View style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'row' }}>
                                    {/* {console.log(item)} */}
                                    <Text style={{ fontSize: 16 }}>{item.index + 1}. {item.item.title_name}</Text>
                                    <View style={{ flexDirection: "row" }}>
                                        <Image style={{ width: 24, height: 24, display: item.item.bug_id ? 'flex' : 'none' }} source={require('../../assets/red_flag.png')} />
                                        <Image style={{ width: 20, height: 20, marginLeft: 10 }} source={require('../../assets/jt1.png')} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        }
                    />
                    <Button style={{ margin: 20, width: screenW * 0.9 }} type='primary' onPress={this.upLoadRecordHandler}>确定上传</Button>
                </View>
            </Provider>
        );
    }
}

export default DemoTest;