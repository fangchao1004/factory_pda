import React, { Component } from 'react';
import { View, Text, TouchableHighlight, FlatList, Image, Dimensions, DeviceEventEmitter } from 'react-native'
import { Modal, Button, Provider, Portal, Toast, InputItem } from '@ant-design/react-native'
import AppData, { UPDATE_DEVICE_INFO } from '../util/AppData'
import HttpApi from '../util/HttpApi';
import DeviceStorage, { LOCAL_BUGS, LOCAL_RECORDS, DEVICE_INFO } from '../util/DeviceStorage';
import ToastExample from '../util/ToastExample'
import moment from 'moment'
import SelectPhoto from '../modeOfPhoto/SelectPhoto';

const screenW = Dimensions.get('window').width;

var copyDataAll = [];
var currentCollectIndex = null; /// 当前正在采集的是那个选项 所在的index 索引
export default class ReportView1 extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],///一整个record 表单的数据 json
            value: null,
            titleData: null,
            isLoading: false,
            isConnectedDevice: false,
        }
    }
    componentDidMount() {
        AppData.checkedAt = moment().format('YYYY-MM-DD HH:mm:ss')
        this.initFromData();
        ToastExample.isConnected((isConnectedDevice) => {
            // console.log(isConnected);
            this.setState({ isConnectedDevice })
        })

        DeviceEventEmitter.addListener('tmpEvent', (e) => {
            // this.setState({ value: e.value })
            ///监听到采集的温度数据 结合 currentCollectIndex  修改 data 值
            if (currentCollectIndex !== null) {
                let copyList = JSON.parse(JSON.stringify(this.state.data));
                if (copyList[currentCollectIndex].isCollecting === true) {
                    copyList[currentCollectIndex].value = e.value + '';
                }
                this.setState({ data: copyList })///修改输入数据
            }
        });

        DeviceEventEmitter.addListener('vibEvent', (e) => {
            // this.setState({ value: e.value })
            if (currentCollectIndex !== null) {
                let copyList = JSON.parse(JSON.stringify(this.state.data));
                if (copyList[currentCollectIndex].isCollecting === true) {
                    copyList[currentCollectIndex].value = e.value + '';
                }
                this.setState({ data: copyList })///修改输入数据
            }
        });
    }
    initFromData = () => {
        let AllData = this.props.navigation.state.params
        if (!AllData || !AllData.deviceInfo) {
            return;
        }
        copyDataAll = JSON.parse(JSON.stringify(AllData))
        let needRenderContent = [];
        let hasBugid = false;
        JSON.parse(copyDataAll.deviceInfo.rt_content).forEach((item) => {
            if (item.bug_id !== null) { hasBugid = true }
        })
        //先判断有没有网络   有网络且最近一次有record提交。且record中 有缺陷 bug_id 那么就将record 渲染。
        if (AppData.isNetConnetion && copyDataAll.deviceInfo.rt_content && copyDataAll.deviceInfo.rt_content !== '[]' && hasBugid) {
            // console.log('copyDataAll.deviceInfo.rt_content:', copyDataAll.deviceInfo.rt_content);
            needRenderContent = JSON.parse(copyDataAll.deviceInfo.rt_content).map((item) => {
                item.value = ''
                if (item.type_id === '10' || item.type_id === '11') {
                    item.isCollecting = false;
                } else if (item.type_id === '6') {
                    item.value = [];
                }
                item.isChecked = false; /// 将所有项都至成了没有选择过的状态
                return item
            })
        } else {
            // 如果没有网络。或是 有网络 但是没有最近一次的record。或者是有record,但是最近一次的record中没有缺陷 bug_id 都为null 那么就只渲染 sample 模版
            // console.log("copyDataAll.deviceInfo.sp_content:", copyDataAll.deviceInfo.sp_content);
            if (copyDataAll.deviceInfo.sp_content) {
                let a = JSON.parse(copyDataAll.deviceInfo.sp_content);
                needRenderContent = a.map((item) => {
                    item.value = '';
                    item.bug_id = null;
                    item.isChecked = false;
                    if (item.type_id === '10' || item.type_id === '11') {
                        item.isCollecting = false;
                    } else if (item.type_id === '6') {
                        item.value = [];
                    }
                    return item
                })
            } else { Toast.info('请配置表单模版'); return; }
        }
        this.setState({
            data: needRenderContent,
            titleData: { title: copyDataAll.deviceInfo.sample_table_name, devicename: copyDataAll.deviceInfo.device_name }
        })
    }

    /**
     * 获取bugid 数值后 回调
     */
    callBackBugId = (id, key) => {
        // console.log('callBackBugId:', id, key);
        let tempArr = JSON.parse(JSON.stringify(this.state.data));
        tempArr.forEach((item) => {
            if (item.key === key + '') {
                item.bug_id = id;
                item.isChecked = true;
            }
        })
        this.setState({
            data: tempArr
        })
    }

    /**
     * 标记 那一项已经检查过了
     */
    callBackIsChecked = (key) => {
        let tempArr = JSON.parse(JSON.stringify(this.state.data));
        tempArr.forEach((item) => {
            if (item.key === key + '') {
                item.isChecked = true;
            }
        })
        // console.log(tempArr);
        this.setState({
            data: tempArr
        })
    }

    /**
     * 检查record内容是否ok
     * 
     * 10 测温 11测振 12通用 4多选
     * 2 数字输入框 6图片选择器
     * 
     * 13 副标题组件（纯文本展示）-不计入检查范围
     */
    checkContentIsOk = () => {
        let isOk = true;
        if (this.state.data && this.state.data.length > 0) {
            this.state.data.forEach((item) => {
                if ((item.type_id === '10' && item.value === '') ||
                    (item.type_id === '11' && item.value === '') ||
                    (item.type_id === '2' && item.value === '') ||
                    (item.type_id === '6' && item.value.length === 0) ||
                    (item.type_id === '4' && item.isChecked === false && item.bug_id === null) ||
                    (item.type_id === '12' && item.isChecked === false && item.bug_id === null)) {
                    isOk = false
                }
            })
        } else {
            isOk = false
        }
        return isOk;
    }

    ///点击上传按钮  上传记录
    upLoadRecordHandler = async () => {
        if (this.checkContentIsOk() === false) { Toast.fail('请检查是否有数据遗漏'); return; }
        this.setState({ isLoading: true })
        var key = Toast.loading('数据上传中...')
        let status = 1;///1正常，2故障
        this.state.data.forEach((item) => {
            if (item.bug_id) { status = 2 }
        })
        let recordData = {};
        recordData.device_id = copyDataAll.deviceInfo.device_id;
        recordData.device_type_id = copyDataAll.deviceInfo.device_type_id;
        recordData.table_name = copyDataAll.deviceInfo.sample_table_name;
        recordData.device_status = status;
        recordData.content = JSON.stringify(this.state.data);
        recordData.user_id = AppData.user_id;
        recordData.isUploaded = false;
        recordData.checkedAt = AppData.checkedAt;
        if (AppData.isNetConnetion) { ///在线情况下
            ///判断 整个表单中 有没有 图片选择器组件。
            for (let index = 0; index < this.state.data.length; index++) {
                const element = this.state.data[index];
                if (element.type_id === '6') {///有图片选择器组件 有的话 将
                    let imgLocalPathArr = element.value;///这里的值 是本地的文件路径
                    if (imgLocalPathArr.length > 0) {
                        let netUriArr = [];
                        for (const imgPath of imgLocalPathArr) {
                            let imgfile = { uri: imgPath, type: 'multipart/form-data', name: 'image.jpg' }
                            let formData = new FormData()
                            formData.append('file', imgfile)
                            let netUri = await this.uploadImage(formData)///上传图片
                            netUriArr.push(netUri);
                        }
                        element.value = netUriArr;///这里的值，是服务器上文件的uuid
                    }
                }
            }
            recordData.content = JSON.stringify(this.state.data);///直接修改了 this.state.data 和 recordData.content
            // console.log(this.state.data);
            // console.log('recordData:', recordData);
            // return;
            HttpApi.upLoadDeviceRecord(recordData, (res) => {
                if (res.data.code === 0) {
                    HttpApi.updateDeviceStatus({ id: recordData.device_id }, { $set: { status: recordData.device_status } }, (res) => {
                        if (res.data.code === 0) {
                            Portal.remove(key)
                            Toast.success('设备巡检记录上传成功', 1);
                            ///把record 存本地。
                            recordData.isUploaded = true;
                            this.saveReportDataToLocalStorage(recordData);
                        }
                        this.setState({ isLoading: false })
                    })
                } else {
                    Portal.remove(key)
                    Toast.fail('设备巡检记录上传失败', 1);
                    this.setState({ isLoading: false })
                }
            })
        } else {
            this.saveReportDataToLocalStorage(recordData);
        }
    }
    uploadImage = (formData) => {
        return new Promise((resolve, reject) => {
            let result = ''
            HttpApi.uploadFile(formData, (res) => {
                if (res.data.code === 0) { result = res.data.data; }
                resolve(result);
            })
        })
    }
    ///有无网络时，都要缓存进本地  还要区分 这个record 是否已经上传过了。 isUploaded
    saveReportDataToLocalStorage = async (recordData) => {
        let records = await DeviceStorage.get(LOCAL_RECORDS)
        let tempArr = [];
        if (records) {
            tempArr = JSON.parse(JSON.stringify(records.localRecords));
            tempArr.push(recordData);
            await DeviceStorage.update(LOCAL_RECORDS, { "localRecords": tempArr })
        } else {
            tempArr.push(recordData);
            await DeviceStorage.save(LOCAL_RECORDS, { "localRecords": tempArr })
        }
        // let re = await DeviceStorage.get(LOCAL_RECORDS);
        // console.log('保存后1：', re.localRecords);
        Toast.success('设备点检记录本地缓存成功', 1);
        ///缓存成功以后，。要根据tempArr（存储了各个设备的record的数组数据）去改变本地的设备信息副本中的设备状态。
        if (tempArr.length > 0) {
            this.changeLocalDeviceStatusByTempRecordArry(tempArr);
        }
        setTimeout(() => {
            this.props.navigation.goBack();
        }, 1300);
    }

    changeLocalDeviceStatusByTempRecordArry = async (tempArr) => {
        let deviceInfo = await DeviceStorage.get(DEVICE_INFO);
        if (deviceInfo) {
            // console.log('待与本地数据合并的recordArr:', tempArr);
            // console.log('本地的设备数据副本a:', deviceInfo.deviceInfo);
            let tempDeviceArr = JSON.parse(JSON.stringify(deviceInfo.deviceInfo));
            ////遍历待上传的record数组。
            tempArr.forEach((oneRecord) => {
                tempDeviceArr.forEach((oneDevice) => {
                    if (oneDevice.id === oneRecord.device_id) { ////如果找到record和device的匹配项
                        oneDevice.status = oneRecord.device_status ////将record的device_status替换到设备的status
                    }
                })
            })
            ////再将替换后的数据重新 放进本地缓存中。
            await DeviceStorage.save(DEVICE_INFO, { "deviceInfo": tempDeviceArr });
            ////等这完成后。再发事件。通知DeviceTabs和AreaTabs界面去缓存中获取最新的设备信息。（主要时设备的状态变化）
            DeviceEventEmitter.emit(UPDATE_DEVICE_INFO);
        }
    }

    /**
     * 渲染每一行 - 函数 - 根据 type_id 不同渲染不同的组件
     */
    renderItem = (item) => {
        let component = null
        if (item.item.type_id === '10' || item.item.type_id === '11') { /// 10测温  11测振组件
            let unitStr = item.item.type_id === '10' ? '°C' : 'mm';
            let magLft = item.item.type_id === '10' ? 20 : 10;
            let new_title_name = item.item.title_name;
            let collectValue = this.state.data[parseInt(item.index)].value;
            let showValue = collectValue ? (item.item.type_id === '11' ? parseFloat(collectValue / 1000).toFixed(3) : parseFloat(collectValue)) : ''
            component = <View style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'column', borderBottomColor: "#bfbfbf", borderBottomWidth: 1, paddingBottom: 10, paddingTop: 10 }}>
                <View style={{ marginBottom: 5 }}>
                    <Text style={{ fontSize: 14, alignSelf: 'flex-start' }}>{new_title_name}</Text>
                </View>
                <View style={{ flexDirection: 'row-reverse' }}>
                    <Button
                        style={{ alignSelf: 'center' }} size='small' type='primary'
                        onPress={() => { this.collectHandler(item) }}
                    >
                        {item.item.isCollecting ? '停止' : '采集'}
                    </Button>
                    <View style={{ flexDirection: 'row', marginRight: 30 }}>
                        <View style={{ alignSelf: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#DDDDDD', width: 80, height: 30, backgroundColor: '#D0D0D0' }}>
                            <Text style={{ marginTop: 4 }}>{showValue}</Text>
                        </View>
                        <Text style={{ fontSize: 15, color: '#000000', alignSelf: 'center', marginLeft: magLft }}>{unitStr}</Text>
                    </View>
                </View>
            </View>
        }
        // else if (item.item.type_id === '4') { ///多选组件
        //     ///type = 4 时 
        //     component = <TouchableHighlight
        //         underlayColor='#EDEDED'
        //         style={{ flex: 1, flexDirection: "row", alignItems: 'center', borderBottomColor: '#bfbfbf', borderBottomWidth: 1 }}
        //         onPress={() => {
        //             this.setState({
        //                 value: item.item.key
        //             })
        //             item.deviceInfo = copyDataAll.deviceInfo;
        //             item.callBackBugId = this.callBackBugId;
        //             item.callBackIsChecked = this.callBackIsChecked;
        //             this.props.navigation.navigate('ReportView2', item)
        //         }}
        //     >
        //         <View style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'column', paddingBottom: 10, paddingTop: 10 }}>
        //             <Text style={{ fontSize: 14 }}>{item.item.title_name}</Text>
        //             <View style={{ flexDirection: 'row-reverse' }}>
        //                 <Image style={{ width: 20, height: 20, marginLeft: 10 }} source={require('../../assets/jt.png')} />
        //                 <Image style={{ width: 24, height: 24, display: item.item.bug_id ? 'flex' : 'none' }} source={require('../../assets/red_flag.png')} />
        //                 <Image style={{ width: 24, height: 24, display: item.item.bug_id ? 'none' : (item.item.isChecked ? 'flex' : 'none') }} source={require('../../assets/green_flag.png')} />
        //             </View>
        //         </View>
        //     </TouchableHighlight >
        // }
        else if (item.item.type_id === '12') { ///通用组件
            ///type = 4 时 
            component = <TouchableHighlight
                underlayColor='#EDEDED'
                style={{ flex: 1, flexDirection: "row", alignItems: 'center', borderBottomColor: '#F0F0F0', borderBottomWidth: 1 }}
                onPress={() => {
                    this.setState({
                        value: item.item.key
                    })
                    item.deviceInfo = copyDataAll.deviceInfo;
                    item.callBackBugId = this.callBackBugId;
                    item.callBackIsChecked = this.callBackIsChecked;
                    this.props.navigation.navigate('ReportView2', item)
                }}
            >
                <View style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'column', paddingBottom: 10, paddingTop: 10 }}>
                    <Text style={{ fontSize: 14 }}>{item.item.title_name}</Text>
                    <View style={{ flexDirection: 'row-reverse' }}>
                        <Image style={{ width: 20, height: 20, marginLeft: 10 }} source={require('../../assets/jt.png')} />
                        <Image style={{ width: 24, height: 24, display: item.item.bug_id ? 'flex' : 'none' }} source={require('../../assets/red_flag.png')} />
                        <Image style={{ width: 24, height: 24, display: item.item.bug_id ? 'none' : (item.item.isChecked ? 'flex' : 'none') }} source={require('../../assets/green_flag.png')} />
                    </View>
                </View>
            </TouchableHighlight >
        } else if (item.item.type_id === '2') { ///数字输入框
            component = <View style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'column', paddingBottom: 10, paddingTop: 10 }}>
                <Text style={{ fontSize: 14 }}>{item.item.title_name}</Text>
                <View>
                    <InputItem type='number' placeholder='数字输入' onChange={(v) => {
                        let copyList = JSON.parse(JSON.stringify(this.state.data));
                        copyList[item.index].value = v + '';
                        this.setState({ data: copyList })///修改输入数据
                    }} ></InputItem>
                </View>
            </View>
        } else if (item.item.type_id === '6') {///图片选择器
            component = <View style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'column', paddingBottom: 10, paddingTop: 10 }}>
                <Text style={{ fontSize: 14 }}>{item.item.title_name}</Text>
                <View style={{ marginTop: 5 }}>
                    <SelectPhoto onChange={(value) => this.photoChangeHandler(value, item.index)} />
                </View>
            </View>
        } else if (item.item.type_id === '13') {///副标题组件
            component = <View style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'column', paddingBottom: 10, paddingTop: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#555555' }}>{item.item.title_name}</Text>
            </View>
        }
        return component
    }

    photoChangeHandler = (value, index) => {
        let imgLocalPathArr = [];
        value.forEach(element => {
            imgLocalPathArr.push(element.uri);
        });
        // let copydata = JSON.parse(JSON.stringify(this.state.fromData));
        // copydata.imgs = imgLocalPathArr;
        // console.log('imgLocalPathArr:', imgLocalPathArr);
        let copyList = JSON.parse(JSON.stringify(this.state.data));
        copyList[index].value = imgLocalPathArr;
        this.setState({ data: copyList })///修改输入数据
    }

    /**
     * 开始整体处理数据
     */
    collectHandler = (Item) => {
        if (this.state.isConnectedDevice === false) {
            Toast.info('请先连接设备!');
            return;
        }
        let item = Item.item;
        let index = Item.index;
        // console.log(item, index, item.isCollecting);
        // return;
        if (item && item.isCollecting === false) {///如果 button 字面 是 '采集' 开始采集
            if (currentCollectIndex !== null) {///如果当前已经有正在采集的项  提示用户 先完成当前的采集工作
                Toast.info('请先完成当前的采集工作，再开始下一项');
                return;
            } else {
                currentCollectIndex = index;///保留当前选中的index值
                let copy = JSON.parse(JSON.stringify(this.state.data));
                let tempList = copy.map((item, myIndex) => { if (myIndex === index) { item.isCollecting = true; } return item })
                // console.log('templist:', tempList);
                this.setState({
                    data: tempList
                })
                ///开始采集操作
                if (item.type_id === '10') {
                    ToastExample.collectTmp(v => { });
                } else if (item.type_id === '11') {
                    ToastExample.collectVib(v => { });
                }
            }
        } else {///如果 button 字面 是 '停止'   停止采集 将对应的选项  isCollecting 致成  false
            ToastExample.stopCollect();
            let copy = JSON.parse(JSON.stringify(this.state.data));
            let tempList = copy.map((item, myIndex) => { if (myIndex === index) { item.isCollecting = false; } return item })
            this.setState({
                data: tempList
            })
            currentCollectIndex = null;
        }
    }

    render() {
        return (
            <Provider>
                <View style={{ flex: 1, width: screenW, alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                    <View style={{ width: screenW }}>
                        <View style={{ width: screenW, height: 70, backgroundColor: '#41A8FF' }}>
                            <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>设备点检</Text>
                        </View>
                        <Text style={{ alignSelf: 'center', fontSize: 20, marginTop: 10, color: '#41A8FF' }}>{this.state.titleData ? this.state.titleData.title : ''}</Text>
                        <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                            <Text style={{ margin: 10, fontSize: 14, color: '#000000' }}><Text style={{ color: '#000000' }}>设备名: </Text>{this.state.titleData ? this.state.titleData.devicename : ''}</Text>
                            <Text style={{ margin: 10, fontSize: 14, color: '#000000' }}><Text style={{ color: '#000000' }}>上传者: </Text>{AppData.name}</Text>
                        </View>
                    </View>
                    <FlatList
                        style={{ width: screenW * 0.95, borderWidth: 1, borderRadius: 5, borderColor: '#F0F0F0' }}
                        contentContainerStyle={{ width: screenW * 0.9, alignSelf: 'center' }}
                        data={this.state.data}
                        renderItem={(item) => this.renderItem(item)}
                    />
                    <Button loading={this.state.isLoading} disabled={this.state.isLoading} style={{ marginTop: 10, marginBottom: 10, width: screenW * 0.9 }} type='primary' onPress={this.upLoadRecordHandler}>
                        {this.state.isLoading ? '正在上传' : '确定上传'}
                    </Button>
                </View>
            </Provider >
        );
    }
}
