import React, { Component } from 'react';
import { View, Text, ScrollView, Dimensions, Image } from 'react-native'
import { Checkbox, TextareaItem, Button, List, Provider, Portal, Toast, Picker } from '@ant-design/react-native'
import AppData from '../util/AppData'
import SelectPhoto from '../modeOfPhoto/SelectPhoto'
import HttpApi, { SERVER_URL } from '../util/HttpApi';
import DeviceStorage, { LOCAL_BUGS, MAJOR_INFO, BUG_LEVEL_INFO } from '../util/DeviceStorage';
import { pushNoticeHandler } from '../util/Tool'
const CheckboxItem = Checkbox.CheckboxItem;
const screenW = Dimensions.get('window').width;
const screenH = Dimensions.get('window').height;

var AllData;
var device_obj = null;
class ReportView2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            enableScrollViewScroll: true,
            options: null,///获取的多选对象数据  {key: "1", title_name: "设备某某状态", type_id: "4", default_values: "选项1/选项2/选项3/选项4", value: null, …}
            fromData: { "select": '', "text": '', "imgs": [] },
            isBugReview: false, ///是否为 缺陷上传完成后再点击进来查看？ 如果是 则要把bugs表中的数据拿出来，渲染在界面上，同时将组件设置成不可编辑，图片选择器换成image
            majorValue: [],
            majorArr: [],
            isLoading: false,
            warning_level_data: [],///
            levelValue: [],
        }
    }

    componentDidMount() {
        this.initFromData();
    }
    initFromData = async () => {
        AllData = this.props.navigation.state.params
        device_obj = AllData.deviceInfo;
        // console.log('AllData:', AllData);
        // console.log('是否已经报告了此缺陷：', AllData);
        let major_result = [];
        let bug_level_result = [];
        let major_info = await DeviceStorage.get(MAJOR_INFO);
        if (major_info) {
            major_info.majorInfo.forEach((item) => {
                major_result.push({ label: item.name, value: item.id });
            })
        }
        let bug_level_info = await DeviceStorage.get(BUG_LEVEL_INFO);
        if (bug_level_info) {
            bug_level_info.bugLevelInfo.forEach((item) => {
                bug_level_result.push({ label: item.name, value: item.id });
            })
        }
        this.setState({
            warning_level_data: bug_level_result,
            majorArr: major_result,
            options: AllData,
            isBugReview: AllData.bug_id ? true : false
        })
        ///如果bug_id存在 就要去bugs表中去查询 (有网络的情况下)
        if (AppData.isNetConnetion && AllData.bug_id && AllData.bug_id != -1) {
            HttpApi.getBugs({ id: AllData.bug_id, effective: 1 }, (res) => {
                if (res.data.code === 0) {
                    this.setState({
                        majorValue: [res.data.data[0].major_id],
                        levelValue: [res.data.data[0].buglevel],
                        fromData: JSON.parse(res.data.data[0].content),
                    })
                }
            })

        } else if (!AppData.isNetConnetion && AllData.bug_id === -1) {
            ///无网络时。
            // console.log("无网络时。当前key", AllData.key);
            // console.log('设备信息id：', AllData.deviceInfo.device_id);
            let result = await DeviceStorage.get(LOCAL_BUGS)
            // console.log('无网络时。再尝试获取：', result.localBugs);
            if (result) {
                result.localBugs.forEach((item) => {
                    if (item.device_id === AllData.deviceInfo.device_id && item.key === AllData.key) {
                        this.setState({
                            majorValue: [item.major_id],
                            levelValue: [item.buglevel],
                            fromData: JSON.parse(item.content),
                        })
                    }
                })
            }
        }

    }

    getOneCheckBox = (params) => {
        //params 指的是整个 选项对象
        // console.log('整个 选项对象params:', params); // Object {key: "1", title_name: "设备某某状态", type_id: "4", default_values: "选项1/选项2/选项3/选项4", value: '', …}
        if (!params) { return null }
        let obj = params;
        let Arrs = []
        obj.default_values.split('/').forEach((option, index) => {
            Arrs.push(<CheckboxItem key={option}
                disabled={this.state.isBugReview}
                style={{ marginLeft: -10 }}
                checked={this.state.fromData.select.split('/').indexOf(option) != -1}
                onChange={(event) => {
                    this.updateOptionsByCheckBox(obj, index, event.target.checked)
                }} >{option}</CheckboxItem>)
        });
        return (<View key={params.key} style={{ width: screenW * 0.9 }} >
            {/* <Text style={{ color: '#41A8FF' }}>{AllData.key + ". " + AllData.title_name}</Text> */}
            {Arrs}
        </View>)
    }

    getOneCheckShowBox = () => {
        let Arrs = []
        if (this.state.fromData.select === '') { return null }
        this.state.fromData.select.split('/').forEach((option, index) => {
            Arrs.push(<CheckboxItem key={option}
                editable={this.state.isBugReview}
                style={{ marginLeft: -10 }}
                checked={true}
            >{option}</CheckboxItem>)
        });
        return (<View key={'1'} style={{ width: screenW * 0.9, marginTop: 10 }} >
            {Arrs}
        </View>)
    }

    updateOptionsByCheckBox = (obj, index, checked) => {
        let options = obj.default_values.split('/');///提供的选项
        let selectedOption = options[index];///此次选择的是
        let haveSelectedArr = obj.value === '' ? [] : obj.value.split('/');//已经选中的  数组类型
        if (checked) {
            haveSelectedArr.push(selectedOption)
        } else {
            let targetValue = options[index]
            let targetIndexInhaveSelectedArr = haveSelectedArr.indexOf(targetValue)
            haveSelectedArr.splice(targetIndexInhaveSelectedArr, 1);
        }
        obj.value = haveSelectedArr.join('/')
        let copydata = JSON.parse(JSON.stringify(this.state.fromData));
        copydata.select = obj.value
        this.setState({
            options: obj,
            fromData: copydata
        })
    }

    getLevel = () => {
        return (
            <View style={{ marginTop: 10, width: screenW * 0.9 }}>
                <Picker data={this.state.warning_level_data} cols={1}
                    itemStyle={{ height: 30, marginTop: 8, fontSize: 15 }}
                    value={this.state.levelValue}
                    onChange={(v) => {
                        let copydata = JSON.parse(JSON.stringify(this.state.fromData));
                        copydata.levelId = v[0]
                        this.setState({
                            fromData: copydata,
                            levelValue: v
                        })
                    }}
                >
                    <List.Item arrow="horizontal"><Text style={{ marginLeft: -15, color: '#000000', fontSize: 15 }}>紧急类型</Text></List.Item>
                </Picker>
            </View >
        )
    }

    getShowLevel = () => {
        return (<View style={{ marginTop: 10, width: screenW * 0.9 }}>
            <Picker data={this.state.warning_level_data} cols={1}
                itemStyle={{ height: 30, marginTop: 8, fontSize: 15 }}
                value={this.state.levelValue}
                disabled={true}
            >
                <List.Item arrow="horizontal"><Text style={{ marginLeft: -15, color: '#000000', fontSize: 15 }}>紧急类型</Text></List.Item>
            </Picker>
        </View >)
    }

    getOneMajorPicker = () => {
        return (<View style={{ width: screenW * 0.9 }}>
            <Picker
                data={this.state.majorArr}
                cols={1}
                itemStyle={{ height: 30, marginTop: 8, fontSize: 15 }}
                value={this.state.majorValue}
                onChange={(v) => {
                    this.setState({
                        majorValue: v
                    })
                }}
            >
                <List.Item arrow="horizontal"><Text style={{ marginLeft: -15, color: '#000000', fontSize: 15 }}>缺陷专业</Text></List.Item>
            </Picker>
        </View>)
    }

    getOneMajorShowPicker = () => {
        return (<View style={{ width: screenW * 0.9 }}>
            <Picker data={this.state.majorArr} cols={1}
                itemStyle={{ height: 30, marginTop: 8, fontSize: 15 }}
                value={this.state.majorValue}
                disabled={true}
            >
                <List.Item arrow="horizontal"><Text style={{ marginLeft: -15, color: '#000000', fontSize: 15 }}>缺陷专业</Text></List.Item>
            </Picker>
        </View >)
    }

    getOneTextArea = () => {
        return (<View style={{ marginTop: 20, width: screenW * 0.9 }}>
            <Text style={{ color: '#000000', marginBottom: 10, fontSize: 15 }}>问题描述</Text>
            <TextareaItem
                editable={!this.state.isBugReview}
                value={this.state.fromData.text}
                rows={5}
                placeholder="请输入备注"
                style={{ paddingVertical: 5, backgroundColor: '#f0f0f0', borderRadius: 5 }}
                onChange={(value) => {
                    let copydata = JSON.parse(JSON.stringify(this.state.fromData));
                    copydata.text = value
                    this.setState({
                        fromData: copydata
                    })
                }}
            />
        </View>)
    }

    getOneTextShowArea = () => {
        if (this.state.fromData.text === '') { return null }
        return (
            <View style={{ marginTop: 20, width: screenW * 0.9 }}>
                <Text style={{ color: '#000000', marginBottom: 10, fontSize: 15 }}>问题描述</Text>
                <TextareaItem
                    editable={false}
                    value={this.state.fromData.text}
                    autoHeight
                    style={{ paddingVertical: 5, backgroundColor: '#f0f0f0', borderRadius: 5 }}
                />
            </View>
        )
    }

    getOneImagePicker = () => {
        return (<View style={{ marginTop: 20, width: screenW * 0.9 }}
            onStartShouldSetResponderCapture={() => {
                if (this.state.fromData.imgs.length > 2) {
                    this.setState({ enableScrollViewScroll: false });
                }
                if (this._myScroll.contentOffset === 0 && this.state.enableScrollViewScroll === false) {
                    this.setState({ enableScrollViewScroll: true });
                }
            }}
        >
            <Text style={{ color: '#000000', marginBottom: 10, fontSize: 15 }}>图片补充</Text>
            <SelectPhoto onChange={(value) => this.photoChangeHandler(value)} />
        </View>)
    }

    getImags = () => {
        // let pic = {
        //     uri: 'https://ss0.bdstatic.com/94oJfD_bAAcT8t7mm9GUKT-xh_/timg?image&quality=100&size=b4000_4000&sec=1559128999&di=420e296d35d11262f971f1de40877d7d&src=http://pic2.52pk.com/files/allimg/090626/1553504U2-2.jpg'
        // };
        let ImgsArr = []
        this.state.fromData.imgs.forEach((imgUri, index) => {
            let imgP = null
            if (AppData.isNetConnetion && imgUri.indexOf('file:/') === -1) {
                imgP = { uri: SERVER_URL + 'get_jpg?uuid=' + imgUri }
            } else {
                imgP = { uri: imgUri }
            }
            ImgsArr.push(<Image key={index + ''} source={imgP} style={{ width: screenW * 0.9, height: screenW * 0.9 / 3 * 4, marginBottom: 10 }} />);
        })
        return (<View style={{ marginTop: 20, marginLeft: 15, marginRight: 15, width: screenW * 0.9 }}>
            {ImgsArr.length > 0 ? <Text style={{ color: '#000000', marginBottom: 10, fontSize: 15 }}>图片补充</Text> : null}
            {ImgsArr.length > 0 ? ImgsArr : null}
        </View>)
    }

    photoChangeHandler = (value) => {
        let imgLocalPathArr = [];
        value.forEach(element => {
            imgLocalPathArr.push(element.uri);
        });
        let copydata = JSON.parse(JSON.stringify(this.state.fromData));
        copydata.imgs = imgLocalPathArr;
        this.setState({
            fromData: copydata
        })
    }

    uploadBugsHandler = async () => {
        if (this.state.levelValue.length === 0) {
            Toast.fail('请选择紧急类型', 1);
            return;
        }
        if (this.state.majorValue.length === 0) {
            Toast.fail('请选择缺陷专业', 1);
            return;
        }
        if (this.state.fromData.text === '') {
            Toast.fail('请填写必要的问题描述', 1);
            return;
        }
        if (AppData.isNetConnetion) {///如果网络连接正常，则按原先流程进行。上传bug，获取到bugid,再回调
            this.setState({ isLoading: true })
            var key = Toast.loading('数据上传中...')
            let imgLocalPathArr = this.state.fromData.imgs;
            let netUriArr = [];
            for (const imgPath of imgLocalPathArr) {
                let imgfile = { uri: imgPath, type: 'multipart/form-data', name: 'image.jpg' }
                let formData = new FormData()
                formData.append('file', imgfile)
                let netUri = await this.uploadImage(formData)
                netUriArr.push(netUri);
            }
            let content = JSON.parse(JSON.stringify(this.state.fromData));
            content.imgs = netUriArr;
            let obj = {}
            obj.title_name = AllData.title_name;///标题
            obj.title_remark = AllData.title_remark; /// 标题备注
            obj.content = JSON.stringify(content);///内容
            obj.user_id = AppData.user_id;///上传者id
            obj.device_id = device_obj.device_id;///设备id
            obj.major_id = this.state.majorValue[0];///专业id
            obj.checkedAt = AppData.checkedAt;///检查的时间点 YYYY-MM-DD HH:mm:ss
            obj.buglevel = this.state.levelValue[0];///等级id
            HttpApi.uploadBugs(obj, (res) => {
                if (res.data.code === 0) {
                    // console.log('bug_id', res.data.data.id);
                    Portal.remove(key)
                    Toast.success('缺陷记录上传成功', 1);
                    setTimeout(() => {
                        this.props.navigation.goBack();
                        pushNoticeHandler(this.state.majorValue);
                        AllData.callBackBugId(res.data.data.id, AllData.key);
                    }, 1100);
                } else {
                    Portal.remove(key)
                    Toast.fail('缺陷记录上传失败', 1);
                }
                this.setState({ isLoading: false })
            })
        } else {
            ////如果没网。要把数据先存在本地的变量中，再同步更新到本地的缓存中。 
            this.saveBugInfoInLocal();
        }
    }
    /**
     * 确认检查过 是那个项
     */
    isCheckedHandler = () => {
        AllData.callBackIsChecked(AllData.key);
        Toast.success('已检查该项');
        setTimeout(() => {
            this.props.navigation.goBack();
        }, 1000);
    }
    saveBugInfoInLocal = async () => {
        let obj = {}
        obj.title_name = AllData.title_name;
        obj.content = JSON.stringify(this.state.fromData);
        obj.user_id = AppData.user_id;
        obj.device_id = device_obj.device_id;
        obj.major_id = this.state.majorValue[0];
        obj.key = AllData.key;
        obj.checkedAt = AppData.checkedAt;
        obj.buglevel = this.state.levelValue[0];///等级id
        // console.log("本地存储的bug数据：", obj);
        AllData.callBackBugId(-1, AllData.key);
        let storageBugs = await DeviceStorage.get(LOCAL_BUGS);
        if (storageBugs) {
            storageBugs.localBugs.push(obj);
            await DeviceStorage.update(LOCAL_BUGS, { "localBugs": storageBugs.localBugs })
        } else {
            await DeviceStorage.save(LOCAL_BUGS, { "localBugs": [obj] })
        }
        // console.log('本地存储成功');
        // let result = await DeviceStorage.get(LOCAL_BUGS)
        // console.log('再尝试获取：', result.localBugs);
        Toast.success('缺陷信息本地暂存成功', 1);
        setTimeout(() => {
            this.props.navigation.goBack();
        }, 1300);
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

    render() {
        let titName = AllData ? AllData.title_name : '';
        let titRemark = AllData && AllData.title_remark ? '提示：' + AllData.title_remark : '';
        return (
            <Provider>
                <View style={{ width: screenW, height: 70, backgroundColor: '#41A8FF' }}>
                    <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>{this.state.isBugReview ? '缺陷回看' : '缺陷上报'}</Text>
                </View>
                <View
                    onStartShouldSetResponderCapture={() => {
                        this.setState({ enableScrollViewScroll: true });
                    }}
                >
                    <ScrollView style={{ width: screenW, height: this.state.isBugReview ? screenH - 60 : screenH - 130 }}
                        scrollEnabled={this.state.enableScrollViewScroll}
                        ref={myScroll => (this._myScroll = myScroll)}>
                        <View style={{ width: screenW, alignItems: 'center' }}>
                            <Text style={{ alignSelf: 'flex-start', marginTop: 10, marginLeft: 10 }}>{titName}</Text>
                            <Text style={{ alignSelf: 'flex-start', marginTop: 10, marginLeft: 10, color: '#41A8FF' }}>{titRemark}</Text>
                            {AllData && AllData.type_id === '4' ? (
                                this.state.isBugReview ? this.getOneCheckShowBox(this.state.options) : this.getOneCheckBox(this.state.options))
                                : null}
                            {this.state.isBugReview ? this.getShowLevel() : this.getLevel()}
                            {this.state.isBugReview ? this.getOneMajorShowPicker() : this.getOneMajorPicker()}
                            {this.state.isBugReview ? this.getOneTextShowArea() : this.getOneTextArea()}
                            {this.state.isBugReview ? this.getImags() : this.getOneImagePicker()}
                        </View>
                    </ScrollView>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', width: screenW * 0.9, marginLeft: screenW * 0.05 }}>
                        <Button
                            loading={this.state.isLoading} disabled={this.state.isLoading}
                            style={{ display: this.state.isBugReview ? 'none' : 'flex', marginTop: 10, width: screenW * 0.4, alignSelf: 'center' }}
                            type="warning" onPress={this.uploadBugsHandler}>
                            {this.state.isLoading ? '正在上传缺陷' : '确定上传缺陷'}
                        </Button>
                        <Button
                            style={{ display: this.state.isBugReview ? 'none' : 'flex', marginTop: 10, width: screenW * 0.4, alignSelf: 'center' }}
                            type="primary" onPress={this.isCheckedHandler}>
                            已检查无误
                        </Button>
                    </View>
                </View >
            </Provider>
        );
    }
}

export default ReportView2;