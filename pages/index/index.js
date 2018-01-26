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
      duration: 1000,
      timingFunction: "ease",
    })
    this.animation = animation;
    this.animation.height(0).step()
    this.setData({
      animationData: animation.export()
    })

    var that = this;
    //发出首次加载的请求
    wx.request({
      url: app.globalData.baseUrl + "getTenNoteByTime/" + app.globalData.fadeuserInfo.user_id + "/" + that.data.start + "/" + app.globalData.fadeuserInfo.concern_num,
      method: "GET",
      header: {
        "token": app.globalData.tokenModal
      },
      success: function (res2) {
        console.log(res2.data);
        if(res2.data.err != undefined){
          // console.log("here");
          wx.showModal({
            title: '加载完毕',
            content: '已没有剩余的信息加载',
            complete: that.setData({
              uphidden: true
            })
          })
        }
        else{
          for (var i = 0; i < res2.data.list.length; i++) {
            util.addInformation(i, res2.data.list, that, "push");
          }
          that.setData({
            start: res2.data.start,
            uphidden: true,
            information_list: that.data.information_list
          })  
          console.log(that.data.information_list);
        }
      },
      fail: function () {
        console.log("connect fail");
      }
    })
  },
  //详情页->首页
  onShow: function() {
    var index = app.globalData.detail_item_index;
    if(index != -1) {
      this.data.information_list[index] = app.globalData.detail_item;
      this.setData({
        information_list: this.data.information_list
      })
      console.log(this.data.information_list[index]);
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
      url: '../detail/detail' + (query != undefined ? '?comment=1' : '')
    });
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
        photolisturl.push(res.dataset.img[i].image_url);
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
    var that = this, updateList = [];
    that.data.start = 0;
    for (var i = 0; i < that.data.information_list.length; i++) {
      updateList.push(JSON.stringify({
        note_id : that.data.information_list[i].note_id,
        target_id: that.data.information_list[i].target_id
      }))
    }
    // console.log(updateList.toString().replace(/\"/g, "'"));
    wx.request({
      url: app.globalData.baseUrl + "getMoreNote/" + app.globalData.fadeuserInfo.user_id + "/[" + updateList.toString().replace(/\"/g, "'") + "]",
      method: "GET",
      header: {
        "token" : app.globalData.tokenModal
      },
      success: function (res2) {
        console.log(res2.data);
        if (res2.data.err != undefined) {
          wx.showModal({
            title: '加载完毕',
            content: '已没有剩余的信息加载',
            complete: that.setData({
              uphidden: true
            })
          })
        }
        else {
          var temp_array = new Array();
          temp_array.push.apply(temp_array, that.data.information_list);
          for (var i = 0; i < res2.data.updateList.length; i++) {
            util.updateInformation(i, res2.data.updateList, that.data.information_list, that);
            if (res2.data.updateList[i].is_die == 0) that.data.sub_list.push(res2.data.updateList[i]);
          }
          for (var i = 0; i < res2.data.list.length; i++) {
            util.addInformation(i, res2.data.list, that,"unshift");
          }
          that.setData({
            start: res2.data.start,
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
    this.setData({
      down_show: true
    })
    var that = this;
    //请求新的10条帖子
    wx.request({
      url: app.globalData.baseUrl + "getTenNoteByTime/" + app.globalData.fadeuserInfo.user_id + "/" + that.data.start + "/" + app.globalData.fadeuserInfo.concern_num,
      method: "GET",
      header: {
        "token": app.globalData.tokenModal
      },
      success: function (res2) {
        console.log("reach bottom: "+res2.data);
        if (res2.data.err != undefined || res2.data.list == undefined || res2.data.list.length == 0) {
          // console.log("here");
          wx.showModal({
            title: '加载完毕',
            content: '已没有剩余的信息加载',
            complete: function(){
              that.setData({
                down_show: false
              })
            }
          })
        }
        else {
          for (var i = 0; i < res2.data.list.length; i++) {
            util.addInformation(i, res2.data.list, that, "push");
          }
          that.setData({
            start: res2.data.start || that.data.start,
            down_show: false,
            information_list: that.data.information_list
          })
        }
      },
      fail: function () {
        that.setData({
          down_show: false
        })
        console.log("connect fail");
      }
    })
  },
  changeSecond: function(event) {
    var type = event.target.dataset.type;
    var note_id = event.target.dataset.pos;
    for(var i = 0; i < this.data.information_list.length; i++) {
      if(this.data.information_list[i].note_id == note_id) {
        this.data.information_list[i].action = type;
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
      note_content: that.data.information_list[i].note_content || that.data.information_list[i].origin.note_content,
      head_image_url: app.globalData.fadeuserInfo.head_image_url,
      type: that.data.information_list[i].action,
      target_id: that.data.information_list[i].type == 0 ? that.data.information_list[i].note_id : that.data.information_list[i].target_id
    }
    wx.request({
      url: app.globalData.baseUrl + "changeSecond",
      method: "POST",
      header: {
        "token": app.globalData.tokenModal,
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
            information_list: that.data.information_list
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
  }
})
 