import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image, TouchableOpacity, DeviceEventEmitter } from 'react-native'
import { Button, TextareaItem, Picker, List, Toast, Portal } from '@ant-design/react-native'
import AppData from '../util/AppData'
import SelectPhoto from '../modeOfPhoto/SelectPhoto';
import HttpApi from '../util/HttpApi';
import DeviceStorage, { LOCAL_BUGS, MAJOR_INFO, AREA12_INFO, BUG_LEVEL_INFO } from '../util/DeviceStorage'
import ToastExample from '../util/ToastExample'
import moment from 'moment'
import { pushNoticeHandler } from '../util/Tool'

const screenW = Dimensions.get('window').width;
const screenH = Dimensions.get('window').height;
var imgLocalPathArr = [];
/**
 * 独立的问题报表模块，直接点击调出该模块
 */
class ReportIndependentView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            enableScrollViewScroll: true,
            warning_level_data: [],
            warning_level_select: [],
            descripTxt: '',
            areaArr: [], ///暂时只支持一级区域选择
            areaId_select: [], ///选择的areaId [x]
            majorArr: [],
            majorValue: [],
            isLoading: false,
            tempratureValue: null, /// 温度值
            shakeValue: null, /// 振动值
            isConnectedDevice: false, /// 是否连接测具
            isCollectingTemp: false, /// 是否正在采集温度
            isCollectingShake: false, /// 是否正在采集振动
        }
    }
    componentDidMount() {
        this.init();

    }
    setVib = (e) => {
        this.setState({ shakeValue: parseFloat(e.value / 1000).toFixed(3) })
    }
    setTmp = (e) => {
        this.setState({ tempratureValue: e.value + '' })
    }
    init = async () => {
        let major_result = [];
        let bug_level_result = [];
        let major_info = await DeviceStorage.get(MAJOR_INFO);
        if (major_info) {
            major_info.majorInfo.forEach((item) => {
                major_result.push({ label: item.name, value: item.id });
            })
        }
        let area12_info = await DeviceStorage.get(AREA12_INFO);
        let bug_level_info = await DeviceStorage.get(BUG_LEVEL_INFO);
        if (bug_level_info) {
            bug_level_info.bugLevelInfo.forEach((item) => {
                bug_level_result.push({ label: item.name, value: item.id });
            })
        }
        this.setState({
            warning_level_data: bug_level_result,
            majorArr: major_result,
            areaArr: area12_info.area12Info
        })
    }
    collecttempHandler = () => {
        DeviceEventEmitter.removeListener('tmpEvent', this.setTmp);
        DeviceEventEmitter.removeListener('vibEvent', this.setVib);
        ToastExample.isConnected((isConnectedDevice) => {
            if (isConnectedDevice) {
                if (this.state.isCollectingShake) {
                    Toast.info('请先完成振动的采集工作，再开始下一项');
                    return;
                }
                DeviceEventEmitter.addListener('tmpEvent', this.setTmp);
                if (!this.state.isCollectingTemp) {
                    this.setState({
                        isCollectingTemp: true
                    })
                    ToastExample.collectTmp(v => { });
                } else {
                    ToastExample.stopCollect();
                    DeviceEventEmitter.removeListener('tmpEvent', this.setTmp);
                    DeviceEventEmitter.removeListener('vibEvent', this.setVib);
                    this.setState({
                        isCollectingTemp: false
                    })
                }
            } else {
                Toast.info('请先连接测具!');
            }
        })
    }

    collectshakeHandler = () => {
        DeviceEventEmitter.removeListener('tmpEvent', this.setTmp);
        DeviceEventEmitter.removeListener('vibEvent', this.setVib);
        ToastExample.isConnected((isConnectedDevice) => {
            if (isConnectedDevice) {
                if (this.state.isCollectingTemp) {
                    Toast.info('请先完成温度的采集工作，再开始下一项');
                    return;
                }
                DeviceEventEmitter.addListener('vibEvent', this.setVib);
                if (!this.state.isCollectingShake) {
                    this.setState({
                        isCollectingShake: true
                    })
                    ToastExample.collectVib(v => { });
                } else {
                    ToastExample.stopCollect();
                    DeviceEventEmitter.removeListener('tmpEvent', this.setTmp);
                    DeviceEventEmitter.removeListener('vibEvent', this.setVib);
                    this.setState({
                        isCollectingShake: false
                    })
                }
            } else {
                Toast.info('请先连接测具!');
            }
        })
    }
    getLevel = () => {
        return (
            <View style={{ width: screenW * 0.9 }}>
                <List style={{ width: screenW * 0.9 }}>
                    <Picker data={this.state.warning_level_data} cols={1}
                        itemStyle={{ height: 30, marginTop: 8, fontSize: 15 }}
                        value={Array.from(this.state.warning_level_select)}
                        onChange={(v) => { this.setState({ warning_level_select: v }) }}
                    >
                        <List.Item arrow="horizontal"><Text style={{ marginLeft: -15, color: '#000000', fontSize: 15 }}>紧急类型</Text></List.Item>
                    </Picker>
                </List>
            </View >
        )
    }
    getOneMajorPicker = () => {
        return (<View style={{ width: screenW * 0.9 }}>
            <List style={{ width: screenW * 0.9 }}>
                <Picker
                    data={this.state.majorArr}
                    cols={1}
                    itemStyle={styles.itemStyle}
                    value={this.state.majorValue}
                    onChange={(v) => {
                        this.setState({ majorValue: v })
                    }}
                >
                    <List.Item arrow="horizontal" wrap><Text style={{ marginLeft: -15, color: '#000000', fontSize: 15 }}>缺陷专业</Text></List.Item>
                </Picker>
            </List>
        </View>)
    }
    getCollectOftemp = () => {
        return (<View style={{ width: screenW * 0.9 }}>
            <View style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'row', borderBottomColor: "#DDDDDD", borderBottomWidth: 1, paddingBottom: 10, paddingTop: 10 }}>
                <View>
                    <Text style={{ fontSize: 15, color: '#000000', alignSelf: 'flex-start' }}>测温组件</Text>
                </View>
                <View style={{ flexDirection: 'row-reverse' }}>
                    <Button
                        style={{ alignSelf: 'center' }} size='small' type='primary'
                        onPress={() => { this.collecttempHandler() }}
                    >
                        {this.state.isCollectingTemp ? '停止' : '采集'}
                    </Button>
                    <View style={{ flexDirection: 'row', marginRight: 30 }}>
                        <View style={{ alignSelf: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#DDDDDD', width: 80, height: 30, backgroundColor: '#D0D0D0' }}>
                            <Text style={{ marginTop: 4 }}>{this.state.tempratureValue}</Text>
                        </View>
                        <Text style={{ fontSize: 15, color: '#000000', alignSelf: 'center', marginLeft: 20 }}>°C</Text>
                    </View>
                </View>
            </View>
        </View>)
    }
    getCollectOfshake = () => {
        return (<View style={{ width: screenW * 0.9 }}>
            <View style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'row', borderBottomColor: "#DDDDDD", borderBottomWidth: 1, paddingBottom: 10, paddingTop: 10 }}>
                <View>
                    <Text style={{ fontSize: 15, color: '#000000', alignSelf: 'flex-start' }}>测振组件</Text>
                </View>
                <View style={{ flexDirection: 'row-reverse' }}>
                    <Button
                        style={{ alignSelf: 'center' }} size='small' type='primary'
                        onPress={() => { this.collectshakeHandler() }}
                    >
                        {this.state.isCollectingShake ? '停止' : '采集'}
                    </Button>
                    <View style={{ flexDirection: 'row', marginRight: 30 }}>
                        <View style={{ alignSelf: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#DDDDDD', width: 80, height: 30, backgroundColor: '#D0D0D0' }}>
                            <Text style={{ marginTop: 4 }}>{this.state.shakeValue}</Text>
                        </View>
                        <Text style={{ fontSize: 15, color: '#000000', alignSelf: 'center', marginLeft: 10 }}>mm</Text>
                    </View>
                </View>
            </View>
        </View>)
    }
    getAreaInput = () => {
        return (<View style={{ width: screenW * 0.9 }}>
            <List style={{ width: screenW * 0.9 }}>
                <Picker
                    data={this.state.areaArr}
                    cols={2}
                    itemStyle={{ height: 30, marginTop: 8, fontSize: 15 }}
                    value={this.state.areaId_select}
                    format={(labels) => { return labels.join('/'); }}
                    onChange={(v) => {
                        this.setState({ areaId_select: v })
                    }}
                >
                    <List.Item arrow="horizontal" wrap><Text style={{ marginLeft: -15, color: '#000000', fontSize: 15 }}>所属区域</Text></List.Item>
                </Picker>
            </List>
        </View>)
    }
    getOneTextArea = () => {
        return (<View style={{ marginTop: 20, width: screenW * 0.9 }}>
            <Text style={{ color: '#000000', marginBottom: 10, fontSize: 15 }}>问题描述</Text>
            <TextareaItem
                value={this.state.descripTxt}
                rows={5}
                placeholder="请输入备注"
                style={{ paddingVertical: 5, backgroundColor: '#f0f0f0', borderRadius: 5 }}
                onChange={(value) => {
                    this.setState({ descripTxt: value })
                }}
            />
        </View>)
    }
    getOneImagePicker = () => {
        return (<View style={{ marginTop: 20, width: screenW * 0.9 }}
            onStartShouldSetResponderCapture={() => {
                if (imgLocalPathArr.length > 2) {
                    this.setState({ enableScrollViewScroll: false });
                }
                if (this._myScroll.contentOffset === 0 && this.state.enableScrollViewScroll === false) {
                    this.setState({ enableScrollViewScroll: true });
                }
            }}
        >
            <Text style={{ color: '#000000', marginBottom: 10, fontSize: 15 }}>图片补充</Text>
            <SelectPhoto ref={mySelectPhoto => (this._mySelectPhoto = mySelectPhoto)} onChange={(value) => this.photoChangeHandler(value)} />
        </View>)
    }
    photoChangeHandler = (value) => {
        imgLocalPathArr.length = 0;
        value.forEach(element => {
            imgLocalPathArr.push(element.uri);
        });
    }
    uploadDataHandler = async () => {
        if (this.state.isCollectingTemp || this.state.isCollectingShake) {
            Toast.info('请先完成采集工作，再上传');
            return;
        }
        if (!this.state.majorValue || this.state.warning_level_select.length === 0 || this.state.descripTxt.length === 0 || this.state.areaId_select.length === 0) {
            Toast.fail('请完善信息：缺陷专业、紧急类型、所在区域、问题描述', 2);
            return;
        }
        // if (AppData.isNetConnetion) {
        //     this.setState({ isLoading: true })
        //     var key = Toast.loading('数据上传中...')
        //     let netUriArr = [];
        //     if (imgLocalPathArr.length > 0) {
        //         for (const imgPath of imgLocalPathArr) {
        //             let imgfile = { uri: imgPath, type: 'multipart/form-data', name: 'image.jpg' }
        //             let formData = new FormData()
        //             formData.append('file', imgfile)
        //             let netUri = await this.uploadImage(formData)
        //             netUriArr.push(netUri);
        //         }
        //     }
        //     let reportData = { select: '', majorId: this.state.majorValue[0], text: this.state.descripTxt, imgs: netUriArr }
        //     let resultData = {
        //         user_id: AppData.user_id,
        //         content: JSON.stringify(reportData),
        //         buglevel: this.state.warning_level_select[0],
        //         area_remark: this.state.areaId_select[this.state.areaId_select.length - 1],
        //         major_id: this.state.majorValue[0],
        //         checkedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        //     }
        //     HttpApi.uploadBugs(resultData, (res) => {
        //         Portal.remove(key)
        //         this.setState({ isLoading: false })
        //         if (res.data.code === 0) {
        //             Toast.success(<Text style={{ fontSize: 18 }}>上传成功!注意不要重复上传相同的缺陷</Text>, 5);
        //             this.cleanHandler()
        //             pushNoticeHandler(this.state.majorValue);
        //         } else {
        //             Toast.fail(<Text style={{ fontSize: 18 }}>上传失败!请检查网络或文本只能包含文字</Text>, 5);
        //         }
        //     })
        // } else {
        //     this.saveBugInfoInLocal();
        // }
        ///统一走缓存方式
        this.saveBugInfoInLocal();
    }

    saveBugInfoInLocal = async () => {
        let reportData = { select: '', majorId: this.state.majorValue[0], text: this.state.descripTxt, imgs: imgLocalPathArr }
        let resultData = {
            user_id: AppData.user_id,
            content: JSON.stringify(reportData),
            buglevel: parseInt(this.state.warning_level_select[0] + ''),
            area_remark: this.state.areaId_select[1],
            major_id: this.state.majorValue[0],
            checkedAt: moment().format('YYYY-MM-DD HH:mm:ss')
        }
        let storageBugs = await DeviceStorage.get(LOCAL_BUGS);
        if (storageBugs) {
            storageBugs.localBugs.push(resultData);
            await DeviceStorage.update(LOCAL_BUGS, { "localBugs": storageBugs.localBugs })
        } else {
            await DeviceStorage.save(LOCAL_BUGS, { "localBugs": [resultData] })
        }
        ToastExample.pushDataToTxt("bugs", JSON.stringify(resultData), (res) => {
            if (res) {
                Toast.success('此条缺陷信息本地存储成功\n注意不要重复上传相同的缺陷', 2);
            } else {
                Toast.fail('本地存储失败，请检查是否开启存储权限', 3);
            }
        })
        // Toast.success(<Text style={{ fontSize: 18 }}>缓存成功!注意不要重复上传相同的缺陷</Text>, 3);
        this.cleanHandler()
    }
    uploadImage = (formData) => {
        return new Promise((resolve, reject) => {
            let result = ''
            HttpApi.uploadFile(formData, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data;
                }
                resolve(result);
            })
        })
    }
    cleanHandler = () => {
        if (imgLocalPathArr.length > 0) {
            this._mySelectPhoto.removeAll();
        }
        this.setState({
            warning_level_select: [],
            descripTxt: '',
            areaId_select: [],
            majorValue: [],
            tempratureValue: null,
            shakeValue: null,
        })
    }
    render() {
        return (
            <View style={styles.mainView}>
                <View style={{ width: screenW, height: 70, backgroundColor: '#41A8FF', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>缺陷报告</Text>
                    <TouchableOpacity
                        onPress={() => { this.cleanHandler() }}
                    >
                        <Image style={{ width: 30, height: 30, marginRight: 10, marginTop: 28 }} source={require('../../assets/clean.png')} />
                    </TouchableOpacity>
                </View>
                <View
                    onStartShouldSetResponderCapture={() => {
                        this.setState({ enableScrollViewScroll: true });
                    }}
                    style={{ height: screenH - 110 }}
                >
                    <ScrollView
                        keyboardShouldPersistTaps={'always'}
                        style={styles.scrollView}
                        scrollEnabled={this.state.enableScrollViewScroll}
                        ref={myScroll => (this._myScroll = myScroll)}>
                        {/* 表头 */}
                        <View style={{ width: screenW * 0.9, alignSelf: 'center' }}>
                            {this.getLevel()}
                            {this.getOneMajorPicker()}
                            {this.getAreaInput()}
                            {this.getCollectOftemp()}
                            {this.getCollectOfshake()}
                            {this.getOneTextArea()}
                            {this.getOneImagePicker()}
                        </View>
                    </ScrollView>
                    <Button loading={this.state.isLoading} disabled={this.state.isLoading} style={{ marginTop: 10, marginBottom: 10, width: screenW * 0.9, alignSelf: 'center' }} type='primary' onPress={this.uploadDataHandler}>
                        {this.state.isLoading ? '正在上传' : '确定上传'}
                    </Button>
                </View>
            </View>
        );
    }
}

export default ReportIndependentView;

const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        alignItems: 'center',
    },
    scrollView: {
        width: screenW,
    },
    itemStyle: {
        height: 30,
        marginTop: 8,
        fontSize: 15,
    }
})