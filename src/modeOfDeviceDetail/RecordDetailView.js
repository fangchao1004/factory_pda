import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ToastAndroid, Image } from 'react-native'
import { InputItem, Radio, Checkbox, TextareaItem, Button } from '@ant-design/react-native'
import SelectPhoto from '../modeOfPhoto/SelectPhoto';
import AppData from '../util/AppData'
import CircleList from '../test/CircleList';
const RadioItem = Radio.RadioItem;
const CheckboxItem = Checkbox.CheckboxItem;
const screenW = Dimensions.get('window').width;

var copyDataAll = {};
/**
 * 记录详细信息展示界面
 */
class RecordDetailView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fromData: [],//只表示表单中的选项数据
            enableScrollViewScroll: true
        }
    }
    componentDidMount() {
        this.initFromData();
    }
    initFromData = () => {
        let AllData = this.props.navigation.state.params
        if (!AllData || !AllData.recordData || !AllData.deviceInfo) {
            return;
        }
        copyDataAll = JSON.parse(JSON.stringify(AllData))
        let copyDataTable = JSON.parse(copyDataAll.recordData.content);
        this.setState({
            fromData: copyDataTable,
        })
    }
    render() {
        return (
            <View
                onStartShouldSetResponderCapture={() => {
                    this.setState({ enableScrollViewScroll: true });
                }}
            >
                <ScrollView
                    scrollEnabled={this.state.enableScrollViewScroll}
                    ref={myScroll => (this._myScroll = myScroll)}>
                    {/* 表头 */}
                    <View style={{ width: screenW * 0.9, alignSelf: 'center' }}>
                        <Text style={styles.title}>{copyDataAll.recordData ? copyDataAll.recordData.table_name : ''}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ color: '#000000' }}>{copyDataAll.deviceInfo ? '设备名:' + copyDataAll.deviceInfo.name : ''}</Text>
                            <Text style={{ color: '#000000' }}>{copyDataAll.recordData ? '用户名:' + copyDataAll.recordData.username : ''}</Text>
                        </View>
                        {this.renderTableHandler()}
                    </View>
                </ScrollView>
            </View>
        );
    }
    /**
     * 根据数据，渲染表格
     */
    renderTableHandler = () => {
        let sortData = this.state.fromData.sort((a, b) => {
            return parseInt(a.key) - parseInt(b.key)
        });///根据key排序,从小到大
        let viewArr = [];
        sortData.forEach(element => {
            if (element.type_id === "1") { //渲染文本输入框 
                viewArr.push(this.getOneTxtInput(element))
            } else if (element.type_id === "2") { //渲染数字输入框 
                viewArr.push(this.getOneNumInput(element))
            } else if (element.type_id === "3") { //渲染单选器
                viewArr.push(this.getOneRadio(element))
            } else if (element.type_id === "4") {//渲染多选器
                viewArr.push(this.getOneCheckBox(element))
            } else if (element.type_id === "5") {//渲染文本域
                viewArr.push(this.getOneTxtArea(element))
            } else if (element.type_id === "6") { ///渲染图片
                viewArr.push(this.getImages(element))
            }
        });
        return <View>{viewArr}</View>
    }
    getOneCheckBox = (params) => {
        let items = []
        params.default_values.split('/').forEach((default_value, index) => {
            items.push(<CheckboxItem key={default_value}
                checked={params.value.split('/').indexOf(default_value) != -1}>{default_value}</CheckboxItem>)
        });
        return (<View key={params.key} style={styles.Checkboxs}>
            <Text style={{ color: '#000000' }}>{params.title_name}</Text>
            {items}
        </View>)
    }
    getOneRadio = (params) => {
        let items = [];
        params.default_values.split('/').forEach((default_value, index) => {
            items.push(<RadioItem  key={default_value} checked={params.default_values.split('/')[index] === (params.value)}>{default_value}</RadioItem>)
        });
        return (<View key={params.key} style={styles.Radios}>
            <Text style={{ color: '#000000' }}>{params.title_name}</Text>
                {items}
                {/* <CircleList/> */}
        </View>)
    }
    getOneNumInput = (params) => {
        return (<View key={params.key} style={styles.InputItems}>
            <InputItem type={'number'} labelNumber={6} editable={false} value={params.value + ""}>{params.title_name}</InputItem>
        </View>)
    }
    getOneTxtInput = (params) => {
        return (<View key={params.key} style={styles.InputItems}>
            <InputItem type={'text'} labelNumber={6} editable={false} value={params.value + ""}>{params.title_name}</InputItem>
        </View>)
    }
    getOneTxtArea = (params) => {
        return (<View key={params.key} style={styles.InputItems}>
            <Text style={{ color: '#000000' }}>{params.title_name}</Text>
            <TextareaItem
                editable={false}
                rows={4}
                placeholder="请输入备注"
                // autoHeight
                style={{ paddingVertical: 5 }}
                // value={params.value===''?params.default_values:params.value}
                value={params.value + ""}
            />
        </View>)
    }
    getImages = (params) => {
        // console.log(params.value);
        let imgsArr = [];
        if (params.value.length > 0) {
            params.value.forEach((element, index) => {
                imgsArr.push(<Image
                    key={index}
                    style={styles.Img}
                    source={require('../../assets/home/logo.png')}
                />)
            });
        }
        return (
            <View key={params.key}>
                <Text style={{ color: '#000000' }}>{params.title_name}</Text>
                {imgsArr.length > 0 ? imgsArr : <Text>/</Text>}
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
        marginTop: 30
    },
    Img: {
        marginTop: 20,
        width: screenW * 0.9,
        height: screenW * 0.9,
    },
})

export default RecordDetailView;