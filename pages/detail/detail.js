// pages/detail/detail.js
var app = getApp();
var util = require('../../utils/util.js');

Page({
  data: {
    item: null,
    baseUrl : "",
    input_focus: false,
    input_value: "",
    input_placeholder : "发表评论",
    comment_type: "",
    comment_item : null,
    windowHeight: 0,
    lowerRequest: true,
    skip_type: 0,
    scrollTop: 0,
    scrollIntoView: ""
  },
  onLoad: function (option){
    var that = this;
    console.log(this.data.item);
    this.setData({
      skip_type: option.type,
      item: app.globalData.detail_item,
      baseUrl: app.globalData.baseUrl,
      windowHeight: app.globalData.windowHeight
    })
    if (option.comment == 1) {
      this.setData({
        scrollIntoView: "comment_0"
      })
    }
    wx.request({
      url: app.globalData.baseUrl + "getNotePage/" + (app.globalData.detail_item.type == 0 ? app.globalData.detail_item.note_id : app.globalData.detail_item.origin.note_id) + "/" + app.globalData.fadeuserInfo.user_id + "/0",
      method: "GET",
      header: {
        "token": app.globalData.tokenModal
      },
      success: function (res2) {
        console.log(res2.data);
        if (res2.data.err != undefined) {
          // console.log("here");
          wx.showModal({
            title: '加载失败',
            content: '原贴已消失',
            complete: function () {
              wx.navigateBack({
                url: "/index"
              })
            }
          })
        }
        else {
          console.log("success");
          var comment_list = res2.data.commentQuery.list;
          for (var j = 0; j < comment_list.length; ++j) {
            comment_list[j].comment_time = util.advanceDay(comment_list[j].comment_time);
            for (var m = 0; m < comment_list[j].comments.length; ++m) {
              comment_list[j].comments[m].comment_time = util.advanceDay(comment_list[j].comments[m].comment_time);
            }
          }
          that.data.item.comment_list = comment_list;
          that.data.item.comment_start = res2.data.commentQuery.start;
          that.data.item.xumiao_list = res2.data.noteQuery.list;
          that.data.item.xumiao_start = res2.data.noteQuery.start;
          util.updateTime(that.data.item, res2.data.note, res2.data.note);
          that.setData({
            item: that.data.item,
            lowerRequest: that.data.item.comment_list.length < 10 ? false : true
          })
        }
      },
      fail: function () {
        console.log("connect fail");
      }
    })
  },
  onUnload: function() {
    console.log("detail unload");
    app.globalData.detail_item = this.data.item;
    this.setData({
      item: null
    })
  }, 
  scrollToLow: function() {
    console.log("toLow" + this.data.item.comment_start);
    var that = this;
    if(!this.data.lowerRequest) return;
    wx.request({
      url: app.globalData.baseUrl + "getTenComment/" + (app.globalData.detail_item.type == 0 ? app.globalData.detail_item.note_id : app.globalData.detail_item.origin.note_id) + "/" + that.data.item.comment_start,
      method: "GET",
      header: {
        "token": app.globalData.tokenModal
      },
      success: function (res2) {
        console.log(res2.data);
        if (res2.data.err != undefined) {
          wx.showModal({
            title: '加载失败',
            content: '原贴已消失',
            complete: function () {
              wx.navigateBack({
                url: "/index"
              })
            }
          })
        }
        else {
          var comment_list = res2.data.list;
          for (var j = 0; j < comment_list.length; ++j) {
            comment_list[j].comment_time = util.advanceDay(comment_list[j].comment_time);
            for (var m = 0; m < comment_list[j].comments.length; ++m) {
              comment_list[j].comments[m].comment_time = util.advanceDay(comment_list[j].comments[m].comment_time);
            }
          }
          that.data.item.comment_list.push.apply(that.data.item.comment_list, comment_list);
          that.data.item.comment_start = res2.data.start;
          that.setData({
            item: that.data.item,
            lowerRequest: that.data.item.comment_list.length < 10 ? false : true
          })
          console.log(that.data.item);
        }
      },
      fail: function () {
        console.log("connect fail");
      }
    })
  },
  tapPhoto: function (event) {
    var index = event.target.dataset.pos;
    var that = this;
    var photolisturl = [];
    // console.log("here " + "#id_" + index);
    wx.createSelectorQuery().select("#id_" + index).fields({
      dataset: true
    }, function (res) {
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
  changeSecond: function (event) {
    var type = event.target.dataset.type;
    this.data.item.action = type;
    this.setData({
      item: this.data.item
    })
    var that = this;
    var temp_obj = {
      user_id: app.globalData.fadeuserInfo.user_id,
      nickname: app.globalData.fadeuserInfo.nickname,
      note_content: that.data.item.note_content || that.data.item.origin.note_content,
      head_image_url: app.globalData.fadeuserInfo.head_image_url,
      type: that.data.item.action,
      target_id: that.data.item.type == 0 ? that.data.item.note_id : that.data.item.target_id
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
        var temp = that.data.item, data1 = res2.data;
        if (res2.data.err != undefined) {
          console.log("changeSecond fail");
        }
        else {
          console.log("changeSecond success");
          util.updateTime(that.data.item, res2.data.extra, res2.data.extra);
          that.setData({
            item: that.data.item
          })
        }
      },
      fail: function () {
        console.log("connect fail");
      }
    })
  },
  addComment: function(event) {
    var comment_id = event.target.dataset.pos || event.currentTarget.dataset.pos || 0;
    var type_ = event.target.dataset.type || event.currentTarget.dataset.type ;
    console.log(event.target.dataset);
    var that = this;
    console.log(comment_id);
    if(type_ == "first" || type_=="second") { //非回复评论
      that.setData({
        input_placeholder: "发表评论"
      })
    } else { //回复评论
      console.log(event.target);
      that.setData({
        input_placeholder: "回复：" + (event.target.dataset.nickname || event.currentTarget.dataset.nickname)
      })
    }
    this.setData({
      scrollIntoView: "comment_"+comment_id,
      input_focus: true,
      comment_type: type_,
      comment_item: comment_id != 0 ? (event.target.dataset.item || event.currentTarget.dataset.item) : null
    })
  },
  inputBlur: function(event) {
    this.setData({
      input_focus: false
    })
  },
  inputConfirm: function(event) {
    wx.showLoading({
      title: '发送中',
    })
    this.setData({
      input_focus : false
    })
    if(this.data.comment_type == "first") {
      var that = this;
      var temp_comment = {
        user_id: app.globalData.fadeuserInfo.user_id,
        nickname: app.globalData.fadeuserInfo.nickname,
        head_image_url: app.globalData.fadeuserInfo.head_image_url,
        comment_content: event.detail.value,
        note_id: this.data.item.type == 0 ? this.data.item.note_id : this.data.item.origin.note_id,
        "type" : this.data.item.action
      }
      wx.request({
        url: app.globalData.baseUrl + "addComment",
        method: "POST",
        header: {
          "token": app.globalData.tokenModal,
          "Content-type": "application/x-www-form-urlencoded"
        },
        data: {
          comment: JSON.stringify(temp_comment)
        },
        success: function (res) {
          console.log(res.data);
          wx.hideLoading();
          if (res.err != undefined) {
            wx.showToast({
              title: '发送失败（帖子已消失）'
            })
            return;
          }
          wx.showToast({
            title: '发送成功',
            icon: "success"
          })
          temp_comment.comment_time = util.advanceDay(res.data.extra.comment_time);
          temp_comment.comment_id = res.data.extra.comment_id;
          temp_comment.comments = [];
          that.data.item.comment_list.push(temp_comment);
          that.setData({
            item: that.data.item,
            input_value: "",
            input_placeholder : "发表评论"
          })
        },
        fail: function () {
          wx.hideLoading();
          wx.showToast({
            title: '发送失败'
          })
        }
      })
    } else {
      var temp_comment = {
        comment_id: this.data.comment_item.comment_id,
        user_id: app.globalData.fadeuserInfo.user_id,
        nickname: app.globalData.fadeuserInfo.nickname,
        comment_content: event.detail.value,
        note_id: this.data.item.type == 0 ? this.data.item.note_id : this.data.item.origin.note_id,
        to_user_id: this.data.comment_type == "second_reply" ? this.data.comment_item.user_id : null,
        to_nickname: this.data.comment_type == "second_reply" ? this.data.comment_item.nickname : null
      }
      var that = this;
      wx.request({
        url: app.globalData.baseUrl + "addSecondComment",
        method: "POST",
        header: {
          "token": app.globalData.tokenModal,
          "Content-type": "application/x-www-form-urlencoded"
        },
        data: {
          secondComment: JSON.stringify(temp_comment)
        },
        success: function(res){
          console.log(res.data);
          wx.hideLoading();
          if(res.err != undefined) {
            wx.showToast({
              title: '发送失败（帖子已消失）'
            })
            return;
          }
          wx.showToast({
            title: '发送成功',
            icon: "success"
          })
          temp_comment.comment_time = util.advanceDay(res.data.extra.comment_time);
          temp_comment.second_id = res.data.extra.second_id;
          for (var i = 0; i < that.data.item.comment_list.length; ++i) {
            if (that.data.item.comment_list[i].comment_id == temp_comment.comment_id) {
              that.data.item.comment_list[i].comments.push(temp_comment);
            }
          }
          that.setData({
            item : that.data.item,
            input_value : "",
            input_placeholder: "发表评论"
          })
        },
        fail: function(){
          wx.hideLoading();
          wx.showToast({
            title: '发送失败'
          })
        }
      })
    }
  }
})