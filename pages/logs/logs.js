//logs.js
var util = require('../../utils/util.js')
var app = getApp();

Page({
  data: {
    logs: [],
    fadeuserInfo: app.globalData.fadeuserInfo,
    baseUrl: app.globalData.baseUrl,
    fadeID:""
  },
  onLoad: function () {
    console.log(this.data.fadeuserInfo);
    var openID = wx.getStorageSync('user_openid');
    this.setData({
      fadeID: openID,
      fadeuserInfo: app.globalData.fadeuserInfo
    })
  },
  tapSelf: function() {
    wx.navigateTo({
      url: '../self/self'
    })
  }
})
