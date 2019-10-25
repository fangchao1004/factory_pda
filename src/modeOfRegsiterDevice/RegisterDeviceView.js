import React, { Component } from 'react';
import { View, Text, Dimensions } from 'react-native'
import BindNFCView from './BindNFCView'
const screenW = Dimensions.get('window').width;

export default class RegisterDeviceView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nfcid: null
        }
    }
    componentDidMount() {
        this.init();
    }
    init = () => {
        let AllData = this.props.navigation.state.params
        this.setState({
            nfcid: AllData.nfcid
        })
    }
    render() {
        return (
            <View>
                <View style={{ width: screenW, height: 70, backgroundColor: '#41A8FF' }}>
                    <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>设备注册</Text>
                </View>
                <BindNFCView nfcid={this.state.nfcid} navigation={this.props.navigation} />
            </View>
        );
    }
}
