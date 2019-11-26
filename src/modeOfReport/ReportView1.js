import React, { Component } from 'react';
import { View, Text, TouchableHighlight, Image, Dimensions, DeviceEventEmitter, ScrollView } from 'react-native'
import { Button, Provider, Portal, Toast, InputItem, Switch } from '@ant-design/react-native'
import AppData, { UPDATE_DEVICE_INFO } from '../util/AppData'
import HttpApi from '../util/HttpApi';
import DeviceStorage, { LOCAL_RECORDS, DEVICE_INFO } from '../util/DeviceStorage';
import ToastExample from '../util/ToastExample'
import moment from 'moment'
import SelectPhoto from '../modeOfPhoto/SelectPhoto';

const screenW = Dimensions.get('window').width;
const screenH = Dimensions.get('window').height;

var copyDataAll = [];
var currentCollectIndex = null; /// 当前正在采集的是那个选项 所在的index 索引
var originSampleList = [];///用于保存原始的渲染项目数据
var originRecordList = [];///用于保存上次record的渲染项目数据
export default class ReportView1 extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],///一整个record 表单的数据 json
            value: null,
            titleData: null,
            isLoading: false,
            isConnectedDevice: false,
            switch: 1,///当前设备是否运行 1为运行 0为停运（屏蔽测温测振）
        }
    }
    componentDidMount() {
        AppData.checkedAt = moment().format('YYYY-MM-DD HH:mm:ss')
        this.initFromData();
        ToastExample.isConnected((isConnectedDevice) => {
            this.setState({ isConnectedDevice })
        })
        DeviceEventEmitter.addListener('tmpEvent', this.setCollValue);
        DeviceEventEmitter.addListener('vibEvent', this.setCollValue);
    }
    setCollValue = (e) => {
        if (currentCollectIndex !== null) {
            let copyList = JSON.parse(JSON.stringify(this.state.data));
            if (copyList[currentCollectIndex].isCollecting === true) {
                copyList[currentCollectIndex].value = e.value + '';
            }
            this.setState({ data: copyList })///修改输入数据
        }
    }

    componentWillUnmount() {
        currentCollectIndex = null;
        DeviceEventEmitter.removeListener('tmpEvent', this.setCollValue);
        DeviceEventEmitter.removeListener('vibEvent', this.setCollValue);
    }
    initFromData = () => {
        originSampleList = []
        originRecordList = []
        let AllData = this.props.navigation.state.params
        if (!AllData || !AllData.deviceInfo) {
            return;
        }
        copyDataAll = JSON.parse(JSON.stringify(AllData))
        let needRenderContent = [];
        let hasBugid = false;
        if (copyDataAll.deviceInfo.rt_content) {
            JSON.parse(copyDataAll.deviceInfo.rt_content).forEach((item) => {
                // console.log('item:', item);
                if (item.bug_id !== null) { hasBugid = true }
            })
        }
        //先判断有没有网络   有网络且最近一次有record提交。且record中 有缺陷 bug_id 那么就将record 渲染。
        if (AppData.isNetConnetion && copyDataAll.deviceInfo.rt_content && copyDataAll.deviceInfo.rt_content !== '[]' && hasBugid) {
            JSON.parse(copyDataAll.deviceInfo.rt_content).forEach((item) => {
                item.value = ''
                item.isChecked = false;
                if (item.type_id === '10' || item.type_id === '11') {
                    item.isCollecting = false;
                } else if (item.type_id === '6') {
                    item.value = []
                }
                if (item.type_id !== '10' && item.type_id !== '11' || (item.type_id === '10' || item.type_id === '11') && copyDataAll.deviceInfo.switch === 1) {
                    needRenderContent.push(item);///初次渲染的界面
                }
                originRecordList.push(item);///原始的record记录
            })
            if (copyDataAll.deviceInfo.sp_content) {
                JSON.parse(copyDataAll.deviceInfo.sp_content).forEach((item) => {
                    item.value = '';
                    item.bug_id = null;
                    item.isChecked = false;
                    if (item.type_id === '10' || item.type_id === '11') {
                        item.isCollecting = false;
                    } else if (item.type_id === '6') {
                        item.value = [];
                    }
                    originSampleList.push(item);///原始的sample数据
                })
            }
        } else {
            // 如果没有网络。或是 有网络 但是没有最近一次的record。或者是有record,但是最近一次的record中没有缺陷 bug_id 都为null 那么就只渲染 sample 模版
            if (copyDataAll.deviceInfo.sp_content) {
                JSON.parse(copyDataAll.deviceInfo.sp_content).forEach((item) => {
                    item.value = '';
                    item.bug_id = null;
                    item.isChecked = false;
                    if (item.type_id === '10' || item.type_id === '11') {
                        item.isCollecting = false;
                    } else if (item.type_id === '6') {
                        item.value = [];
                    }
                    if (item.type_id !== '10' && item.type_id !== '11' || (item.type_id === '10' || item.type_id === '11') && copyDataAll.deviceInfo.switch === 1) {
                        needRenderContent.push(item);
                    }
                    originSampleList.push(item);
                })
            } else { Toast.info('请配置表单模版'); return; }
        }
        // console.log('初次渲染数据:', needRenderContent);
        this.setState({
            switch: copyDataAll.deviceInfo.switch,
            data: needRenderContent,
            titleData: { title: copyDataAll.deviceInfo.sample_table_name, devicename: copyDataAll.deviceInfo.device_name }
        })
    }
    ///利用switch开关 切换要渲染的数据
    getTempData = (value) => {
        ///首先要将 originRecordList 和 originSampleList 合并 以sample为本，record替换对应的元素 生成最终的数据
        let copyRecordList = JSON.parse(JSON.stringify(originRecordList));
        let copySampleList = JSON.parse(JSON.stringify(originSampleList));
        for (let index = 0; index < copyRecordList.length; index++) {
            const recordElement = copyRecordList[index];
            for (let index = 0; index < copySampleList.length; index++) {
                const sampleElement = copySampleList[index];
                if (sampleElement.key === recordElement.key && recordElement.bug_id) {
                    copySampleList[index] = recordElement;
                }
            }
        }
        let newList = [];
        if (value) { newList = copySampleList }
        else {
            copySampleList.forEach((item) => {
                if (item.type_id !== '10' && item.type_id !== '11') {
                    newList.push(item);
                }
            })
        }
        // console.log('切换后的渲染数据：', newList);
        this.setState({
            data: newList
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
            if (item.type_id === '12') { delete item.deviceInfo }
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
        recordData.switch = this.state.switch;
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
                    HttpApi.updateDeviceStatus({ id: recordData.device_id }, { $set: { status: recordData.device_status, switch: recordData.switch } }, (res) => {
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
                        oneDevice.switch = oneDevice.switch ///将record的switch替换到设备的switch
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
    renderItem = (item, index) => {
        let component = null
        if (item.type_id === '10' || item.type_id === '11') { /// 10测温  11测振组件
            let unitStr = item.type_id === '10' ? '°C' : 'mm';
            let magLft = item.type_id === '10' ? 20 : 10;
            let new_title_name = item.title_name;
            let collectValue = this.state.data[index].value;
            let showValue = collectValue ? (item.type_id === '11' ? (parseFloat(collectValue) / 1000).toFixed(3) : parseFloat(collectValue)) : ''
            component = <View key={index} style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'column', borderBottomColor: "#F0F0F0", borderBottomWidth: 1, paddingBottom: 10, paddingTop: 10 }}>
                <View style={{ marginBottom: 5 }}>
                    <Text style={{ fontSize: 14, alignSelf: 'flex-start' }}>{new_title_name}</Text>
                </View>
                <View style={{ flexDirection: 'row-reverse' }}>
                    <Button
                        style={{ alignSelf: 'center' }} size='small' type='primary'
                        onPress={() => { this.collectHandler(item, index) }}
                    >
                        {item.isCollecting ? '停止' : '采集'}
                    </Button>
                    <View style={{ flexDirection: 'row', marginRight: 30 }}>
                        <View style={{ alignSelf: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#DDDDDD', width: 80, height: 30, backgroundColor: '#F0F0F0' }}>
                            <Text style={{ marginTop: 4 }}>{showValue}</Text>
                        </View>
                        <Text style={{ fontSize: 15, color: '#000000', alignSelf: 'center', marginLeft: magLft }}>{unitStr}</Text>
                    </View>
                </View>
            </View>
        }
        else if (item.type_id === '12') { ///通用组件
            component = <TouchableHighlight
                key={index}
                underlayColor='#EDEDED'
                style={{ flex: 1, flexDirection: "row", alignItems: 'center', borderBottomColor: '#F0F0F0', borderBottomWidth: 1 }}
                onPress={() => {
                    item.deviceInfo = copyDataAll.deviceInfo;
                    item.callBackBugId = this.callBackBugId;
                    item.callBackIsChecked = this.callBackIsChecked;
                    this.props.navigation.navigate('ReportView2', item)
                }}>
                <View style={{ flex: 1, flexDirection: 'column', paddingBottom: 10, paddingTop: 10 }}>
                    <Text style={{ fontSize: 14 }}>{item.title_name}</Text>
                    <View style={{ flexDirection: 'row-reverse' }}>
                        <Image style={{ width: 20, height: 20, marginLeft: 10 }} source={require('../../assets/jt.png')} />
                        <Image style={{ width: 24, height: 24, display: item.bug_id ? 'flex' : 'none' }} source={require('../../assets/red_flag.png')} />
                        <Image style={{ width: 24, height: 24, display: item.bug_id ? 'none' : (item.isChecked ? 'flex' : 'none') }} source={require('../../assets/green_flag.png')} />
                    </View>
                </View>
            </TouchableHighlight >
        } else if (item.type_id === '2') { ///数字输入框
            component = <View key={index} style={{ flex: 1, flexDirection: 'column', paddingBottom: 10, paddingTop: 10 }}>
                <Text style={{ fontSize: 14 }}>{item.title_name}</Text>
                <View>
                    <InputItem type='number' placeholder='数字输入' onChange={(v) => {
                        this.state.data[index].value = v + '';
                        this.setState({ data: this.state.data })///修改输入数据
                    }} ></InputItem>
                </View>
            </View>
        } else if (item.type_id === '6') {///图片选择器
            component = <View key={index} style={{ flex: 1, flexDirection: 'column', paddingBottom: 10, paddingTop: 10 }}>
                <Text style={{ fontSize: 14 }}>{item.title_name}</Text>
                <View style={{ marginTop: 5, alignItems: 'center' }}>
                    <SelectPhoto onChange={(value) => this.photoChangeHandler(value, index)} />
                </View>
            </View>
        } else if (item.type_id === '13') {///副标题组件
            component = <View key={index} style={{ flex: 1, flexDirection: 'column', paddingBottom: 10, paddingTop: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#555555' }}>{item.title_name}</Text>
            </View>
        }
        return component
    }

    photoChangeHandler = (value, index) => {
        let imgLocalPathArr = [];
        value.forEach(element => {
            imgLocalPathArr.push(element.uri);
        });
        let copyList = JSON.parse(JSON.stringify(this.state.data));
        copyList[index].value = imgLocalPathArr;
        this.setState({ data: copyList })///修改输入数据
    }

    /**
     * 采集操作
     * 开始整体处理数据
     */
    collectHandler = (item, index) => {
        if (this.state.isConnectedDevice === false) {
            Toast.info('请先连接测具!');
            return;
        }
        if (item && item.isCollecting === false) {///如果 button 字面 是 '采集' 开始采集
            if (currentCollectIndex !== null) {///如果当前已经有正在采集的项  提示用户 先完成当前的采集工作
                Toast.info('请先完成当前的采集工作，再开始下一项');
                return;
            } else {
                currentCollectIndex = index;///保留当前选中的index值
                let copy = JSON.parse(JSON.stringify(this.state.data));
                let tempList = copy.map((item, myIndex) => { if (myIndex === index) { item.isCollecting = true; } return item })
                this.setState({
                    data: tempList
                })
                //开始采集操作
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
                        <View style={{ width: screenW, height: 70, backgroundColor: '#41A8FF', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>设备点检</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}> {this.state.switch === 1 ? '运行' : '停运'}</Text>
                                <Switch
                                    style={{ marginTop: 15, marginRight: 20 }}
                                    checked={this.state.switch === 1}
                                    onChange={(v) => {
                                        this.setState({ switch: v ? 1 : 0 })
                                        this.getTempData(v)
                                    }}
                                />
                            </View>
                            {/* <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>{this.state.switch === 0 ? '运行' : '停运'}</Text> */}
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                            <Text style={{ margin: 10, fontSize: 18, color: '#000000' }}>{this.state.titleData ? this.state.titleData.devicename : ''}</Text>
                        </View>
                    </View>
                    <ScrollView style={{ width: screenW * 0.95, height: screenH - 130 }}>
                        {this.state.data.map((item, index) => {
                            return this.renderItem(item, index)
                        })}
                    </ScrollView>
                    <Button loading={this.state.isLoading} disabled={this.state.isLoading} style={{ marginTop: 10, marginBottom: 10, width: screenW * 0.9 }} type='primary' onPress={this.upLoadRecordHandler}>
                        {this.state.isLoading ? '正在上传' : '确定上传'}
                    </Button>
                </View>
            </Provider >
        );
    }
}
