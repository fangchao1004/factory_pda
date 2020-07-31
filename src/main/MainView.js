import React, { Component } from 'react';
import TabNavigator from 'react-native-tab-navigator'
import { View, Platform, BackHandler, Image, StyleSheet, DeviceEventEmitter } from 'react-native'
import DeviceView from '../modeOfDevice/DeviceView'
import SelfView from '../modeOfSelf/SelfView';
import BindDeviceView from '../modeOfBindDevice/BindDeviceView';
import { Badge, Toast, Provider, Portal, Modal } from '@ant-design/react-native'
import AppData, { UPDATE_DEVICE_INFO, NET_CONNECT, NET_DISCONNECT } from '../util/AppData'
import AreaView from '../modeOfArea/AreaView';
import ReportIndependentView from "../modeOfReport/ReportIndependentView";
import NetInfo from '@react-native-community/netinfo'
import HttpApi from '../util/HttpApi';
import DeviceStorage, { USER_CARD, USER_INFO, NFC_INFO, DEVICE_INFO, SAMPLE_INFO, LOCAL_BUGS, LOCAL_RECORDS, MAJOR_INFO, LAST_DEVICES_INFO, AREA_INFO, AREA12_INFO, BUG_LEVEL_INFO, ALLOW_TIME } from '../util/DeviceStorage';
import { transfromDataTo2level, findDurtion, filterDevicesByDateScheme, bindWithSchemeInfo, pickUpMajorFromBugsAndPushNotice, logHandler } from '../util/Tool'
import moment from 'moment';
var isreadyOut = false;///准备退出
export default class MainView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedTab: 'a1',
        };
    }
    componentWillMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        }
    }
    componentDidMount() {
        isreadyOut = false;
        // console.log('登录成功。主界面加入节点');
        ///开启网络状态的监控功能。NetInfo
        this.startMonitorNet();
        ///登录成功，说明此时有网络。利用网络，将nfcs,devives,samples,表都缓存到本地。
        this.localDataSave();
    }
    componentWillUnmount() {
        isreadyOut = false;
        console.log('mainview 卸载');
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        }
        NetInfo.removeEventListener('connectionChange', this.netHandler);
    }
    render() {
        return (
            <Provider>
                <TabNavigator
                    tabBarStyle={styles.tab}
                >
                    <TabNavigator.Item
                        title="设备列表"
                        renderIcon={() => <Image style={styles.icon} source={require('../../assets/tabBar/deviceList2.png')} />}
                        renderSelectedIcon={() => <Image style={styles.icon} source={require('../../assets/tabBar/deviceList1.png')} />}
                        selected={this.state.selectedTab === 'a1'}
                        onPress={() => this.onChangeTab('a1')}
                    >
                        {this.renderContent(<DeviceView navigation={this.props.navigation} />)}
                    </TabNavigator.Item>

                    <TabNavigator.Item
                        renderIcon={() => <Image style={styles.icon} source={require('../../assets/tabBar/area2.png')} />}
                        renderSelectedIcon={() => <Image style={styles.icon} source={require('../../assets/tabBar/area1.png')} />}
                        title="设备区域"
                        renderBadge={() =>
                            <Badge style={styles.badge} text={0} />
                        }
                        selected={this.state.selectedTab === 'a2'}
                        onPress={() => this.onChangeTab('a2')}
                    >
                        {this.renderContent(<AreaView navigation={this.props.navigation} />)}
                    </TabNavigator.Item>

                    <TabNavigator.Item
                        renderIcon={() => <Image style={styles.icon} source={require('../../assets/tabBar/report2.png')} />}
                        renderSelectedIcon={() => <Image style={styles.icon} source={require('../../assets/tabBar/report1.png')} />}
                        title="缺陷报告"
                        renderBadge={() =>
                            <Badge style={styles.badge} text={0} />
                        }
                        selected={this.state.selectedTab === 'a3'}
                        onPress={() => this.onChangeTab('a3')}
                    >
                        {this.renderContent(<ReportIndependentView navigation={this.props.navigation} />)}
                    </TabNavigator.Item>

                    <TabNavigator.Item
                        renderIcon={() => <Image style={styles.icon} source={require('../../assets/tabBar/selfCenter2.png')} />}
                        renderSelectedIcon={() => <Image style={styles.icon} source={require('../../assets/tabBar/selfCenter1.png')} />}
                        title="个人中心"
                        renderBadge={() =>
                            <Badge style={styles.badge} text={0} />
                        }
                        selected={this.state.selectedTab === 'a4'}
                        onPress={() => this.onChangeTab('a4')}
                    >
                        {this.renderContent(<SelfView navigation={this.props.navigation} />)}
                    </TabNavigator.Item>
                    <TabNavigator.Item
                        renderIcon={() => <Image style={styles.icon} source={require('../../assets/tabBar/bind2.png')} />}
                        renderSelectedIcon={() => <Image style={styles.icon} source={require('../../assets/tabBar/bind1.png')} />}
                        title="测具绑定"
                        renderBadge={() =>
                            <Badge style={styles.badge} text={0} />
                        }
                        selected={this.state.selectedTab === 'a5'}
                        onPress={() => this.onChangeTab('a5')}
                    >
                        {this.renderContent(<BindDeviceView navigation={this.props.navigation} />)}
                    </TabNavigator.Item>
                </TabNavigator>
            </Provider>
        );
    }

    renderContent(pageView) {
        return (
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#feffff' }}>
                {pageView}
            </View>
        );
    }

    onChangeTab(tabName) {
        this.setState({
            selectedTab: tabName,
        });
    }

    onBackAndroid = () => {
        // if (this.props.navigation.isFocused()) {
        //     if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
        //         //最近2秒内按过back键，可以退出应用。
        //         AppData.loginFlag = false
        //         BackHandler.exitApp();
        //     }
        //     this.lastBackPressed = Date.now();
        //     ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
        //     return true;
        // }
        if (this.props.navigation.isFocused()) {
            if (!isreadyOut) {
                Modal.alert('注意', '是否确定要退出？请确保检测记录已经上传，离线状态下请勿退出', [
                    {
                        text: '取消', onPress: () => { isreadyOut = false; return; }
                    },
                    {
                        text: '确定退出', onPress: () => {
                            isreadyOut = false;
                            AppData.loginFlag = false;
                            AppData.username = null;
                            AppData.userNFC = null;
                            DeviceStorage.delete(USER_CARD);
                            DeviceStorage.delete(USER_INFO);
                            DeviceStorage.delete(LOCAL_BUGS);
                            DeviceStorage.delete(LOCAL_RECORDS);
                            BackHandler.exitApp();
                            return;
                        }
                    }
                ]);
            }
            isreadyOut = true;
            return true
        }
    }

    startMonitorNet = () => {
        //检测网络是否连接
        NetInfo.isConnected.fetch().done((isConnected) => {
            // console.log("检测网络是否连接:", isConnected);////true
        });
        //    检测网络连接信息
        NetInfo.fetch().done((connectionInfo) => {
            // console.log('当前检测网络连接信息:', connectionInfo); ///此时 一般为wifi 或 4g
        });
        //    检测网络变化事件
        NetInfo.addEventListener('connectionChange', this.netHandler)
    }
    netHandler = (networkType) => {
        // console.log('检测网络变化事件111:', networkType); ////{type: "wifi", effectiveType: "unknown"} 或 {type: "cellular", effectiveType: "4g"} 或 {type: "none", effectiveType: "unknown"}
        AppData.isNetConnetion = networkType.type !== 'none';
        // console.log("AppData.isNetConnetion:", AppData.isNetConnetion);
        if (AppData.isNetConnetion) {
            Toast.success('连接上网络', 1);
            DeviceEventEmitter.emit(NET_CONNECT);
            this.checkLocalStorageAndUploadToDB();
        } else {
            Toast.fail('网络断开', 1);
            DeviceEventEmitter.emit(NET_DISCONNECT);
        }
    }

    localDataSave = async () => {
        // console.log('重新登录后。执行所有数据的重新缓存操作。只在登录后执行一次');
        // console.log('所有的缓存进本地的设备状态   都有重置成 待检');

        let allow_time_info = await this.getAllowTimeInfo();
        // console.log('allow_time_info:', allow_time_info)
        let allowTimeInfo = await DeviceStorage.get(ALLOW_TIME)
        if (allowTimeInfo) { await DeviceStorage.update(ALLOW_TIME, { "allowTimeInfo": allow_time_info }); }
        else { await DeviceStorage.save(ALLOW_TIME, { "allowTimeInfo": allow_time_info }); }

        let needTimeDevicesList = this.getNeedDeviceList(allow_time_info);
        // console.log('当前时间段内默认需要渲染的设备id列表:', needTimeDevicesList)
        // if (needTimeDevicesList.length === 0) { }
        let deviceInfo = await this.getDeviceInfo(needTimeDevicesList);
        let deviceInfoFilter = filterDevicesByDateScheme(deviceInfo);///通过日期方案筛选后的设备列表
        // console.log('通过日期方案筛选后的设备信息列表:', deviceInfoFilter)
        ////状态先重置成待检 存在本地缓存中
        deviceInfoFilter.forEach((oneDevice) => { oneDevice.status = 3 })
        //////////////////////////////
        let device_info = await DeviceStorage.get(DEVICE_INFO);
        if (device_info) { await DeviceStorage.update(DEVICE_INFO, { "deviceInfo": deviceInfoFilter }) }
        else { await DeviceStorage.save(DEVICE_INFO, { "deviceInfo": deviceInfoFilter }) }

        let allArea3ArrDistinct = Array.from(new Set(deviceInfoFilter.map((item) => item.area_id)))///当前须检设备的所属三级区域id(去重复)
        let nfcInfo = await this.getNfcInfo();
        let nfc_info = await DeviceStorage.get(NFC_INFO);
        if (nfc_info) { await DeviceStorage.update(NFC_INFO, { "nfcInfo": nfcInfo }) }
        else { await DeviceStorage.save(NFC_INFO, { "nfcInfo": nfcInfo }) }

        let sampleInfo = await this.getSampleWithSchemeInfo();///所有的 包含了对应的方案的 模版数据
        // console.log('sampleInfo:', sampleInfo)
        let sample_info = await DeviceStorage.get(SAMPLE_INFO);
        if (sample_info) { await DeviceStorage.update(SAMPLE_INFO, { "sampleInfo": sampleInfo }) }
        else { await DeviceStorage.save(SAMPLE_INFO, { "sampleInfo": sampleInfo }) }

        let majorInfo = await this.getMajorInfo();
        let major_info = await DeviceStorage.get(MAJOR_INFO);
        if (major_info) { await DeviceStorage.update(MAJOR_INFO, { "majorInfo": majorInfo }) }
        else { await DeviceStorage.save(MAJOR_INFO, { "majorInfo": majorInfo }) }

        let areaInfo = await this.getAreaInfoInfo(allArea3ArrDistinct); /// 这里的areaInfo 默认是查第三级区域 后期可能会调整 用于设备区域模块的显示
        let area_info = await DeviceStorage.get(AREA_INFO);
        if (area_info) { await DeviceStorage.update(AREA_INFO, { "areaInfo": areaInfo }) }
        else { await DeviceStorage.save(AREA_INFO, { "areaInfo": areaInfo }) }

        let tempData = await this.getArea12InfoInfo();
        let area12Info = transfromDataTo2level(tempData);
        let area12_info = await DeviceStorage.get(AREA12_INFO);
        if (area12_info) { await DeviceStorage.update(AREA12_INFO, { "area12Info": area12Info }) }
        else { await DeviceStorage.save(AREA12_INFO, { "area12Info": area12Info }) }

        let last_devices_info = await this.getLastRecordsByAllDevices();
        let tempResult = bindWithSchemeInfo(last_devices_info, sampleInfo);///给每个设备的相关数据中，对应的某类sample,绑定上对应的方案数据scheme_data
        // console.log('tempResult:', tempResult)
        let result = await DeviceStorage.get(LAST_DEVICES_INFO)
        if (result) { await DeviceStorage.update(LAST_DEVICES_INFO, { "lastDevicesInfo": tempResult }); }
        else { await DeviceStorage.save(LAST_DEVICES_INFO, { "lastDevicesInfo": tempResult }); }

        let bug_level_info = await this.getBuglevelInfo();
        let buglevelInfo = await DeviceStorage.get(BUG_LEVEL_INFO)
        if (buglevelInfo) { await DeviceStorage.update(BUG_LEVEL_INFO, { "bugLevelInfo": bug_level_info }); }
        else { await DeviceStorage.save(BUG_LEVEL_INFO, { "bugLevelInfo": bug_level_info }); }

        if (deviceInfoFilter.length === 0) { Modal.alert('当前时间段内需要巡检的设备列表为空', '如确认数据缺失，则可点击重新获取按钮后等待数秒；若仍为空或无反应则请检查网络环境或重新启动应用', [{ text: '重新获取', onPress: () => { this.localDataSave() } }, { text: '取消' }]) }
        else {
            Modal.alert('设备数据字典本地备份完成', '可以进行离线打点操作', [{ text: '确定' }])
        }
        ///设备信息 重置好后，通知 DeviceTabs 去获取。
        // console.log('设备信息 重置好后，通知 DeviceTabs 去获取。111'); ///这里没执行。上方代码有误
        DeviceEventEmitter.emit(UPDATE_DEVICE_INFO);
    }

    getNeedDeviceList = (allowTimeList) => {
        let targetItem = findDurtion(allowTimeList);
        // console.log('targetItem:', targetItem);
        let devicesList = [];
        if (targetItem && targetItem.select_map_device && targetItem.select_map_device.split(',').length > 0) {
            devicesList = targetItem.select_map_device.split(',');
        }
        // console.log('devicesList:', devicesList)
        return devicesList;
    }

    getAllowTimeInfo = () => {
        return new Promise((resolve, reject) => {
            // let sql = `select * from allow_time where effective = 1`;
            let sql = `select a_t.id,a_t.begin,a_t.end,a_t.isCross,a_t.name,GROUP_CONCAT(a_m_d.device_id) as select_map_device from allow_time a_t
            left join (select * from allowTime_map_device where effective = 1) a_m_d
            on a_t.id = a_m_d.allow_time_id
            where a_t.effective = 1 and a_t.area0_id = ${AppData.area0_id}
            group by a_t.id`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }

    getBuglevelInfo = () => {
        return new Promise((resolve, reject) => {
            HttpApi.getBugLevel({ effective: 1 }, (res) => {
                let result = []
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }

    /**
     * 所有设备最近一次的巡检记录-还有sample模版
     */
    getLastRecordsByAllDevices = () => {
        return new Promise((resolve, reject) => {
            let result = [];
            let sql = `select d.id as device_id,d.name as device_name,d.type_id as device_type_id,dts.name as device_type_name,dts.sample_name as sample_table_name ,d.nfc_id,nfcs.name as nfc_name,nfcs.nfcid,d.area_id,rt.id as last_record_id,rt.device_status,samples.content as sp_content,rt.content as rt_content,rt.user_id,users.name as user_name,rt.createdAt as rt_createdAt,rt.updatedAt as rt_updatedAt
            ,concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name, d.switch
            from devices d 
            left join ( select * from (select max(a.id) as maxid from (select * from records where records.effective = 1) a group by a.device_id) t left join (select * from records where records.effective = 1) r on t.maxid = r.id) rt
            on d.id = rt.device_id 
            left join (select * from device_types where device_types.effective = 1) dts on dts.id = d.type_id 
            left join (select * from area_3 where effective = 1) area_3 on area_3.id = d.area_id
            left join (select * from area_2 where effective = 1) area_2 on area_2.id = area_3.area2_id 
            left join (select * from area_1 where effective = 1) area_1 on area_1.id = area_2.area1_id
            left join (select * from users where users.effective = 1) users on users.id = rt.user_id 
            left join (select * from samples where samples.effective = 1) samples on d.type_id = samples.device_type_id 
            left join (select * from nfcs where nfcs.effective = 1) nfcs on d.nfc_id = nfcs.id
            where d.effective = 1
            order by d.id`
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data;
                }
                resolve(result);
            })
        })
    }
    getAreaInfoInfo = (area3Idlist = []) => {
        return new Promise((resolve, reject) => {
            let result = [];
            let tempSql = ''
            if (area3Idlist.length > 0) {
                tempSql = `and id in (${area3Idlist.join(',')})`
            } else {
                resolve(result);
            }
            let sql = `select * from area_3 where effective = 1 ${tempSql} order by id`
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code == 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    getArea12InfoInfo = () => {
        return new Promise((resolve, reject) => {
            let result = [];
            let sql = `select area_1.id as area1_id , area_1.name as area1_name, area_2.id as area2_id ,area_2.name as area2_name from area_1
            left join (select * from area_2 where effective = 1)area_2 on area_1.id = area_2.area1_id
            where area_1.effective = 1 and area0_id = ${AppData.area0_id}
            order by area_1.id`
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code == 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    getNfcInfo = () => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getNFCInfo({ effective: 1 }, (res) => {
                if (res.data.code == 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    getDeviceInfo = (needTimeDevicesList) => {
        return new Promise((resolve, reject) => {
            let result = [];
            let sql1 = needTimeDevicesList && needTimeDevicesList.length > 0 ? `and d.id in (${needTimeDevicesList.join(',')})` : resolve(result);;
            let sql = `select d.*,n.name as nfc_name,dt.name as type_name,
            concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name,
            group_concat(distinct date_value) as date_value_list,group_concat(distinct title) as scheme_title,group_concat(distinct scheme_of_cycleDate.id) as sche_cyc_id,group_concat(distinct scheme_of_cycleDate.cycleDate_id) as cycleDate_id
            from devices d 
            left join (select * from nfcs where nfcs.effective = 1) n on n.id=d.nfc_id 
            left join (select * from device_types where device_types.effective = 1) dt on d.type_id = dt.id 
            left join (select * from area_3 where effective = 1) area_3 on area_3.id = d.area_id 
            left join (select * from area_2 where effective = 1) area_2 on area_2.id = area_3.area2_id 
            left join (select * from area_1 where effective = 1) area_1 on area_1.id = area_2.area1_id
            left join (select * from sche_cyc_map_device where effective = 1) sche_cyc_map_device on sche_cyc_map_device.device_id = d.id
            left join (select * from scheme_of_cycleDate where effective = 1) scheme_of_cycleDate on scheme_of_cycleDate.id = sche_cyc_map_device.scheme_id
            left join (select * from sche_cyc_map_date where effective = 1) sche_cyc_map_date on sche_cyc_map_date.scheme_id = sche_cyc_map_device.scheme_id
            where d.effective = 1 ${sql1} and d.area0_id = ${AppData.area0_id}
            group by d.id`
            // console.log('sql:', sql)
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getSampleWithSchemeInfo = () => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getSampleWithSchemeInfo({ area0_id: AppData.area0_id }, (res) => {
                if (res.data.code == 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    // getSampleInfo = () => {
    //     return new Promise((resolve, reject) => {
    //         let result = [];
    //         HttpApi.getDeviceSampleByTypeId({ effective: 1 }, (res) => {
    //             if (res.data.code == 0) { result = res.data.data }
    //             resolve(result);
    //         })
    //     })
    // }
    getMajorInfo = () => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getMajorInfo({ effective: 1 }, (res) => {
                if (res.data.code == 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    checkLocalStorageAndUploadToDB = async () => {
        console.log('连接上网络,并且检查本地缓存,上传至数据库,checkLocalStorageAndUploadToDB')
        let key;
        let bugs = await DeviceStorage.get(LOCAL_BUGS);
        let records = await DeviceStorage.get(LOCAL_RECORDS);
        let newBugsArrhasBugId = [];
        if (bugs || records) { key = Toast.loading('缓存信息上传中,请勿断网,否则可能会产生问题...', 0); }
        if (bugs && bugs.localBugs.length > 0) {
            // key = Toast.loading('缓存信息上传中...');
            // console.log('本地的待上传的bugs', bugs.localBugs);
            ///将这些缺陷中专业都提取出来。
            logHandler('1连接上网络,并且检查本地缓存发现有bugs,上传至数据库', AppData.username)
            pickUpMajorFromBugsAndPushNotice(bugs.localBugs);
            logHandler('2pickUpMajorFromBugsAndPushNotice', AppData.username)
            ///先将其中的imgs。进行转化。从本地文件路径。转化成网络的uri
            let newBugsArrhasNetImgUri = await this.changeImgsValue(bugs.localBugs);
            logHandler('3先将其中的imgs。进行转化。从本地文件路径。转化成网络的uri', AppData.username)
            ////先将bugs依次上传到数据库，获取bugid。
            newBugsArrhasBugId = await this.uploadbugsToDB(newBugsArrhasNetImgUri);
            logHandler('4先将bugs依次上传到数据库，获取bugid', AppData.username)
            // console.log('上传后的bugs包含bugid：', newBugsArrhasBugId); ///到这一步正常。获取到bugsid 的数组。
            ////缺陷都上传成功了。要删除本地缓存中的bugs数据
            await DeviceStorage.delete(LOCAL_BUGS)
            logHandler('5缺陷都上传成功了。要删除本地缓存中的bugs数据', AppData.username)
        }
        if (records && records.localRecords.length > 0) {
            ///将reocrds里面的bug_id，都去查一遍，去除那些在我巡检过程中就被消缺的bug
            // console.log('records.localRecords:', records.localRecords)
            logHandler('1连接上网络,并且检查本地缓存发现有records,上传至数据库', AppData.username)
            let localRecordsAfterFilter = await this.removeRecordsExistBugId(records.localRecords);///去除那些在我巡检过程中就被消缺的bug
            logHandler('2去除那些在巡检过程中就被消缺的bug', AppData.username)
            // console.log('localRecordsAfterFilter:', localRecordsAfterFilter)
            // return
            ////开始bugs和records的整合。目的是将bugsId正确的填充到 bug_id = -1 的地方。生成新的合理的records。
            let newRecordsHasReallyBugId = await this.linkBugsAndRecords(newBugsArrhasBugId, localRecordsAfterFilter);
            logHandler('3开始bugs和records的整合', AppData.username)
            // console.log('最新的newRecordsHasReallyBugId：：：：', newRecordsHasReallyBugId);
            // return
            let isOver = await this.uploadRecordsToDB(newRecordsHasReallyBugId);///只做是否全部上传，不考虑中间有上传失败的情况。会继续上传下一个record
            logHandler(`4isOver: ${isOver}`, AppData.username)
            if (isOver) {
                // let records = await DeviceStorage.get(LOCAL_RECORDS);
                // console.log('缓存信息都上传成功,上传后本地的缓存数据：', records)
                Portal.remove(key);
                Modal.alert('缓存的巡检数据上传完毕', '此次离线打点操作完成', [{ text: '确定' }])
                await DeviceStorage.delete(LOCAL_RECORDS)
                logHandler(`5缓存的巡检数据上传完毕`, AppData.username)
                // let sss = await DeviceStorage.get(LOCAL_RECORDS);
                // console.log('删除后的本地LOCAL_RECORDS缓存:', sss)
            }
        } else if (!records && newBugsArrhasBugId.length > 0) { ///如果只有缺陷数据,没有巡检数据
            logHandler(`此次上传只有缺陷数据,没有巡检数据`, AppData.username)
            Portal.remove(key);
            Modal.alert('缓存的缺陷数据上传完毕', '此此离线打点操作完成', [{ text: '确定' }])
        }
    }
    uploadRecordsToDB = async (finallyRecordsArr) => {
        let count = 0;
        for (let index = 0; index < finallyRecordsArr.length; index++) {
            count = index;
            const oneRecord = finallyRecordsArr[index];
            if (!oneRecord.isUploaded) {
                let uploadResult = await this.upLoadRecordInfo(oneRecord)///如果上传成功，就要立马改变LOCAL_RECORDS中这个record的状态 isUploaded = true;
                if (uploadResult.flag) {
                    await this.updateLocalRecordsInfo(oneRecord)
                }
                else {
                    console.log('上传失败的对象是：', oneRecord, uploadResult.error)///这里可以想办法，上传到后台
                    logHandler(JSON.stringify(oneRecord), JSON.stringify(uploadResult.error || []))
                }
            }
        }
        if (count === finallyRecordsArr.length - 1) {
            logHandler(`finallyRecordsArr 全部上传【可能有上传失败的】`, AppData.username)
            console.log('count:', count, '; finallyRecordsArr 全部上传【可能有上传失败的】')
            return true
        } else { return false }
    }
    ///改变LOCAL_RECORDS中这个record的状态 isUploaded = true;
    updateLocalRecordsInfo = async (oneRecord) => {
        let records = await DeviceStorage.get(LOCAL_RECORDS);
        let tempArr = JSON.parse(JSON.stringify(records.localRecords));
        tempArr.forEach((item) => {
            if (item.device_id === oneRecord.device_id && item.checkedAt === oneRecord.checkedAt) { item.isUploaded = true }
        })
        await DeviceStorage.update(LOCAL_RECORDS, { "localRecords": tempArr })
        return true;
    }
    upLoadRecordInfo = async (oneRecord) => {
        let contentArr = JSON.parse(oneRecord.content);
        for (let index = 0; index < contentArr.length; index++) {
            const element = contentArr[index];
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
        oneRecord.content = JSON.stringify(contentArr);
        return new Promise((resolve, reject) => {
            HttpApi.upLoadDeviceRecord(oneRecord, (res) => {
                if (res.data.code === 0) {
                    HttpApi.updateDeviceStatus({ id: oneRecord.device_id }, { $set: { status: oneRecord.device_status, switch: oneRecord.switch } }, (res) => {
                        if (res.data.code === 0) { resolve({ flag: true }) } else { resolve({ flag: false, error: res.data }) }
                    })
                } else { resolve({ flag: false, error: res.data }) }
            })
        })
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
    removeRecordsExistBugId = async (recordsArr) => {
        for (const oneRecord of recordsArr) {
            let contentObj = JSON.parse(oneRecord.content);////json解析。得到content的json对象（数组）
            for (const item of contentObj) {
                if (item.bug_id && item.bug_id !== -1) {
                    item.bug_id = await this.checkBugIsRemove(item.bug_id);///检查之前副本中的缺陷有没有被消缺 status=4 或 effecitve = 0
                }
            }
            oneRecord.content = JSON.stringify(contentObj);///json序列化。恢复原样
            ///再检查一次查看是否还有bug_id存在，如果还有bug_id，就把devices_status至成2
            oneRecord.device_status = 1;
            for (const item of contentObj) {
                if (item.bug_id || item.bug_id === -1) { oneRecord.device_status = 2 }
            }
        }
        return recordsArr;////到此。bug_id 替换(过滤)成功。返回新的recordArr
    }
    linkBugsAndRecords = async (newBugsArr, recordsArr) => {
        // console.log('linkBugsAndRecords');
        for (const oneRecord of recordsArr) {
            if (oneRecord.device_status === 2 && !oneRecord.isUploaded) {////status===2说明有故障。需要替换bug_id。 且没用上传过。
                let device_id = oneRecord.device_id;////当前设备的 device_id；
                let contentObj = JSON.parse(oneRecord.content);////json解析。得到content的json对象（数组）
                for (const item of contentObj) {
                    if (item.bug_id === -1) {
                        let key = item.key;///对应的题目 key
                        item.bug_id = await this.findReallyBugId(device_id, key, newBugsArr);///根据设备id 和 key 去newBugsArr中查询。替换出真正的bug_id
                    }
                }
                oneRecord.content = JSON.stringify(contentObj);///json序列化。恢复原样
            }
        }
        return recordsArr;////到此。bug_id 替换成功。返回新的recordArr
    }
    checkBugIsRemove = (bug_id) => {
        return new Promise((resolve, reject) => {
            HttpApi.getBugs({ id: bug_id }, (res) => {
                if (res.data.code === 0 && res.data.data.length > 0) {
                    let obj = res.data.data[0]
                    if (obj.effective === 1) {
                        if (obj.status === 4) {
                            resolve(null)
                        } else {
                            resolve(obj.id)
                        }
                    } else {
                        resolve(null)
                    }
                } else {
                    logHandler(`bug查询失败`, AppData.username)
                    resolve(null)
                }
            })
        })
    }
    ///这里会有一个问题。如果用户离线情况下。对同一个设备上传了多次record。都是两次都对同一个key(问题)，做出了提交。那么后面的就会覆盖之前的。
    findReallyBugId = (device_id, key, newBugsArr) => {
        return new Promise((resolve, reject) => {
            let result = null;
            for (const oneBug of newBugsArr) {
                ///从头循环到尾。只有符合条件。就会把bug_id。提取出来。所以存在bug_id。覆盖的问题。
                if (oneBug.device_id === device_id && oneBug.key === key) {
                    result = oneBug.bug_id
                }
            }
            resolve(result);
        })
    }

    changeImgsValue = async (localbugs) => {
        for (const oneBug of localbugs) {
            let contentObj = JSON.parse(oneBug.content);////获取到每一个bug的content数据。json解析
            let localImgPathArr = contentObj.imgs;//// 获取其中的imgs数组。（本地的文件路径数组）
            let netUriArr = [];
            if (localImgPathArr.length > 0) {
                for (const imgPath of localImgPathArr) {
                    let imgfile = { uri: imgPath, type: 'multipart/form-data', name: 'image.jpg' }
                    let formData = new FormData()
                    formData.append('file', imgfile)
                    let netUri = await this.uploadImage(formData)
                    netUriArr.push(netUri); ////生成网络的url地址。新数组
                }
                contentObj.imgs = netUriArr; ///将新数组替代 老的本地文件路径的数组
            }
            oneBug.content = JSON.stringify(contentObj);///再将cotent数据。json序列化。恢复原样
        }
        return localbugs;
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

    uploadbugsToDB = async (localbugs) => {
        for (const oneBug of localbugs) {
            oneBug.bug_id = await this.uploadHandler(oneBug);
        }
        return localbugs
    }

    uploadHandler = (oneBug) => {
        return new Promise((resolve, reject) => {
            let result = null;
            HttpApi.uploadBugs(oneBug, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data.id
                }
                resolve(result);
            })
        })
    }
}

const styles = StyleSheet.create({
    tab: {
        height: 50,
        // backgroundColor: '#222222',
        alignItems: 'center'
    },
    icon: {
        width: 25,
        height: 25,
        resizeMode: 'stretch',
        marginTop: 10
    },
    badge: {
        marginTop: 15,
    },
    badgeText: {
        color: 'white',
        alignSelf: 'center',
    }
})