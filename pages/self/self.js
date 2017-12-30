// pages/self/self.js
var util = require('../../utils/util.js')
var app = getApp();
Page({
  data: {
    fadeuserInfo: null
  },
  onLoad: function (options) {
    this.setData({
      fadeuserInfo: app.globalData.fadeuserInfo
    })
  }
})