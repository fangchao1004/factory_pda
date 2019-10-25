import React, { Component } from 'react';
import { View, Text, ScrollView, Dimensions, Image } from 'react-native'
import { Checkbox, TextareaItem, Button, Provider, Portal, Toast } from '@ant-design/react-native'
import AppData from '../util/AppData'
import SelectPhoto from '../modeOfPhoto/SelectPhoto'
import HttpApi from '../util/HttpApi';
const CheckboxItem = Checkbox.CheckboxItem;
const screenW = Dimensions.get('window').width;
const screenH = Dimensions.get('window').height;

var AllData;
var device_obj = null;
class DemoTest2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            enableScrollViewScroll: true,
            options: null,///获取的多选对象数据  {key: "1", title_name: "设备某某状态", type_id: "4", default_values: "选项1/选项2/选项3/选项4", value: null, …}
            fromData: { "select": '', "text": '', "imgs": [] },
            isBugReview: false ///是否为 缺陷上传完成后再点击进来查看？ 如果是 则要把bugs表中的数据拿出来，渲染在界面上，同时将组件设置成不可编辑，图片选择器换成image
        }
    }

    componentDidMount() {
        this.initFromData();
    }
    initFromData = () => {
        AllData = this.props.navigation.state.params
        device_obj = AllData.deviceInfo;
        // console.log('device_obj:::::',device_obj);//{id: 0, nfc_id: 0, name: "方超蛋糕卡测试设备", remark: null, type_id: 1, …}
        // console.log("asdasdasdas:",AppData); //{user_id: 1, username: "test", userNFC: "8F2DF1F5", loginFlag: true}
        console.log('是否已经报告了此缺陷：', AllData.item.bug_id);
        ///如果bug_id存在 就要去bugs表中去查询
        HttpApi.getBugs({ id: AllData.item.bug_id }, (res) => {
            if (res.data.code === 0) {
                console.log(res.data.data[0].content);
                this.setState({
                    fromData: JSON.parse(res.data.data[0].content)
                })
            }
        })
        this.setState({
            options: AllData.item,
            isBugReview: AllData.item.bug_id ? true : false
        })
    }

    getOneCheckBox = (params) => {
        //params 指的是整个 选项对象
        // console.log('整个 选项对象params:', params); // Object {key: "1", title_name: "设备某某状态", type_id: "4", default_values: "选项1/选项2/选项3/选项4", value: '', …}
        if (!params) { return }
        let obj = params;
        let Arrs = []
        obj.default_values.split('/').forEach((option, index) => {
            Arrs.push(<CheckboxItem key={option}
                disabled={this.state.isBugReview}
                style={{ marginLeft: -20 }}
                checked={this.state.fromData.select.split('/').indexOf(option) != -1}
                onChange={(event) => {
                    this.updateOptionsByCheckBox(obj, index, event.target.checked)
                }} >{option}</CheckboxItem>)
        });
        return (<View key={params.key} style={{ width: screenW * 0.9, marginTop: 10 }} >
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

    getOneTextArea = () => {
        return (<View style={{ marginTop: 20, width: screenW * 0.9 }}>
            <Text style={{ color: '#000000', marginBottom: 10, fontSize: 15 }}>问题描述:</Text>
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
            <Text style={{ color: '#000000', marginBottom: 10, fontSize: 15 }}>图片补充:</Text>
            <SelectPhoto onChange={(value) => this.photoChangeHandler(value)} />
        </View>)
    }

    getImags = () => {
        let pic = {
            uri: 'https://ss0.bdstatic.com/94oJfD_bAAcT8t7mm9GUKT-xh_/timg?image&quality=100&size=b4000_4000&sec=1559128999&di=420e296d35d11262f971f1de40877d7d&src=http://pic2.52pk.com/files/allimg/090626/1553504U2-2.jpg'
        };
        let ImgsArr = []
        this.state.fromData.imgs.forEach((imgUri, index) => {
            let imgP = { uri: imgUri }
            ImgsArr.push(<Image key={index + ''} source={pic} style={{ width: screenW * 0.9, height: screenW * 0.9 / 3 * 4 }} />);
        })
        return (<View style={{ marginTop: 20, width: screenW * 0.9 }}>
            {ImgsArr.length > 0 ? <Text style={{ color: '#000000', marginBottom: 10, fontSize: 15 }}>图片补充:</Text> : null}
            {ImgsArr.length > 0 ? ImgsArr : null}
        </View>)
    }

    photoChangeHandler = (value) => {
        let imageBase64DataArr = [];
        value.forEach(element => {
            imageBase64DataArr.push(element.key);
        });
        let copydata = JSON.parse(JSON.stringify(this.state.fromData));
        copydata.imgs = imageBase64DataArr;
        this.setState({
            fromData: copydata
        })
    }

    uploadBugsHandler = () => {
        if (this.state.fromData.select === '' && this.state.fromData.text === '' && this.state.fromData.imgs.length === 0) {
            Toast.fail('请完善数据再做提交', 1);
        } else {
            var key = Toast.loading('数据上传中...')
            let content = JSON.stringify(this.state.fromData);
            let obj = {}
            obj.content = content;
            obj.user_id = AppData.user_id;
            obj.device_id = device_obj.id;
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
            })
        }
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
                    <ScrollView style={{ width: screenW, height: this.state.isBugReview ? screenH : screenH - 150 }}
                        scrollEnabled={this.state.enableScrollViewScroll}
                        ref={myScroll => (this._myScroll = myScroll)}>
                        <View style={{ width: screenW, alignItems: 'center' }}>
                            {this.getOneCheckBox(this.state.options)}
                            {this.getOneTextArea()}
                            {this.state.isBugReview ? this.getImags() : this.getOneImagePicker()}
                        </View>
                    </ScrollView>
                    <View>
                        <Button style={{ display: this.state.isBugReview ? 'none' : 'flex', marginTop: 20, marginBottom: 20, width: screenW * 0.9, alignSelf: 'center' }} type="primary" onPress={this.uploadBugsHandler}>确定上传</Button>
                    </View>
                </View >
            </Provider>
        );
    }
}

export default DemoTest2;