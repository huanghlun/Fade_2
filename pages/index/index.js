//index.js
//获取应用实例
var app = getApp();
var util = require('../../utils/util.js');

Page({
  data: {
    information_list:[],
    id_list: [],
    last_note_id:0,
    inputShowed: false,
    inputVal: "",
    scrollTop: 0,
    windowHeight: 0,
    windowWidth: 0,
    start: 0,
    uphidden: true,
    success_hidden: true,
    down_show: false,

    //new
    progress_length: "350rpx",
    ifXumiao: false,
    downRefresh: true,
    pos : 0,
    baseUrl :"",
    sub_list: [],
    animationData : {}
  },
  onLoad: function () {
    this.setData({
      uphidden: false,
      start: 0,
      windowHeight: app.globalData.windowHeight,
      windowWidth: app.globalData.windowWidth,
      baseUrl: app.globalData.baseUrl,
      information_list: []
    })
    //消失动画
    var animation = wx.createAnimation({
      duration: 1500,
      timingFunction: "ease",
    })
    this.animation = animation;
    this.animation.scale(0, 0).step()
    this.animation.height(0).step()
    this.setData({
      animationData: animation.export()
    })

    this.getTenNoteByTime();
  },
  //详情页->首页，发布页switch->首页
  onShow: function() {
    var index = app.globalData.detail_item_index;
    if(index != -1) {
      util.updateTime(this.data.information_list[index], app.globalData.detail_item, app.globalData.detail_item.origin || app.globalData.detail_item);
      this.setData({
        information_list: this.data.information_list
      })
      console.log(this.data.information_list[index]);
      app.globalData.detail_item_index = -1;
    }

    if(app.globalData.post_item != null) {
      var temp_array = [];
      temp_array.push(app.globalData.post_item);
      util.addInformation(0, temp_array, this.data.information_list, this.data.windowWidth, "unshift");
      temp_array = null;
      app.globalData.post_item = null;
      this.setData({
        information_list : this.data.information_list
      })
      console.log(this.data.information_list);
      wx.showToast({
        title: '发布成功',
        icon: "success"
      })
    }
  },
  //事件处理函数
  navigateTo: function(event) {
    var query = event.target.dataset.comment;
    for(var i = 0; i < this.data.information_list.length; i++) {
      if (this.data.information_list[i].note_id == event.currentTarget.dataset.pos) {
        app.globalData.detail_item = this.data.information_list[i];
        app.globalData.detail_item_index = i;
        break;
      }
    }
    wx.navigateTo({
      url: '../detail/detail?type=0' + (query != undefined ? '&comment=1' : '')
    });
  },
  navigateToOthers: function(event) {
    console.log("navigateTo :" + event.currentTarget.dataset.userid);
    if(event.currentTarget.dataset.userid == app.globalData.fadeuserInfo.user_id) {
      wx.switchTab({
        url: '../logs/logs'
      })
    } else {
      wx.navigateTo({
        url: '../others/others?user_id=' + event.currentTarget.dataset.userid
      })
    }   
  },
  getPhotoWH: function(event) {
    var index = event.target.dataset.pos;
    this.data.information_list[index].photo_width = this.data.windowWidth;
    this.data.information_list[index].photo_height = util.CalPhotoHeight(this.data.information_list[index].photo_width, event.detail.height, event.detail.width);
    this.setData({
      information_list: this.data.information_list
    })
  },
  tapPhoto: function(event) {
    var index = event.target.dataset.pos;
    var that = this;
    var photolisturl = [];
    // console.log("here " + "#id_" + index);
    wx.createSelectorQuery().select("#id_"+index).fields({
      dataset: true
    }, function(res) {
      console.log(res);
      for (var i = 0; i < res.dataset.img.length; i++) {
        photolisturl.push(that.data.baseUrl + res.dataset.img[i].image_url);
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
    }).exec();
  },
  onPullDownRefresh: function(event) {
    var that = this;
    // console.log(updateList.toString().replace(/\"/g, "'"));
    wx.request({
      url: app.globalData.baseUrl + "getMoreNote",
      method: "POST",
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal),
        "Content-type": "application/x-www-form-urlencoded"
      },
      data: {
        user_id : app.globalData.fadeuserInfo.user_id,
        updateList: JSON.stringify(that.data.information_list)
      },
      success: function (res2) {
        console.log(res2.data);
        if (res2.data.err != undefined) {
          wx.showModal({
            title: '加载失败',
            content: '加载信息失败，请检查网络状况',
            complete: that.setData({
              uphidden: true
            })
          })
        }
        else {
          // var temp_array = new Array();
          // temp_array.push.apply(temp_array, that.data.information_list);
          util.cutArray(that.data.information_list, res2.data.list); //终极查重
          for (var i = 0; i < res2.data.updateList.length; i++) {
            util.updateInformation(i, res2.data.updateList, that.data.information_list, that);
            if (res2.data.updateList[i].is_die == 0) that.data.sub_list.push(res2.data.updateList[i]);
          }
          for (var i = 0; i < res2.data.list.length; i++) {
            util.addInformation(i, res2.data.list, that.data.information_list, that.data.windowWidth, "unshift");
          }
          util.noteIfDie(that);
          that.setData({
            uphidden: true,
            sub_list: that.data.sub_list,
            information_list: that.data.information_list
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
  imageError: function (event) {
    console.log(event.detail.errMsg);
  },
  onReachBottom: function(event) {
    var that = this;
    //请求新的10条帖子
    console.log(this.data.downRefresh);
    if(this.data.downRefresh == true) {
      this.setData({
        down_show: true
      })
      this.getTenNoteByTime();
    } 
  },
  changeSecond: function(event) {
    var type_ = event.target.dataset.type;
    var note_id = event.target.dataset.pos;
    for(var i = 0; i < this.data.information_list.length; i++) {
      if(this.data.information_list[i].note_id == note_id) {
        this.data.information_list[i].action = type_;
        break;
      }
    }
    this.setData({
      information_list : this.data.information_list
    })
    var that = this;
    var temp_obj = {
      user_id: app.globalData.fadeuserInfo.user_id,
      nickname: app.globalData.fadeuserInfo.nickname,
      head_image_url: app.globalData.fadeuserInfo.head_image_url,
      "type": that.data.information_list[i].action,
      target_id: that.data.information_list[i].type == 0 ? that.data.information_list[i].note_id : that.data.information_list[i].target_id
    }
    console.log(app.globalData.tokenModal);
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
        var temp = that.data.information_list[i], data1 = res2.data;
        if (res2.data.err != undefined) {
          console.log("changeSecond fail");
        }
        else {
          console.log("changeSecond success");
          util.updateTime(that.data.information_list[i], res2.data.extra, res2.data.extra);
          that.setData({
            information_list : that.data.information_list
          })
        }
      },
      fail: function () {
        console.log("connect fail");
      }
    })
  },
  //页面滚动
  onPageScroll: function(event) {
    var that = this;
    util.noteIfDie(that);
  },
  //上拉或首次获取10条帖子
  getTenNoteByTime: function() {
    var that = this;
    wx.request({
      url: app.globalData.baseUrl + "getTenNoteByTime",
      method: "POST",
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal),
        "Content-type": "application/x-www-form-urlencoded"
      },
      data: {
        user_id: app.globalData.fadeuserInfo.user_id,
        start: that.data.start,
        concern_num: app.globalData.fadeuserInfo.concern_num,
        updateList: JSON.stringify(that.data.information_list)
      },
      success: function (res2) {
        console.log(res2.data);
        if (res2.data.err != undefined) {
          // console.log("here");
          wx.showModal({
            title: '加载失败',
            content: '加载信息失败，请检查网络状况',
            complete: that.setData({
              uphidden: true
            })
          })
        }
        else {
          util.cutArray(that.data.information_list, res2.data.list); //终极查重
          for (var i = 0; i < res2.data.list.length; i++) {
            util.addInformation(i, res2.data.list, that.data.information_list, that.data.windowWidth, "push");
          }
          that.setData({
            start: res2.data.start || that.data.start,
            uphidden: true,
            down_show: false,
            information_list: that.data.information_list,
            downRefresh: res2.data.list.length < 10 ? false : true
          })
          console.log(that.data.information_list);
        }
      },
      fail: function () {
        console.log("connect fail");
      }
    })
  }
})
 