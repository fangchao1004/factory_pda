import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, DeviceEventEmitter, Image, TouchableOpacity } from 'react-native'
import { InputItem, Toast, Modal, Button, Progress, Portal, WhiteSpace, WingBlank } from '@ant-design/react-native'
import DeviceStorage, { USER_CARD, USER_INFO, LOCAL_BUGS, LOCAL_RECORDS, DEVICE_INFO, AREA123_INFO } from '../util/DeviceStorage'
import AppData, { NET_CONNECT } from '../util/AppData'
import HttpApi from '../util/HttpApi'
import { logHandler, pickUpMajorFromBugsAndPushNotice, copyArrayItem } from '../util/Tool';
import ToastExample from '../util/ToastExample'

const screenW = Dimensions.get('window').width;
const DURINGTIME = 3;///toast 显示时长
export default class SelfView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userInfo: null,
            percent: 0,
            showProgress: false,
            writing: false,
            uploading: false,
            recordsNum: 0,
            bugsNum: 0,
            macAddress: '',
        }
    }
    componentWillReceiveProps() {
        if (!this.state.userInfo && AppData.isNetConnetion) { this.init() }
    }
    componentDidMount() {
        this.sub2 = DeviceEventEmitter.addListener(NET_CONNECT, this.refreshHandler);
        if (AppData.isNetConnetion) { this.init(); }
        else {
            this.getDataFromStorage();
        }
    }
    componentWillUnmount() {
        this.sub2.remove();
    }
    refreshHandler = () => {
        this.init();
    }
    init = async () => {
        ToastExample.getMac((macAddress) => {
            this.setState({ macAddress })
        })
        let userInfoData = {}
        let oneUserInfo = await this.getUserInfo();
        if (oneUserInfo[0].level_id) {
            let oneLevelInfo = await this.getLevelInfo(oneUserInfo[0].level_id);
            userInfoData = { ...oneUserInfo[0], levelname: oneLevelInfo[0].name, nfcid: AppData.userNFC }
        } else {
            userInfoData = { ...oneUserInfo[0], nfcid: AppData.userNFC }
        }

        let result = await this.getDataHandler();
        this.setState({
            userInfo: userInfoData,
            bugsNum: result.bugsList.length,
            recordsNum: result.recordsList.length,
        })
    }
    getDataFromStorage = () => {
        this.setState({
            userInfo: { name: AppData.name, username: AppData.username, levelname: AppData.levelname }
        })
    }
    getUserInfo = () => {
        return new Promise((resolve, reject) => {
            HttpApi.getUserInfo({ username: AppData.username }, (res) => {
                resolve(res.data.data);
            })
        })
    }
    getLevelInfo = (level_id) => {
        return new Promise((resolve, reject) => {
            HttpApi.getLevelInfo({ id: level_id, effective: 1 }, (res) => {
                resolve(res.data.data);
            })
        })
    }

    render() {
        return (
            <View style={styles.main}>
                <View style={{ width: screenW, height: 70, backgroundColor: '#41A8FF', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>个人中心</Text>
                    <TouchableOpacity
                        onPress={this.logoutHandler}
                    >
                        <Image style={{ width: 26, height: 26, marginRight: 10, marginTop: 28 }} source={require('../../assets/logout.png')} />
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 10, width: screenW * 0.9 }}>
                    {this.state.showProgress ?
                        <View style={{ height: 30 }}>
                            <View style={{ height: 4 }}>
                                <Progress percent={this.state.percent} />
                            </View>
                            <View style={{ marginTop: 6 }}>
                                <Text>当前进度: {this.state.percent}%</Text>
                            </View>
                        </View> :
                        null
                    }
                    <InputItem type={'text'} labelNumber={6} editable={false} value={this.state.userInfo ? this.state.userInfo.name : ''}>{'名称:'}</InputItem>
                    <InputItem type={'text'} labelNumber={6} editable={false} value={this.state.userInfo ? this.state.userInfo.username : ''}>{'登录账号:'}</InputItem>
                    <InputItem type={'text'} labelNumber={6} editable={false} value={this.state.userInfo ? this.state.userInfo.levelname : ''}>{'所属部门:'}</InputItem>
                    <InputItem type={'text'} labelNumber={6} editable={false} value={this.state.macAddress}>{'mac地址:'}</InputItem>
                    <InputItem type={'text'} labelNumber={6} editable={false} value={AppData.record[0].version || ''}>{'版本:'}</InputItem>
                    <InputItem type={'text'} labelNumber={6} editable={false} value={this.state.bugsNum + ''}>{'缺陷数量:'}</InputItem>
                    <InputItem type={'text'} labelNumber={6} editable={false} value={this.state.recordsNum + ''}>{'巡检数量:'}</InputItem>
                    <Button type="primary" style={{ marginTop: 24 }} onPress={() => { this.init() }}>刷新</Button>
                    <Button type="warning" style={{ marginTop: 24 }} disabled={this.state.uploading} loading={this.state.uploading} onPress={() => {
                        Modal.alert('注意', '确定上传本地数据吗?\n(上传成功后会清除本地数据)', [
                            {
                                text: '取消'
                            },
                            {
                                text: '确定', onPress: () => {
                                    if (AppData.isNetConnetion) {
                                        HttpApi.ping(async (res) => {
                                            if (res.flag) {
                                                // this.readDataFromTxt()
                                                ///直接读缓存（records 和 bugs） 如果机器崩了缓存还在
                                                let result = await this.getDataHandler();
                                                this.uploadDataFromLocalStorage(result.bugsList, result.recordsList);
                                            } else {
                                                this.setState({ uploading: false })
                                                logHandler('网络有问题')
                                                Toast.info('请检查网络是否能正常上网再点击上传', DURINGTIME);
                                            }
                                        })
                                    } else {
                                        Toast.info('请先连接网络再点击上传');
                                    }
                                }
                            }])
                    }}>上传巡检数据</Button>
                    {/* <Button type="warning" style={{ marginTop: 24 }} disabled={this.state.uploading} loading={this.state.uploading} onPress={() => {
                        Modal.alert('注意', '确定要强制删除本地的巡检和缺陷数据吗', [
                            {
                                text: '取消'
                            },
                            {
                                text: '强制删除', onPress: () => {
                                    console.log('强制删除')
                                }
                            }])
                    }}>强制删除巡检数据</Button> */}
                </View>
            </View >
        );
    }
    ////////////
    /**
     *将数据写入文本中
     */
    // getDataStorageAndWirteToTxt = async () => {
    //     this.setState({ writing: true })
    //     let bugs = await DeviceStorage.get(LOCAL_BUGS);
    //     let records = await DeviceStorage.get(LOCAL_RECORDS);
    //     if (!bugs && !records) { Toast.info('缓存中暂无数据,不需要写入文件', DURINGTIME); this.setState({ writing: false }); return }
    //     if (bugs && bugs.localBugs.length > 0) {
    //         ///将 bugs.localBugs 写入本地文件中；
    //         let bugsTxt = JSON.stringify(bugs.localBugs);
    //         ToastExample.writeToTxt(bugsTxt, "bugs", (res) => {
    //             if (res) {
    //                 Toast.success('缺陷写入成功', DURINGTIME);
    //                 DeviceStorage.delete(LOCAL_BUGS);
    //             } else {
    //                 Toast.fail('写入失败,请开启【存储空间权限】后再重新尝试');
    //                 this.setState({ writing: false });
    //                 return;
    //             }
    //         })
    //     }
    //     if (records && records.localRecords.length > 0) {
    //         let recordsTxt = JSON.stringify(records.localRecords);
    //         ToastExample.writeToTxt(recordsTxt, "records", (res) => {
    //             if (res) {
    //                 Toast.success('巡检写入成功', DURINGTIME);
    //                 DeviceStorage.delete(LOCAL_RECORDS);
    //             } else {
    //                 Toast.fail('写入失败,请开启【存储空间权限】后再重新尝试');
    //                 this.setState({ writing: false });
    //                 return;
    //             }
    //         })
    //     }
    //     this.setState({ writing: false });
    // }
    /**
     *从文本中读取数据
     */
    // readDataFromTxt = () => {
    //     // this.setState({ uploading: true })///上传中-按钮一直loading
    //     ///先从文件中读取数据，写进缓存
    //     ToastExample.readFromTxt('bugs', async (bugsTxt) => {
    //         if (bugsTxt) {
    //             // console.log('bugsTxt:', bugsTxt)///从文本中读取的bugsTxt
    //             try {
    //                 JSON.parse(bugsTxt)
    //             } catch (error) {
    //                 logHandler(`bugsTxt解析有问题:${error.message}`, bugsTxt)
    //                 Modal.alert('注意', '缺陷信息解析有问题，请联系管理员', [
    //                     { text: '确定' }])
    //                 return
    //             }
    //         }
    //         ///先从文件中读取数据，写进缓存
    //         ToastExample.readFromTxt('records', async (recordsTxt) => {
    //             if (recordsTxt) {
    //                 // console.log('recordsTxt:', recordsTxt)///从文本中读取的recordsTxt
    //                 try {
    //                     JSON.parse(recordsTxt)
    //                 } catch (error) {
    //                     logHandler(`recordsTxt解析有问题:${error.message}`, recordsTxt)
    //                     Modal.alert('注意', '巡检信息解析有问题，请联系管理员', [
    //                         { text: '确定' }])
    //                     return
    //                 }
    //             }
    //             if (!bugsTxt && !recordsTxt) {/// recordsTxt 和 bugsTxt 都不存在时
    //                 Toast.info('无巡检记录', DURINGTIME);
    //                 this.setState({ uploading: false });///按钮恢复可点击状态
    //             } else if (bugsTxt || recordsTxt) { ///recordsTxt 或 bugsTxt 只要有一个存在 缓存恢复成功,可以点击上传缓存数据
    //                 this.uploadDataFromTxt(bugsTxt, recordsTxt);
    //             }
    //         });
    //     });
    // }
    // deleteFile = () => {
    //     ToastExample.deleteFile("bugs", (_) => { })
    //     ToastExample.deleteFile("records", (_) => { })
    // }
    /////////////////////////////////////////////////////
    // uploadDataFromTxt = async (bugsTxt, recordsTxt) => {
    //     logHandler('开始上传');
    //     try {
    //         let newBugsArrhasBugId = [];
    //         if (bugsTxt) {
    //             let bugsList = JSON.parse(bugsTxt)
    //             pickUpMajorFromBugsAndPushNotice(bugsList);///将这些缺陷中专业都提取出来。
    //             let newBugsArrhasNetImgUri = await this.changeImgsValue(bugsList);///先将其中的imgs。进行转化。从本地文件路径。转化成网络的uri
    //             newBugsArrhasBugId = await this.uploadbugsToDB(newBugsArrhasNetImgUri); ///先将bugs依次上传到数据库，获取bugid。
    //             logHandler('uploadbugsToDB:完毕')
    //         }
    //         if (recordsTxt) {
    //             let recordsList = JSON.parse(recordsTxt)
    //             this.setState({ showProgress: true, percent: 0 })///展示进度条组件，当前百分比进度设置成0
    //             let localRecordsAfterFilter = await this.removeRecordsExistBugId(recordsList);///去除那些在我巡检过程中就被消缺的bug
    //             let newRecordsHasReallyBugId = await this.linkBugsAndRecords(newBugsArrhasBugId, localRecordsAfterFilter);///开始bugs和records的整合。目的是将bugsId正确的填充到 bug_id = -1 的地方。生成新的合理的records。
    //             let isOver = await this.uploadRecordsToDB(newRecordsHasReallyBugId);///只做是否全部上传，不考虑中间有上传失败的情况。会继续上传下一个record
    //             logHandler(`isOver:${isOver}`);
    //             if (isOver) {
    //                 Modal.alert('巡检数据上传完毕', null, [{
    //                     text: '确定', onPress: () => {
    //                         this.setState({ showProgress: false, uploading: false })
    //                         this.deleteFile();
    //                     }
    //                 }])
    //                 await DeviceStorage.delete(LOCAL_RECORDS)
    //             }
    //         } else if (!recordsTxt && newBugsArrhasBugId.length > 0) { ///如果只有缺陷数据,没有巡检数据
    //             Modal.alert('缺陷数据上传完毕', null, [{
    //                 text: '确定', onPress: () => {
    //                     this.setState({ uploading: false });
    //                     this.deleteFile();
    //                 }
    //             }])
    //         } else {
    //             logHandler('出现了其他情况', `newBugsArrhasBugId:${JSON.stringify(newBugsArrhasBugId)}`)
    //             Modal.alert('注意', '上传失败，请联系管理员', [
    //                 { text: '确定' }])
    //         }
    //     } catch (error) {
    //         logHandler('uploadDataFromTxt():报错', error.message)
    //         Modal.alert('注意', '上传出错，请联系管理员', [
    //             { text: '确定' }])
    //     } finally {
    //         this.setState({ showProgress: false, uploading: false })
    //     }
    // }
    //////////////////////////////////////直接从缓存中获取//////////////////////////////////////
    /**
     *直接从缓存中获取
     */
    getDataHandler = async () => {
        let records = await DeviceStorage.get(LOCAL_RECORDS)
        let bugs = await DeviceStorage.get(LOCAL_BUGS)
        let bugsList = [];
        let recordsList = [];
        if (records) { recordsList = records['localRecords'] }
        if (bugs) { bugsList = bugs['localBugs'] }
        return { bugsList, recordsList }
    }
    uploadDataFromLocalStorage = async (bugsList, recordsList) => {
        // console.log('bugsList:', bugsList)
        // console.log('recordsList:', recordsList)
        // return;
        // let recordsList = copyArrayItem(recordsListA, 100)
        // console.log('recordsList:', recordsList)
        logHandler('开始上传');
        this.setState({ uploading: true })
        try {
            let newBugsArrhasBugId = [];
            if (bugsList.length > 0) {
                pickUpMajorFromBugsAndPushNotice(bugsList);///将这些缺陷中专业都提取出来。
                let newBugsArrhasNetImgUri = await this.changeImgsValue(bugsList);///先将其中的imgs。进行转化。从本地文件路径。转化成网络的uri
                newBugsArrhasBugId = await this.uploadbugsToDB(newBugsArrhasNetImgUri); ///先将bugs依次上传到数据库，获取bugid。
                logHandler('【缺陷】上传完毕')
                await DeviceStorage.delete(LOCAL_BUGS)
            }
            if (recordsList.length > 0) {
                this.setState({ showProgress: true, percent: 0 })///展示进度条组件，当前百分比进度设置成0
                let localRecordsAfterFilter = await this.removeRecordsExistBugId(recordsList);///去除那些在我巡检过程中就被消缺的bug
                let newRecordsHasReallyBugId = await this.linkBugsAndRecords(newBugsArrhasBugId, localRecordsAfterFilter);///开始bugs和records的整合。目的是将bugsId正确的填充到 bug_id = -1 的地方。生成新的合理的records。
                let isOver = await this.uploadRecordsToDB(newRecordsHasReallyBugId);///只做是否全部上传，不考虑中间有上传失败的情况。会继续上传下一个record
                logHandler(`isOver:${isOver}`);
                if (isOver) {
                    Modal.alert('巡检数据上传完毕', null, [{
                        text: '确定', onPress: () => {
                            this.init();
                            this.setState({ showProgress: false, uploading: false })
                        }
                    }])
                    await DeviceStorage.delete(LOCAL_RECORDS)
                }
            } else if (recordsList.length === 0 && newBugsArrhasBugId.length > 0) { ///如果只有缺陷数据,没有巡检数据
                Modal.alert('缺陷数据上传完毕', null, [{ text: '确定', onPress: () => { this.init(); this.setState({ uploading: false }) } }])
                this.setState({ showProgress: false, uploading: false })
            } else if (recordsList.length === 0 && newBugsArrhasBugId.length === 0) {
                logHandler('巡检记录和缺陷记录都不存在')
                Modal.alert('注意', '巡检记录和缺陷记录都不存在', [{ text: '确定' }])
                this.setState({ showProgress: false, uploading: false })
            } else {
                logHandler('出现了其他情况', `newBugsArrhasBugId:${JSON.stringify(newBugsArrhasBugId)}`)
                Modal.alert('注意', '上传失败，请联系管理员', [{ text: '确定' }])
                this.setState({ showProgress: false, uploading: false })
            }
        } catch (error) {
            logHandler('uploadDataFromLocalStorage():报错', error.message)
            Modal.alert('注意', '上传出错，请联系管理员', [{ text: '确定' }])
            this.setState({ showProgress: false, uploading: false })
        } finally {
            this.setState({ showProgress: false, uploading: false })
        }
    }
    //////////////////////////////////////直接从缓存中获取//////////////////////////////////////
    uploadRecordsToDB = async (finallyRecordsArr) => {
        let count = 0;
        for (let index = 0; index < finallyRecordsArr.length; index++) {
            count = index;
            const oneRecord = finallyRecordsArr[index];
            if (!(oneRecord.isUploaded)) {
                let uploadResult = await this.upLoadRecordInfo(oneRecord);
                if (uploadResult.flag) {
                    await this.updateLocalRecordsInfo(oneRecord)
                } else {
                    logHandler(`上传失败的对象是:${JSON.stringify(oneRecord)}`, JSON.stringify(uploadResult.error || []))
                }
            }
            this.setState({ percent: parseInt(((count + 1) / finallyRecordsArr.length) * 100) })
        }
        if (count === finallyRecordsArr.length - 1) {
            logHandler(`【巡检】数据全部上传`)
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
        // console.log('改变LOCAL_RECORDS中这个record的状态 isUploaded = true; tempArr:', tempArr)
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
                    logHandler(`bug查询失败:${bug_id}`)
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
    //////////////////////////////////////
    //////////////////////////////////////
    //////////////////////////////////////
    //////////////////////////////////////
    /**
     * 退出登录
     */
    logoutHandler = async () => {
        ///打开对话框 是否确定要退出登录？如果再次登录，本地所有的设备状态都将被重置成待检状态
        Modal.alert('注意', '是否确定要退出？请确保巡检记录已经上传，离线状态下请勿退出', [
            {
                text: '取消'
            },
            {
                text: '确定退出', onPress: () => {
                    this.doLogout();
                }
            }
        ]);
    }
    doLogout = async () => {
        let bugs = await DeviceStorage.get(LOCAL_BUGS);
        let records = await DeviceStorage.get(LOCAL_RECORDS);
        let complete = true;
        if (bugs) {
            Toast.show('请先联网同步上传本地缓存的巡检记录', 2);
            return;
        }
        if (records) {
            records.localRecords.forEach(oneRecord => {
                if (!oneRecord.isUploaded) {
                    Toast.show('请先联网同步上传缓存的巡检记录', 2);
                    complete = false;
                }
            });
        }
        if (complete) {
            //清除本地存储的card信息
            DeviceStorage.delete(USER_CARD);
            DeviceStorage.delete(USER_INFO);
            DeviceStorage.delete(DEVICE_INFO);
            DeviceStorage.delete(AREA123_INFO);
            this.props.navigation.navigate('LoginView1')
            AppData.loginFlag = false;
            AppData.username = null;
            AppData.userNFC = null
        }
    }
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        alignItems: 'center',
    },
    infoTxt: {
        fontSize: 20
    }
})