/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { createStackNavigator, createAppContainer } from "react-navigation"
import LoginView1 from './src/login/LoginView1';
import LoginView2 from './src/login/LoginView2';
import MainView from './src/main/MainView';
import ReportView1 from './src/modeOfReport/ReportView1'
import ReportView2 from './src/modeOfReport/ReportView2'
import DeviceDetailView from './src/modeOfDeviceDetail/DeviceDetailView'
import RecordDetailView2 from './src/modeOfDeviceDetail/RecordDetailView2'
import RegisterDeviceView from './src/modeOfRegsiterDevice/RegisterDeviceView'
import NetInfoView from './src/test/NetInfoView'
import AreaDeviceView from './src/modeOfArea/AreaDeviceView'

const AppNavigator = createStackNavigator({
  NetInfoView: { screen: NetInfoView },
  LoginView1: { screen: LoginView1 },
  LoginView2: { screen: LoginView2 },
  MainView: { screen: MainView },
  ReportView1: { screen: ReportView1 },////模版报告界面
  ReportView2: { screen: ReportView2 },
  DeviceDetailView: { screen: DeviceDetailView },
  RecordDetailView2: { screen: RecordDetailView2 },
  RegisterDeviceView: { screen: RegisterDeviceView },
  AreaDeviceView: { screen: AreaDeviceView },
},
  {//定义配置
    initialRouteName: 'LoginView1',     //设置初始路由为Home
    mode: 'card', // 页面切换模式, 左右是card(相当于iOS中的push效果), 上下是modal(相当于iOS中的modal效果)
    headerMode: 'none', // 导航栏的显示模式, screen: 有渐变透明效果, float: 无透明效果, none: 隐藏导航栏,隐藏所有导航
    onTransitionStart: () => { },  // 回调
    onTransitionEnd: () => { }  // 回调
  });
const AppContainer = createAppContainer(AppNavigator);

export default class App extends Component {
  render() {
    return (
      <AppContainer />
    );
  }
}

if (!__DEV__) {
  global.console = {
    info: () => { },
    log: () => { },
    warn: () => { },
    debug: () => { },
    error: () => { }
  };
}
