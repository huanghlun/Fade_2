// pages/temp/temp.js
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showSheet: true,
    last_page: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.showActionSheet({
      itemList: ['发布自己的想法'],
      success: function (res) {
        if (res.tapIndex != undefined) {
          console.log(res.tapIndex);
          wx.navigateTo({
            url: '../post/post'
          })
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
        wx.switchTab({
          url: '../index/index'
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!app.globalData.post_finish) {
      wx.showActionSheet({
        itemList: ['发布自己的想法'],
        success: function (res) {
          if(res.tapIndex != undefined) {
            console.log(res.tapIndex);
            wx.navigateTo({
              url: '../post/post'
            })
          }
        },
        fail: function (res) {
          console.log(res.errMsg)
          wx.switchTab({
            url: '../index/index'
          })
        }
      })
    } else {
      app.globalData.post_finish = false;
      var pages = getCurrentPages();
      wx.switchTab({
        url: '../index/index',
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  }
})