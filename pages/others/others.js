//logs.js
var util = require('../../utils/util.js')
var app = getApp();

Page({
  data: {
    logs: [],
    fadeuserInfo: null,
    baseUrl: app.globalData.baseUrl,
    fade_start: 0,
    fade_list: [],
    live_start: 0,
    user_id: 0,
    my_id: 0,
    live_list: [],
    live_finish: false,
    fade_finish: false,
    isConcern: 0,
    showView: "0"
  },
  onLoad: function (options) {
    this.setData({
      my_id: app.globalData.fadeuserInfo.user_id,
      user_id: options.user_id
    })
    var that = this;
    this.getPersonPage(this.data.user_id, app.globalData.fadeuserInfo.user_id);
  },

  //从详情页跳转回来
  onShow: function () {
    var index = app.globalData.detail_item_index;
    if (index != -1) {
      if (this.data.showView == "0") {
        this.data.live_list[index] = app.globalData.detail_item;
        this.setData({
          live_list: this.data.live_list
        })
      } else {
        this.data.fade_list[index] = app.globalData.detail_item;
        this.setData({
          live_list: this.data.fade_list
        })
      }
    }
    app.globalData.detail_item_index = -1;
  },

  onPullDownRefresh: function () {
    this.getPersonPage(this.data.user_id, app.globalData.fadeuserInfo.user_id);
  },

  onReachBottom: function () {
    //获取动态
    switch (this.data.showView) {
      case "0":
        if (this.data.live_finish == false)
          this.getLiveNote(this.data.user_id, app.globalData.fadeuserInfo.user_id, this.data.live_start, "push");
        break;
      case "1":
        if (this.data.fade_finish == false)
          this.getOtherPersonNote(this.data.user_id, this.data.my_id, this.data.fade_start, "push");
        break;
    }
  },

  switchView: function (event) {
    var type_ = event.currentTarget.dataset.type;
    if (this.data.showView != type_) {
      this.setData({
        showView: type_
      })
      switch (type_) {
        case "0":
          if (this.data.live_list.length == 0) {
            //首次获取live_list
            this.getLiveNote(this.data.user_id, app.globalData.fadeuserInfo.user_id, 0, "push");
          } else {
            //更新Live
            this.getLiveNote(this.data.user_id, app.globalData.fadeuserInfo.user_id, 0, "unshift");
          }
          break;
        case "1":
          if (this.data.fade_list.length == 0) {
            //首次获取fade
            this.getOtherPersonNote(this.data.user_id, this.data.my_id, 0, "push");
          } else {
            //更新fade看看有没有新增的
            this.getOtherPersonNote(this.data.user_id, this.data.my_id, 0, "unshift");
          }
          break;
      }
    }
  },

  tapSelf: function () {
    wx.navigateTo({
      url: '../self/self'
    })
  },

  //点击图片
  tapPhoto: function (event) {
    var index = event.target.dataset.pos;
    var that = this;
    var photolisturl = [];
    // console.log("here " + "#id_" + index);
    wx.createSelectorQuery().select("#id_" + index).fields({
      dataset: true
    }, function (res) {
      for (var i = 0; i < res.dataset.img.length; i++) {
        photolisturl.push(that.data.baseUrl + res.dataset.img[i].image_url);
      }
      console.log(photolisturl);
      wx.previewImage({
        urls: photolisturl,
        fail: function () {
          wx.showToast({
            title: '图片加载失败，请稍后重试',
            icon: 'loading'
          })
        }
      })
    }).exec();
  },

  //跳转
  navigateTo: function (event) {
    var query = event.target.dataset.comment;
    if (this.data.showView == "0") {
      for (var i = 0; i < this.data.live_list.length; i++) {
        if (this.data.live_list[i].note_id == event.currentTarget.dataset.pos) {
          app.globalData.detail_item = this.data.live_list[i];
          app.globalData.detail_item_index = i;
          break;
        }
      }
    } else {
      for (var i = 0; i < this.data.fade_list.length; i++) {
        if (this.data.fade_list[i].note_id == event.currentTarget.dataset.pos) {
          app.globalData.detail_item = this.data.fade_list[i];
          app.globalData.detail_item_index = i;
          break;
        }
      }
    }
    wx.navigateTo({
      url: '../detail/detail?type=1' + (query != undefined ? '&comment=1' : '')
    });
  },

  navigateToOthers: function (event) {
    wx.navigateTo({
      url: '../others/others?user_id=' + event.currentTarget.dataset.userid
    })
  },

  //获取刷新个人信息
  getPersonPage: function (user_id, my_id) {
    var that = this;
    wx.request({
      url: app.globalData.baseUrl + 'getPersonPage/' + user_id + '/' + my_id,
      method: 'GET',
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal)
      },
      success: function (res) {
        console.log(res.data);
        that.data.live_list = [];
        for (var i = 0; i < res.data.query.list.length; i++) {
          util.addInformation(i, res.data.query.list, that.data.live_list, app.globalData.windowWidth, "push");
        }
        that.setData({
          isConcern: res.data.isConcern,
          fadeuserInfo: res.data.user,
          live_list: that.data.live_list,
          live_start: res.data.query.start
        })
      },
      error: function (err) {
        console.log(err);
      }
    })
  },

  //获取动态
  getLiveNote: function (user_id, my_id, start, mark) {
    var that = this;
    wx.request({
      url: app.globalData.baseUrl + 'getLiveNote/' + user_id + '/' + my_id + '/' + start,
      method: 'GET',
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal)
      },
      success: function (res) {
        console.log(res.data);
        if (mark == 'unshift') {
          util.cutArray(that.data.live_list, res.data.list); //查重
          for (var i = res.data.list.length - 1; i >= 0; --i) {
            util.addInformation(i, res.data.list, that.data.live_list, app.globalData.windowWidth, "unshift");
          }
        } else {
          for (var i = 0; i < res.data.list.length; ++i) {
            util.addInformation(i, res.data.list, that.data.live_list, app.globalData.windowWidth, "push");
          }
        }
        that.setData({
          live_start: (mark == 'push' && res.data.list.length >= 10) ? res.data.start : that.data.live_start,
          live_list: that.data.live_list,
          live_finish: res.data.list.length >= 10 ? false : true
        })
      },
      error: function (err) {
        console.log(err);
      }
    })
  },

  //获取自己原创fade
  getOtherPersonNote: function (user_id, my_id, start, mark) {
    var that = this;
    wx.request({
      url: app.globalData.baseUrl + 'getOtherPersonNote/' + user_id + '/' + my_id + '/' + start,
      method: 'GET',
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal)
      },
      success: function (res) {
        console.log(res.data);
        if (mark == 'unshift') {
          util.cutArray(that.data.fade_list, res.data.list); //查重
          for (var i = res.data.list.length - 1; i >= 0; --i) {
            util.addInformation(i, res.data.list, that.data.fade_list, app.globalData.windowWidth, "unshift");
          }
        } else {
          for (var i = 0; i < res.data.list.length; ++i) {
            util.addInformation(i, res.data.list, that.data.fade_list, app.globalData.windowWidth, "push");
          }
        }
        that.setData({
          fade_start: mark == 'push' ? res.data.start : that.data.fade_start,
          fade_list: that.data.fade_list,
          fade_finish: res.data.list.length >= 10 ? false : true
        })
      },
      error: function (err) {
        console.log(err);
      }
    })
  },

  changeSecond: function (event) {
    var type_ = event.target.dataset.type;
    var list_name = event.target.dataset.list;
    var note_id = event.target.dataset.pos;
    if (list_name == 'fade') {
      for (var i = 0; i < this.data.fade_list.length; i++) {
        if (this.data.fade_list[i].note_id == note_id) {
          this.data.fade_list[i].action = type_;
          break;
        }
      }
    } else {
      for (var i = 0; i < this.data.live_list.length; i++) {
        if (this.data.live_list[i].note_id == note_id) {
          this.data.live_list[i].action = type_;
          break;
        }
      }
    }
    this.setData({
      live_list: this.data.live_list,
      fade_list: this.data.fade_list
    })
    var that = this;
    var temp_obj = {
      user_id: app.globalData.fadeuserInfo.user_id,
      nickname: app.globalData.fadeuserInfo.nickname,
      head_image_url: app.globalData.fadeuserInfo.head_image_url,
      "type": list_name == "fade" ? that.data.fade_list[i].action : that.data.live_list[i].action,
      target_id: list_name == "fade" ? that.data.fade_list[i].note_id : that.data.live_list[i].note_id
    }
    wx.request({
      url: app.globalData.baseUrl + "changeSecond",
      method: "POST",
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal),
        "Content-type": "application/x-www-form-urlencoded"
      },
      data: {
        note: JSON.stringify(temp_obj)
      },
      success: function (res2) {
        console.log(res2.data);
        var temp = list_name == "fade" ? that.data.fade_list[i] : that.data.live_list[i],
          data1 = res2.data;
        if (res2.data.err != undefined) {
          console.log("changeSecond fail");
        } else {
          console.log("changeSecond success");
          util.updateTime(temp, res2.data.extra, res2.data.extra);
          that.setData({
            fade_list: that.data.fade_list,
            live_list: that.data.live_list
          })
        }
      },
      fail: function () {
        console.log("connect fail");
      }
    })
  }
})
