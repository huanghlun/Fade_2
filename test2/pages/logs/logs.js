//logs.js
var util = require('../../utils/util.js')
var app = getApp();

Page({
  data: {
    logs: [],
    userInfo: {},
    fadeID:""
  },
  onLoad: function () {
    var user_info = app.globalData.userInfo;
    var openID = wx.getStorageSync('user_openid');
    this.setData({
      userInfo: user_info,
      fadeID: openID
    })
  }
})
