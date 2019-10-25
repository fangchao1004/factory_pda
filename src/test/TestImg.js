import React, { Component } from 'react';
import { View, PermissionsAndroid, Platform } from 'react-native'
import { ImagePicker } from '@ant-design/react-native'

class TestImg extends Component {

    async componentWillMount() {
       await requestReadExteralStorage();
    }
    render() {
        return (
            <View>
                <ImagePicker onChange={(e)=>{this.onChangeHandler(e)}}/>
            </View>
        );
    }

    onChangeHandler=(e)=>{
        console.log(e);
    }
}

async function requestReadExteralStorage() {
    console.log('12312');
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    'title': '从外部存储加载照片的权限',
                    'message': '必须授予权限才能在手机上列出照片供您选择。'
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {

            } else {
                console.log("READ_EXTERNAL_STORAGE permission denied!")
            }
        } catch (err) {
            console.log(err)
        }
    }
}

export default TestImg;