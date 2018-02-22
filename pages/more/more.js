// pages/more/more.js
var app = getApp();
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl : app.globalData.baseUrl,
    note_id : 0,
    user_id : 0,
    addStart : 0,
    minusStart: 0,
    addFinish: false,
    minusFinish: false,
    addList: [],
    minusList: [],
    "type": 1, //1为续秒，2为减秒
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      note_id: options.note_id,
      user_id: options.user_id
    })
    this.getAllSecond();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  onReachBottom: function() {
    if((this.data.type == "1" && this.data.addFinish == true) || (this.data.type == "2" && this.data.minusFinish == true))  return;
    this.getAllSecond();
  },

  getAllSecond: function() {
    var that = this;
    console.log(that.data.type);
    wx.request({
      url: app.globalData.baseUrl + 'getAllSecond/' + that.data.user_id + "/" + that.data.note_id + "/" + (that.data.type == 1 ? that.data.addStart : that.data.minusStart) + "/" + that.data.type,
      method: 'GET',
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal)
      },
      success: function(res) {
        console.log(res.data);
        if(that.data.type == 1) {
          for(var i = 0 ; i < res.data.list.length; ++i) {
            res.data.list[i].post_time = util.advanceDay(res.data.list[i].post_time);
            that.data.addList.push(res.data.list[i]);
          }
          that.setData({
            addList: that.data.addList,
            addStart: res.data.start,
            addFinish: res.data.list.length < 20 ? true : false
          })
        } else {
          for (var i = 0; i < res.data.list.length; ++i) {
            res.data.list[i].post_time = util.advanceDay(res.data.list[i].post_time);
            that.data.minusList.push(res.data.list[i]);
          }
          that.setData({
            minusList: that.data.minusList,
            minusStart: res.data.start,
            minusFinish: res.data.list.length < 20 ? true : false
          })
        }
      },
      error: function(err) {
        wx.showToast({
          title: '获取续秒/减秒列表失败'
        })
        console.log("get more fail");
      }
    })
  },

  switchView: function(event) {
    var type_ = event.currentTarget.dataset.type;
    if(type_ != this.data.type) {
      this.setData({
        "type": type_
      })
      if ((type_ == "1" && this.data.addFinish == false) || (type_ == "2" && this.data.minusFinish == false))
        this.getAllSecond();
    }
  }
})