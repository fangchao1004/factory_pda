import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import AreaGroupView from './AreaGroupView';
import AreaGroupView1 from './AreaGroupView1';
const screenW = Dimensions.get('window').width;

export default class AreaView extends Component {
    render() {
        return (
            <View style={styles.main}>
                <View style={{ width: screenW, height: 70, backgroundColor: '#41A8FF' }}>
                    <Text style={{ margin: 10, marginTop: 30, fontSize: 16, color: '#FFFFFF' }}>设备区域</Text>
                </View>
                <View>
                    {/* <AreaTabs navigation={this.props.navigation} /> */}
                    {/* <Text>123</Text> */}
                    {/* <AreaGroupView navigation={this.props.navigation} /> */}
                    <AreaGroupView1 navigation={this.props.navigation} />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        alignItems: 'center',
    }
})