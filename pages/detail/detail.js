// pages/detail/detail.js
var app = getApp();
var util = require('../../utils/util.js');

Page({
  data: {
    item: app.globalData.detail_information,
    hot_comment_list: [],
    normal_comment_list: [],
    zan_icon: "../../image/心形.png",
    comment_picture: "../../image/发现/评论.png",
    repost_picture: '../../image/发现/转发.png',
    zan_picture: '../../image/发现/+1S静态.png'
  },
  onShow: function(){
    this.setData({
      item: app.globalData.detail_information
    })
    var that = this;
    wx.request({
      url: "https://sysufade.cn/fade/comment", 
      data: {
        note_id: app.globalData.detail_information.note_id,
        user_id: app.globalData.fadeuserInfo.user_id,
        code: "05"
      },
      success: function (res2) {
        console.log(res2);
        if(res2.data.err === undefined){
          that.setData({
            hot_comment_list: res2.data.hot_comment,
            normal_comment_list: res2.data.normal_comment
          })
        }
      }
    })
  },
  tapPhoto: function (event) {
    var index = event.target.dataset.pos;
    var that = this;
    var photolisturl = [];
    for (var i = 0; i < that.data.item.photoList.length; i++) {
      photolisturl.push(that.data.item.photoList[i].image_url);
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
  tapzan: function (event) {
    var index = event.target.dataset.pos;
    var that = this;
    if (that.data.item.tapclick == 0) {
      wx.request({
        url: "https://sysufade.cn/fade/note",
        data: {
          note_id: this.data.item.note_id,
          user_id: app.globalData.fadeuserInfo.user_id,
          isRelay: this.data.item.isRelay,
          code: "07"
        },
        method: "GET",
        success: function (res2) {
          console.log(res2);
          if (res2.data.json === undefined) {
            that.data.item.tapclick++;
            that.data.item.zan_num = res2.data.good_num;
            that.data.item.tapZan = true;
            that.data.item.zanWidth = 40;
            var life_str = util.calLeftTime(that.data.item.zan_num, that.data.item.post_time, "index");
            that.data.item.life = life_str;
            that.setData({
              item: that.data.item
            })
            app.globalData.detail_information = that.data.item;
          }
        },
        fail: function () {
          console.log("connect fail");
        }
      })
    }
  }
})