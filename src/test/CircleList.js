import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ListView, Image, Dimensions } from 'react-native'
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
let { width, height } = Dimensions.get('window');

import RadioGroup from './RadioGroup';

export default class CircleList extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            sexArray: [
                {
                    title: '男salad',
                    image: require('../../assets/tabBar/area2.png'),
                    image2: require('../../assets/tabBar/area1.png'),
                },
                {
                    title: '女自行车自行车',
                    image: require('../../assets/tabBar/area2.png'),
                    image2: require('../../assets/tabBar/area1.png'),
                }
            ],
        };
    }


    render() {
        return (
            <View style={{ height: 44, flex: 1 }}>
                <RadioGroup
                    style={{ flexDirection: 'row' }}//整个组件的样式----这样可以垂直和水平
                    // conTainStyle={{ height: 44, width: 60 }}//图片和文字的容器样式
                    imageStyle={{ width: 25, height: 25 }}//图片样式
                    textStyle={{ color: 'black' }}//文字样式
                    selectIndex={'0'}//空字符串,表示不选中,数组索引表示默认选中
                    data={this.state.sexArray}//数据源
                    onPress={(index, item) => {
                        console.warn(index)
                        console.warn(item.title)
                    }}
                />
            </View>
        )
    }
}