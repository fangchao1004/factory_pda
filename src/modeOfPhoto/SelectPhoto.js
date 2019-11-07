import React, { Component } from 'react';
import ImagePicker from 'react-native-image-picker'; //第三方相机
import { Dimensions, View, StyleSheet, FlatList, ImageBackground, Image } from 'react-native'
import { Button, Icon } from '@ant-design/react-native'

const screenW = Dimensions.get('window').width;
const ListWidth = screenW * 0.9
const Margin = 10;
const cols = 2; // 列数
const ImageViewWidth = (ListWidth - (cols + 1) * Margin) / cols; // 图片容器View大小
const options = {
    //底部弹出框选项
    title: '请选择以下方式:',
    cancelButtonTitle: '取消',
    takePhotoButtonTitle: '拍照',
    chooseFromLibraryButtonTitle: null,
    maxWidth: 720,
    maxHeight: 960,
    angle: 0,
    quality: 1, ////
    allowsEditing: false,
    noData: false,
    storageOptions: {
        skipBackup: true,///跳过云备份
        path: 'images' ///保存的路径
    }
};

export default class SelectPhoto extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }
    render() {
        return (
            <View style={styles.main}>
                {this.renderList()}
                <Button style={{ marginTop: 20, height: 35, width: 100, borderColor: '#41A8FF' }} onPress={this.selectPhotoHandler}>
                    <Icon name="camera" color="#41A8FF" style={{ width: 32, height: 32 }} />
                </Button>
            </View>
        );
    }

    selectPhotoHandler = () => {
        ImagePicker.showImagePicker(options, (response) => {
            // console.log('Response = ', response);
            if (response.didCancel) {
                // console.log('User cancelled photo picker');
            }
            else if (response.error) {
                // console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {///选择了自定义的按钮
                // console.log('User tapped custom button: ', response.customButton);
            }
            else {
                let source = { uri: response.uri, key: response.data, fileName: response.fileName };
                var copyArr = JSON.parse(JSON.stringify(this.state.data))
                copyArr.push(source)
                this.setState({
                    data: copyArr
                });
                if (this.props.onChange) {
                    this.props.onChange(copyArr)
                }
            }
        });
    }

    renderList = () => {
        return (
            <View style={styles.FlatListView}>
                <FlatList
                    data={this.state.data}
                    // numColumns={cols}
                    horizontal={true}
                    renderItem={({ item }) => {
                        return (
                            <View>
                                <ImageBackground source={item} style={styles.image}>
                                    <Icon name='close' style={styles.icon} onPress={() => {
                                        this.removeOnePic(item);
                                    }} />
                                </ImageBackground>
                            </View>
                        )
                    }
                    }
                />
            </View>
        )
    }

    removeAll = () => {
        this.setState({
            data: []
        })
        if (this.props.onChange) {
            this.props.onChange([])
        }
    }

    removeOnePic = (item) => {
        let copyArr = JSON.parse(JSON.stringify(this.state.data))
        let newArr = copyArr.filter((element) => {
            return element.uri != item.uri
        })
        this.setState({
            data: newArr
        })
        if (this.props.onChange) {
            this.props.onChange(newArr)
        }
    }

    uploadHandler = () => {
        // console.log(this.state.data);
        let copyArr = JSON.parse(JSON.stringify(this.state.data))
        let base64Arr = [];
        copyArr.forEach(element => {
            base64Arr.push({ base64data: element.key, fileName: element.fileName });
        });
    }
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        width: ListWidth,
        alignItems: 'center',
        backgroundColor: '#ffffff'
    },
    FlatListView: {
        width: ListWidth,
        height: 215,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        // borderBottomWidth: 2,
        // borderBottomColor: '#72B7F1',
    },
    image: {
        marginTop: Margin,
        marginLeft: Margin,
        width: ImageViewWidth,
        height: ImageViewWidth * 4 / 3,
    },
    icon: {
        width: 35,
        height: 35,
        marginTop: 10,
        marginLeft: ImageViewWidth - Margin - 20
    }
})