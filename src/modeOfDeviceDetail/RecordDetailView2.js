import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image } from 'react-native'
import { Checkbox, TextareaItem, List, Picker, Provider } from '@ant-design/react-native'
import HttpApi, { SERVER_URL } from '../util/HttpApi';
import DeviceStorage, { MAJOR_INFO } from '../util/DeviceStorage'
import moment from 'moment'
const CheckboxItem = Checkbox.CheckboxItem;
const screenW = Dimensions.get('window').width;
const screenH = Dimensions.get('window').height;

var copyDataAll = {};
var bug_info_arr = [];
/**
 * 记录详细信息展示界面2
 */
class RecordDetailView2 extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fromData: [],//只表示表单中的选项数据
            majorArr: []
        }
    }
    componentDidMount() {
        this.initFromData();
    }
    initFromData = async () => {
        let AllData = this.props.navigation.state.params
        if (!AllData || !AllData.recordData || !AllData.deviceInfo) {
            return;
        }
        copyDataAll = JSON.parse(JSON.stringify(AllData))
        let copyDataTable = JSON.parse(copyDataAll.recordData.content);
        // console.log("fromdata 数据：", copyDataTable);
        let bugsArr = copyDataTable.filter((item) => item.bug_id !== null)
        // console.log(bugsArr); ////{key: "9", title_name: "油位是否正常9", type_id: "4",bug_id:9999 …}
        ///将所有bug_id都整理出来
        let bug_id_arr = [];
        bugsArr.forEach((item) => { bug_id_arr.push(item.bug_id); })
        // console.log("bug_id_arr", bug_id_arr); ///[999,1000]
        bug_info_arr = await this.getBugInfo(bug_id_arr);
        let result = this.linkTwoData(bugsArr, bug_info_arr)

        let major_result = [];
        let major_info = await DeviceStorage.get(MAJOR_INFO);
        if (major_info) {
            major_info.majorInfo.forEach((item) => {
                major_result.push({ label: item.name, value: item.id });
            })
        }
        this.setState({
            fromData: result,
            majorArr: major_result,
        })
    }
    render() {
        return (
            <Provider>
                <View>
                    <View style={{ width: screenW, height: 70, backgroundColor: '#41A8FF', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>点检记录</Text>
                        <Text style={{ margin: 10, marginTop: 30, fontSize: 14, color: '#FFFFFF' }}>{copyDataAll.recordData ? moment(copyDataAll.recordData.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</Text>
                    </View>
                    <ScrollView
                        style={{ height: screenH - 50 }}
                        ref={myScroll => (this._myScroll = myScroll)}>
                        {/* 表头 */}
                        <View style={{ width: screenW * 0.9, alignSelf: 'center' }}>
                            <Text style={{ alignSelf: 'center', fontSize: 20, marginTop: 10, color: '#41A8FF' }}>{copyDataAll.recordData ? copyDataAll.recordData.table_name : ''}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, marginTop: 10 }}>
                                <Text style={{ fontSize: 14, color: '#000000' }}>{copyDataAll.deviceInfo ? '设备名:' + copyDataAll.deviceInfo.name : ''}</Text>
                                <Text style={{ fontSize: 14, color: '#000000' }}>{copyDataAll.recordData ? '上传者:' + copyDataAll.recordData.userInfo.name : ''}</Text>
                            </View>
                            {this.renderTableHandler()}
                        </View>
                    </ScrollView>
                </View>
            </Provider>
        );
    }

    linkTwoData = (bugsArr, bug_info_arr) => {
        bugsArr.forEach((bugItem) => {
            bugItem.default_values = bugItem.default_values.split('/');
            bug_info_arr.forEach((infoItem) => {
                if (bugItem.bug_id === infoItem.id) {
                    bugItem.select = JSON.parse(infoItem.content).select.split('/');
                    bugItem.text = JSON.parse(infoItem.content).text;
                    bugItem.imgs = JSON.parse(infoItem.content).imgs;
                    bugItem.majorId = infoItem.major_id;
                }
            })
        })
        return bugsArr;
    }
    /**
     * 根据数据，渲染表格
     */
    renderTableHandler = () => {
        let viewArr = [];
        if (this.state.fromData.length === 0) {
            // viewArr.push(<Text key={'1'} style={{ alignSelf: 'center', color: '#33CC33' }} > 正常</ Text>)
        } else {
            this.state.fromData.forEach((element) => {
                viewArr.push(this.getOneCheckBox(element));
            })
        }

        return <View>{viewArr}</View>
    }

    getBugInfo = (bug_id_arr) => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getBugs({ id: bug_id_arr }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data;
                }
                resolve(result);
            })
        })
    }

    //params.select.indexOf(default_value) != -1
    getOneCheckBox = (params) => {
        let items = []
        params.select.forEach((value, index) => {
            if (value !== '') {
                items.push(<CheckboxItem key={value}
                    style={{ marginLeft: -10 }}
                    checked={true}>{value}</CheckboxItem>)
            }
        });
        return (<View key={params.key} style={styles.Checkboxs}>
            <Text style={{ color: '#41A8FF' }}>{params.key + '. ' + params.title_name}</Text>
            {items}
            {params.majorId ? this.getMajorShowPicker(params.majorId) : null}
            {params.text ? this.getOneTxtArea(params.text) : null}
            {params.imgs.length > 0 ? this.getImages(params.imgs) : null}
        </View>)
    }
    getMajorShowPicker = (params) => {
        return (<View style={{ marginTop: 10, width: screenW * 0.9 }}>
            <Picker
                data={this.state.majorArr}
                disabled={true}
                cols={1}
                itemStyle={{ height: 30, marginTop: 8 }}
                value={[params]}
            >
                <List.Item arrow="horizontal"><Text style={{ marginLeft: -15, color: '#000000', fontSize: 15 }}>缺陷专业</Text></List.Item>
            </Picker>
        </View>)
    }
    getOneTxtArea = (params) => {
        return (<View style={{ marginTop: 10, width: screenW * 0.9 }}>
            <Text style={{ color: '#000000', marginBottom: 10, fontSize: 15 }}>问题描述</Text>
            <TextareaItem
                editable={false}
                value={params}
                autoHeight={true}
                style={{ paddingVertical: 5, backgroundColor: '#f0f0f0', borderRadius: 5 }}
            />
        </View>)
    }
    getImages = (params) => {
        // console.log('params:', params);
        let pic = {
            uri: 'https://ss0.bdstatic.com/94oJfD_bAAcT8t7mm9GUKT-xh_/timg?image&quality=100&size=b4000_4000&sec=1559128999&di=420e296d35d11262f971f1de40877d7d&src=http://pic2.52pk.com/files/allimg/090626/1553504U2-2.jpg'
        };
        let ImgsArr = []
        params.forEach((imgUri, index) => {
            let imgP = { uri: SERVER_URL + 'get_jpg?uuid=' + imgUri }
            ImgsArr.push(<Image key={index + ''} source={imgP} style={{ width: screenW * 0.9, height: screenW * 0.9 / 3 * 4, marginTop: 10 }} />);
        })
        return (<View style={{ marginTop: 20, width: screenW * 0.9 }}>
            {ImgsArr.length > 0 ? <Text style={{ color: '#000000', fontSize: 15 }}>图片补充</Text> : null}
            {ImgsArr.length > 0 ? ImgsArr : null}
        </View>)
    }
}

const styles = StyleSheet.create({
    scrollView: {
        width: screenW,
        alignItems: 'center',
    },
    title: {
        margin: 20,
        fontSize: 26,
        alignSelf: 'center',
        color: '#000000'
    },
    Radios: {
        marginTop: 30
    },
    InputItems: {
        marginTop: 30
    },
    Checkboxs: {
        marginBottom: 20
    },
    Img: {
        marginTop: 20,
        width: screenW * 0.9,
        height: screenW * 0.9,
    },
})

export default RecordDetailView2;