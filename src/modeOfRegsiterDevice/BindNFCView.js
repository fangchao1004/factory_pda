import React from 'react';
import { View, Dimensions } from 'react-native';
import { List, Picker, Provider, Button, InputItem, Toast, Modal, Portal } from '@ant-design/react-native';
import HttpApi from '../util/HttpApi';

const screenW = Dimensions.get('window').width;
const screenH = Dimensions.get('window').height;

/**
 * 绑定NFC的界面
 */
export default class BindNFCView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nfc_type_data: [{ label: '巡检点', value: 2 }, { label: '人员', value: 1 }],
            nfc_type_select: [],
            target_name: '',
            target_nfc: '',
            isLoading: false,
        }
    }
    componentWillReceiveProps(nextProps, nextState) {
        console.log(nextProps);
        this.setState({
            target_nfc: nextProps.nfcid
        })
    }

    upLoadHandler = async () => {
        if (this.state.nfc_type_select[0] && this.state.target_nfc && this.state.target_name) {
            this.setState({ isLoading: true })
            var key = Toast.loading('正在处理...')
            let nfc_data = { nfcid: this.state.target_nfc, name: this.state.target_name, type: this.state.nfc_type_select[0] }
            ///先去数据库查询，是否有重名的nfc记录，如果有，就提示是否要覆盖。如果没有就插入这条信息。
            let isExisted = await this.findNFCbyName(this.state.target_name, this.state.nfc_type_select[0]);
            let nfc_id_data;
            console.log('isEx', isExisted)
            if (isExisted) {
                Modal.alert('注意！', `该名称的${this.state.nfc_type_select[0] === 1 ? '员工' : '巡检点'}标签已注册过，是否要覆盖？原先标签将不再可用`, [
                    { text: '取消', onPress: () => { this.setState({ isLoading: false }); Portal.remove(key) } },
                    { text: '确定', onPress: () => { this.updateNFCInfoHandler(nfc_data, key) } }
                ]);
            } else {
                nfc_id_data = await this.insertNFCInfo(nfc_data); ///插入FNC表，生成自增的id。获取这个id
                Portal.remove(key)
                if (nfc_id_data !== 0) { Toast.fail('NFC注册失败', 1) } else {
                    Toast.success('NFC注册成功', 1); ///NFC 表插入失败
                    this.goBack();
                }
                this.setState({ isLoading: false })
            }
        } else {
            Toast.fail('请检查是否有未填项');
        }
    }
    updateNFCInfoHandler = async (nfc_data, key) => {
        nfc_id_data = await this.updateNFCInfo(nfc_data); ///插入FNC表，生成自增的id。获取这个id
        Portal.remove(key)
        if (nfc_id_data === 0) {
            Toast.success('NFC覆盖成功', 1)
            this.goBack();
        } else {
            Toast.fail('NFC覆盖失败', 1)
        }
        this.setState({ isLoading: false })
    }
    goBack = () => {
        setTimeout(() => {
            this.props.navigation.goBack();
        }, 500);
    }
    findNFCbyName = (name, type) => {
        return new Promise((resolve, reject) => {
            let sql = `select nfcs.id from nfcs where name = '${name}' and type = ${type} `
            HttpApi.obs({ sql }, (res) => {
                if (res.data.data.length === 1) {
                    resolve(true)
                } else { resolve(false) }
            })
        })
    }
    updateNFCInfo = (param) => {
        return new Promise((resolve, reject) => {
            let sql = `update nfcs set nfcid = '${param.nfcid}' where name = '${param.name}'`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    insertNFCInfo = (param) => {
        return new Promise((resolve, reject) => {
            HttpApi.insertNFCInfo(param, (res) => {
                resolve(res.data.code)
            })
        })
    }

    render() {
        return (
            <View>
                <View style={{ width: screenW, height: screenH, alignItems: 'center' }}>
                    <Provider>
                        <View style={{ width: screenW * 0.95, alignItems: 'center' }}>
                            <List style={{ width: screenW * 0.95 }}>
                                <Picker data={this.state.nfc_type_data} cols={1}
                                    itemStyle={{ height: 30, marginTop: 8 }}
                                    value={Array.from(this.state.nfc_type_select)}
                                    onChange={(v) => { this.setState({ nfc_type_select: v }) }}
                                >
                                    <List.Item arrow="horizontal">NFC类型</List.Item>
                                </Picker>
                            </List>

                            <InputItem value={this.state.target_nfc} editable={false} labelNumber={6}>NFC编码</InputItem>
                            <InputItem value={this.state.target_name} labelNumber={6} onChange={(value) => { this.setState({ target_name: value }) }}>对象名称</InputItem>
                            <Button loading={this.state.isLoading} disabled={this.state.isLoading} type='primary' style={{ marginTop: 30, width: screenW * 0.7 }} onPress={this.upLoadHandler}>
                                {this.state.isLoading ? '正在上传' : '确定上传'}
                            </Button>
                        </View>
                    </Provider>
                </View>
            </View>
        );
    }
}