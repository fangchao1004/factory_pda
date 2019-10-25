import React from 'react';
import { View, Dimensions } from 'react-native';
import { List, Picker, Provider, Button, InputItem, Toast, TextareaItem, Portal } from '@ant-design/react-native';
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
            nfc_type_data: [{ label: '设备', value: 2 }, { label: '人员', value: 1 }],
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
            var key = Toast.loading('正在注册...')
            let nfc_data = { nfcid: this.state.target_nfc, name: this.state.target_name, type: this.state.nfc_type_select[0] }
            let nfc_id_data = await this.insertNFCInfo(nfc_data); ///插入FNC表，生成自增的id。获取这个id
            if (nfc_id_data !== 0) {
                Portal.remove(key)
                Toast.fail('NFC注册失败', 1); ///NFC 表插入失败
            } else {
                Portal.remove(key)
                Toast.success('NFC注册成功', 1); ///NFC 表插入失败
                setTimeout(() => {
                    this.props.navigation.goBack();
                }, 500);
            }
            this.setState({ isLoading: false })
        } else {
            Toast.fail('请检查是否有未填项');
        }
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