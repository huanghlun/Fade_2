// pages/notice/notice.js
var app = getApp();

Page({
  data: {
    progress_num : 0,
    fans_num: 0,
    comment_num : 0
  },

  onLoad: function (options) {
    var that = this;
    //获取续秒评论粉丝数
    wx.request({
      url: app.globalData.baseUrl + "getAddMessage/" + app.globalData.fadeuserInfo.user_id,
      method: "GET",
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal)
      },
      success: function (res2) {
        console.log(res2.data);
        if (res2.data.err != undefined) {
          console.log("update fail");
        } else {
          app.globalData.addProgressNum = 0;
          app.globalData.addFansNum = 0;
          app.globalData.addCommentNum = 0;
          that.setData({
            progress_num: res2.data.addContributeNum,
            fans_num: res2.data.addFansNum,
            comment_num: res2.data.addCommentNum
          })
        }
      },
      fail: function () {
        console.log("update fail");
      }
    })
  },

  onReady: function () {
    var that = this;
    //响应websocket
    wx.onSocketMessage(function (res) {
      console.log('notice收到服务器内容：' + res.data);
      var data = JSON.parse(res.data);
      if (data.success == "00") {
        that.setData({
          progress_num: ++that.data.progress_num
        })
      } else if (data.success == "01") {
        that.setData({
          fans_num: ++that.data.fans_num
        })
      } else if (data.success == "02") {
        that.setData({
          comment_num: ++that.data.comment_num 
        })
      }
      console.log(that.data);
    })
  },

  onShow: function () {
    //更新数量
    // this.setData({
    //   progress_num: this.data.progress_num,
    //   fans_num: 0,
    //   comment_num: 0
    // })
  },

  onHide: function () {
  
  },


  onPullDownRefresh: function () {
  
  },

  onReachBottom: function () {
  
  },

  tapNav: function(event) {
    var type_ = event.currentTarget.dataset.type;
    switch(type_) {
      case "1" :
        this.setData({
          progress_num : 0
        })
        break;
      case "2":
        this.setData({
          fans_num: 0
        })
        break;
      case "3":
        this.setData({
          comment_num: 0
        })
        break;  
    }
  }
})