//logs.js
var util = require('../../utils/util.js')
var app = getApp();

Page({
  data: {
    logs: [],
    userInfo: null,
    fadeuserInfo: null,
    fadeID:""
  },
  onLoad: function () {
    var user_info = app.globalData.userInfo;
    var fade_userInfo = app.globalData.fadeuserInfo;
    var openID = wx.getStorageSync('user_openid');
    this.setData({
      userInfo: user_info,
      fadeuserInfo: fade_userInfo,
      fadeID: openID
    })
    console.log(this.data.userInfo.avatarUrl);
  },
  tapSelf: function() {
    wx.navigateTo({
      url: '../self/self'
    })
  }
})
