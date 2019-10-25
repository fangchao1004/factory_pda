/* tslint:disable:no-console */
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import {
    Button,
    Modal,
    WhiteSpace,
    WingBlank,
    Toast,
    Provider,
} from '@ant-design/react-native';
export default class BasicModalExample extends React.Component {
    constructor(props) {
        super(props);
        
        // this.onButtonClick = () => {
        //     Modal.alert('Title', 'alert content', [
        //         {
        //             text: 'Cancel',
        //             onPress: () => console.log('cancel'),
        //             style: 'cancel',
        //         },
        //         { text: 'OK', onPress: () => console.log('ok') },
        //     ]);
        // };
        this.state = {
            visible: false,
        };
    }

    onClose = () => {
        this.setState({
            visible: false,
        });
    };

    render() {
        const footerButtons = [
            { text: '取消', onPress: () => console.log('cancel') },
            { text: '确认', onPress: () => console.log('ok') },
        ];
        return (
            <Provider>
                <ScrollView style={{ marginTop: 20 }}>
                        <Button onPress={() => this.setState({ visible: true })}>
                            showModal
                        </Button>
                        <WhiteSpace />
                        {/* <WhiteSpace />
                        <Button onPress={this.onButtonClick}>Modal.alert</Button>
                        <WhiteSpace /> */}
                    <Modal
                        title="注意"
                        transparent
                        onClose={this.onClose}
                        maskClosable
                        visible={this.state.visible}
                        closable
                        footer={footerButtons}
                    >
                        <View style={{ paddingVertical: 20 }}>
                            <Text style={{ textAlign: 'center' }}>Content...</Text>
                            <Text style={{ textAlign: 'center' }}>Content...</Text>
                        </View>
                    </Modal>
                </ScrollView>
            </Provider>
        );
    }
}
