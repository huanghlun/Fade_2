//logs.js
var util = require('../../utils/util.js')
var app = getApp();

Page({
  data: {
    logs: [],
    fadeuserInfo: null,
    baseUrl: app.globalData.baseUrl,
    fade_start:0,
    fade_list:[],
    fadeID:""
  },
  onLoad: function (options) {
    var openID = wx.getStorageSync('user_openid');
    this.setData({
      fadeID: openID,
      fadeuserInfo: app.globalData.fadeuserInfo
    })
    var that = this;
    wx.request({
      url: app.globalData.baseUrl + 'getMyNote/' + app.globalData.fadeuserInfo.user_id + '/' + that.data.fade_start,
      method: 'GET',
      header: {
        "token": app.globalData.tokenModal
      },
      success: function(res) {
        console.log(res.data);
        for (var i = 0; i < res.data.list.length; i++) {
          util.addInformation(i, res.data.list, that.data.fade_list, app.globalData.windowWidth, "push");
        }
        that.setData({
          fade_start: res.data.start,
          fade_list: that.data.fade_list
        })  
      },
      error: function(err) {
        console.log(err);
      }
    })

    wx.request({
      url: app.globalData.baseUrl + 'getPersonPage/' + app.globalData.fadeuserInfo.user_id + '/' + app.globalData.fadeuserInfo.user_id,
      method: 'GET',
      header: {
        "token": app.globalData.tokenModal
      },
      success: function(res) {
        that.setData({
          fadeuserInfo: res.data.user
        })
      },
      error: function(err) {
        console.log(err);
      }
    })

  },
  tapSelf: function() {
    wx.navigateTo({
      url: '../self/self'
    })
  },

})
