import React, { Component } from 'react';
import { View, Text, ScrollView, Dimensions, Image } from 'react-native'
import { Checkbox, TextareaItem, Button, List, Provider, Portal, Toast, Picker } from '@ant-design/react-native'
import AppData from '../util/AppData'
import SelectPhoto from '../modeOfPhoto/SelectPhoto'
import HttpApi, { SERVER_URL } from '../util/HttpApi';
import DeviceStorage, { LOCAL_BUGS, MAJOR_INFO } from '../util/DeviceStorage';
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
            fromData: { "select": '', "majorId": '', "text": '', "imgs": [] },
            isBugReview: false, ///是否为 缺陷上传完成后再点击进来查看？ 如果是 则要把bugs表中的数据拿出来，渲染在界面上，同时将组件设置成不可编辑，图片选择器换成image
            majorValue: null,
            majorArr: [],
            isLoading: false
        }
    }

    componentDidMount() {
        this.initFromData();
    }
    initFromData = async () => {
        AllData = this.props.navigation.state.params
        device_obj = AllData.deviceInfo;
        // console.log('device_obj:::::',device_obj);
        // console.log("asdasdasdas:",AppData); //{user_id: 1, username: "test", userNFC: "8F2DF1F5", loginFlag: true}
        // console.log('是否已经报告了此缺陷：', AllData.item);
        ///如果bug_id存在 就要去bugs表中去查询 (有网络的情况下)
        if (AppData.isNetConnetion && AllData.item.bug_id && AllData.item.bug_id != -1) {
            HttpApi.getBugs({ id: AllData.item.bug_id }, (res) => {
                if (res.data.code === 0) {
                    // console.log("res.data.data[0].content:", res.data.data[0].content);
                    this.setState({ fromData: JSON.parse(res.data.data[0].content) })
                }
            })

        } else if (!AppData.isNetConnetion && AllData.item.bug_id === -1) {
            ///无网络时。
            // console.log("无网络时。当前key", AllData.item.key);
            // console.log('设备信息id：', AllData.deviceInfo.device_id);
            let result = await DeviceStorage.get(LOCAL_BUGS)
            // console.log('无网络时。再尝试获取：', result.localBugs);
            if (result) {
                result.localBugs.forEach((item) => {
                    if (item.device_id === AllData.deviceInfo.device_id && item.key === AllData.item.key) {
                        this.setState({
                            fromData: JSON.parse(item.content)
                        })
                    }
                })
            }
        }
        let major_result = [];
        if (AppData.isNetConnetion) {
            HttpApi.getMajorInfo({}, (res) => {
                if (res.data.code == 0) {
                    res.data.data.forEach((item) => {
                        major_result.push({ label: item.name, value: item.id });
                    })
                }
            })
        } else {
            let major_info = await DeviceStorage.get(MAJOR_INFO);
            if (major_info) {
                major_info.majorInfo.forEach((item) => {
                    major_result.push({ label: item.name, value: item.id });
                })
            }
        }

        this.setState({
            majorArr: major_result,
            options: AllData.item,
            isBugReview: AllData.item.bug_id ? true : false
        })
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
            {/* <Text style={{ color: '#41A8FF' }}>{AllData.item.key + ". " + AllData.item.title_name}</Text> */}
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
            {/* <Text style={{ color: '#41A8FF' }}>{AllData.item.key + ". " + AllData.item.title_name}</Text> */}
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
        // console.log("fromData::",copydata);
        this.setState({
            options: obj,
            fromData: copydata
        })
    }

    getOneMajorPicker = () => {
        return (<View style={{ marginTop: 10, width: screenW * 0.9 }}>
            <Picker
                data={this.state.majorArr}
                cols={1}
                itemStyle={{ height: 30, marginTop: 8 }}
                value={this.state.majorValue}
                onChange={(v) => {
                    let copydata = JSON.parse(JSON.stringify(this.state.fromData));
                    copydata.majorId = v[0]
                    this.setState({
                        fromData: copydata
                    })
                    this.setState({ majorValue: v })
                }}
            >
                <List.Item arrow="horizontal"><Text style={{ marginLeft: -15, color: '#000000', fontSize: 15 }}>缺陷专业</Text></List.Item>
            </Picker>
        </View>)
    }

    getOneMajorShowPicker = () => {
        if (this.state.fromData.majorId) {
            setTimeout(() => {
                this.forceUpdate();
            }, 50);
        }
        return (<View style={{ marginTop: 10, width: screenW * 0.9 }}>
            <Picker
                data={this.state.majorArr}
                cols={1}
                disabled={true}
                itemStyle={{ height: 30, marginTop: 8 }}
                value={[this.state.fromData.majorId]}
            >
                <List.Item arrow="horizontal"><Text style={{ marginLeft: -15, color: '#000000', fontSize: 15 }}>缺陷专业</Text></List.Item>
            </Picker>
        </View>)
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
                    //{select:"A/C",text:"哈哈哈",imgs:[".../1.png",".../2.png"]}
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
        if (!this.state.majorValue) {
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
            obj.title_name = AllData.item.title_name;
            obj.content = JSON.stringify(content);
            obj.user_id = AppData.user_id;
            obj.device_id = device_obj.device_id;
            obj.major_id = this.state.majorValue[0];
            obj.checkedAt = AppData.checkedAt;
            HttpApi.uploadBugs(obj, (res) => {
                if (res.data.code === 0) {
                    // console.log('bug_id', res.data.data.id);
                    Portal.remove(key)
                    Toast.success('缺陷记录上传成功', 1);
                    setTimeout(() => {
                        this.props.navigation.goBack();
                        AllData.callBackBugId(res.data.data.id, AllData.item.key);
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
        // console.log('AllData.item.key:',AllData.item.key);
        AllData.callBackIsChecked(AllData.item.key);
        Toast.success('已检查该项');
        setTimeout(() => {
            this.props.navigation.goBack();
        }, 1000);
    }
    saveBugInfoInLocal = async () => {
        let obj = {}
        obj.title_name = AllData.item.title_name;
        obj.content = JSON.stringify(this.state.fromData);
        obj.user_id = AppData.user_id;
        obj.device_id = device_obj.device_id;
        obj.major_id = this.state.majorValue[0];
        obj.key = AllData.item.key;
        obj.checkedAt = AppData.checkedAt;
        // console.log("本地存储的bug数据：", obj);
        AllData.callBackBugId(-1, AllData.item.key);
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
                            <Text style={{ color: '#41A8FF', alignSelf: 'flex-start', marginTop: 10, marginLeft: 10 }}>{AllData ? (AllData.item.key + ". " + AllData.item.title_name) : ''}</Text>
                            {this.state.isBugReview ? this.getOneCheckShowBox(this.state.options) : this.getOneCheckBox(this.state.options)}
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