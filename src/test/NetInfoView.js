import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    NetInfo
} from 'react-native';
export default class NetInfoView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isConnected: null,
            connectionInfo: null
        }
    }

    componentDidMount() {
        //检测网络是否连接
        NetInfo.isConnected.fetch().done((isConnected) => {
            this.setState({ isConnected });
        });
        //    检测网络连接信息
        NetInfo.fetch().done((connectionInfo) => {
            // this.setState({ connectionInfo });
            console.log('connectionInfo:', connectionInfo);
        });
        //    检测网络变化事件
        NetInfo.addEventListener('change', (networkType) => {
            console.log('检测网络变化事件:', networkType);
            this.setState({ isConnected: networkType !== 'NONE', connectionInfo: networkType })
        })
    }
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    当前的网络状态：
                {this.state.isConnected ? '网络在线' : '离线'}
                </Text>
                <Text style={styles.welcome}>
                    当前的网络连接类型：
                {this.state.connectionInfo}
                </Text>
            </View>
        );
    }

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30
    },
    welcome: {
        fontSize: 16,
        textAlign: 'left',
        margin: 10
    }
});