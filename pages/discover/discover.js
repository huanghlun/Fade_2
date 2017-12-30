// pages/discover/discover.js
//获取应用实例
var app = getApp();
var util = require('../../utils/util.js');

function sortLife(a, b) {
  return b.life - a.life;
}

Page({
  data: {
    information_list: [],
    zan_icon: "../../image/心形.png",
    comment_picture: "../../image/发现/评论.png",
    repost_picture: '../../image/发现/转发.png',
    zan_picture: '../../image/发现/+1S静态.png',
    inputShowed: false,
    inputVal: "",
    scrollTop: 0,
    windowHeight: 0,
    windowWidth: 0,
    hidden: true,
    uphidden: true,
    success_hidden: true,
    down_show: false,
    hot_id: "0",
    start: 0,
    userinfo: {}
  },
  onLoad: function () {
    this.setData({
      uphidden: false
    })
    var that = this;
    //获取设备信息
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
    //发出首次加载的请求
    wx.request({
      url: "https://sysufade.cn/fade/note",
      data: {
        start: that.data.start.toString(),
        hot_id: that.data.hot_id,
        user_id: app.globalData.fadeuserInfo.user_id,
        code: "05"
      },
      method: "GET",
      success: function (res2) {
        console.log(res2);
        if (res2.data.err == "0") {
          wx.showModal({
            title: '加载完毕',
            content: '已没有剩余的信息加载',
            complete: that.setData({
              uphidden: true
            })
          })
        }
        else {
          for(var i = 0; i < res2.data.result.length; i++) {
            util.updateInformation(i, res2.data.result, that, 0, "discover");
          }
          that.setData({
            uphidden: true,
            down_show: true,
            information_list: that.data.information_list,
            hot_id: res2.data.hot_id
          })
        }
      },
      fail: function () {
        console.log("connect fail");
      }
    })
  },
  //事件处理函数
  negavitorTo: function (event) {
    console.log(event.detail);
  },
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  imageError: function (event) {
    console.log(event.detail.errMsg);
  },
  tapPhoto: function (event) {
    var index = event.target.dataset.pos;
    var that = this;
    var photolisturl = [];
    for (var i = 0; i < that.data.information_list[index].photoList.length; i++) {
      photolisturl.push(that.data.information_list[index].photoList[i].image_url);
    }
    wx.previewImage({
      urls: photolisturl,
      fail: function () {
        wx.showToast({
          title: '图片加载失败，请稍后重试',
          icon: 'loading'
        })
      }
    })
  },
  onPullDownRefresh: function (event) { //下拉刷新
    var that = this;
    that.data.start = 0;
    wx.request({
      url: "https://sysufade.cn/fade/note",
      data: {
        start: that.data.start.toString(),
        hot_id: "0",
        user_id: app.globalData.fadeuserInfo.user_id,
        code: "05"
      },
      method: "GET",
      success: function (res2) {
        console.log(res2);
        if (res2.data.err == "0") {
          wx.showModal({
            title: '加载完毕',
            content: '已没有剩余的信息加载',
            complete: that.setData({
              uphidden: true
            })
          })
        }
        else {
          that.data.information_list = [];
          for (var i = 0; i < res2.data.result.length; i++) {
            util.updateInformation(i, res2.data.result, that, 0, "discover");
          }
          that.setData({
            information_list: that.data.information_list,
            uphidden: true
          })
        }
        
      },
      fail: function () {
        console.log("connect fail");
      },
      complete: function() {
        wx.stopPullDownRefresh();
      }
    })
  },
  onReachBottom: function (event) { //上拉刷新
    this.setData({
      hidden: false
    })
    var that = this;
    that.data.start++;
    wx.request({
      url: "https://sysufade.cn/fade/note",
      data: {
        start: that.data.start.toString(),
        hot_id: "0",
        user_id: app.globalData.fadeuserInfo.user_id,
        code: "05"
      },
      method: "GET",
      success: function (res2) {
        console.log(res2);
        if(res2.data.err == "0"){
          that.setData({
            hidden: true,
            success_hidden: false
          })
        }
        else{
          var origin_length = that.data.information_list.length;
          for (var i = 0; i < res2.data.result.length; i++) {
            util.updateInformation(i, res2.data.result, that, origin_length, "discover");
          }
          that.setData({
            information_list: that.data.information_list,
            hidden: true
          })
        }
      },
      fail: function () {
        console.log("connect fail");
      }
    })
  },
  tapzan: function (event) {
    var index = event.target.dataset.pos;
    var that = this;
    if (that.data.information_list[index].tapclick == 0) {
      wx.request({
        url: "https://sysufade.cn/fade/note",
        data: {
          note_id: this.data.information_list[index].note_id,
          user_id: app.globalData.fadeuserInfo.user_id,
          isRelay: this.data.information_list[index].isRelay,
          code: "07"
        },
        method: "GET",
        success: function (res2) {
          console.log(res2);
          if (res2.data.json === undefined) {
            that.data.information_list[index].tapclick ++;
            that.data.information_list[index].zan_num = res2.data.good_num;
            that.data.information_list[index].tapZan = true;
            that.data.information_list[index].zanWidth = 40;
            var life_str = util.calLeftTime(that.data.information_list[index].zan_num, that.data.information_list[index].post_time, "discover");
            that.data.information_list[index].life = life_str;
            that.setData({
              information_list: that.data.information_list
            })
          }
        },
        fail: function () {
          console.log("connect fail");     
        }
      })
    }
  },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: true
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  }
})
