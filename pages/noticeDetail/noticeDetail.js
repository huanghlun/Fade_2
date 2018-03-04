// pages/noticeDetail/noticeDetail.js
var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarTitle: "",
    baseUrl: "",
    user_id: 0,
    addProgressList: [],
    addFansList: [],
    addCommentList: [],
    start: 0,
    point: "null",
    query: 0,
    getOldProgressBtnClick: 0,
    getOldFansBtnClick: 0,
    getOldCommentBtnClick: 0,
    progressAddFinish: false,
    progressOldFinish: false,
    fansAddFinish: false,
    fansOldFinish: false,
    commentAddFinish: false,
    commentOldFinish: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      baseUrl: app.globalData.baseUrl,
      user_id: app.globalData.fadeuserInfo.user_id
    })
    var that = this;
    console.log(options);
    switch(options.query){
      case "1":
        this.getAddContribute();
        this.setData({
          query: "1",
          navbarTitle : "进度贡献"
        })
        break;
      case "2":
        this.getAddFans();
        this.setData({
          query: "2"
        })
        break;
      case "3":
        this.getAddComment();
        this.setData({
          query: "3"
        })
        break;
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    wx.setNavigationBarTitle({
      title: that.data.navbarTitle
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  onReachBottom: function () {
    var that = this;
    switch (this.data.query) {
      case "1":
        if (progressAddFinish == false) {
          that.getAddContribute();
        } else if (progressAddFinish == true && progressOldFinish == false) {
          that.getOldContribute();
        }
        break;
      case "2":
        if (fansAddFinish == false) {
          that.getAddFans();
        } else if (fansAddFinish == true && fansOldFinish == false) {
          that.getOldFans();
        }
        break;
      case "3":
        if (commentAddFinish == false) {
          that.getAddComment();
        } else if (commentAddFinish == true && commentAddFinish == false) {
          that.getOldComment();
        }
        break;
    }
  },

  navigateToDetail: function(event) {
    for (var i = 0; i < this.data.addProgressList.length; i++) {
      if (this.data.addProgressList[i].note_id == event.currentTarget.dataset.pos) {
        app.globalData.detail_item = this.data.addProgressList[i];
        break;
      }
    }
    for (var i = 0; i < this.data.addCommentList.length; i++) {
      if (this.data.addCommentList[i].comment_id == event.currentTarget.dataset.pos) {
        app.globalData.detail_item = this.data.addCommentList[i];
        break;
      }
    }
    console.log(app.globalData.detail_item);
    wx.navigateTo({
      url: '../detail/detail?type=1'
    });
  },

  navigateToOther: function(event) {
    if (event.currentTarget.dataset.userid == app.globalData.fadeuserInfo.user_id) {
      wx.switchTab({
        url: '../own/own'
      })
    } else {
      wx.navigateTo({
        url: '../others/others?user_id=' + event.currentTarget.dataset.userid
      })
    } 
  },

  //点击加载更多信息的按钮
  clickBtn: function() {
    switch (this.data.query) {
      case "1":
        this.setData({
          getOldProgressBtnClick: 1
        })
        this.getOldContribute();
        break;
      case "2":
        this.setData({
          getOldFansBtnClick: 1
        })
        this.getOldFans();
        break;
      case "3":
        this.setData({
          getOldCommentBtnClick: 1
        })
        this.getOldComment();
        break;
    }
    
  },

  //获取未读进度贡献信息
  getAddContribute: function() {
    var that = this;
    wx.request({
      url: that.data.baseUrl + 'getAddContribute/' + app.globalData.fadeuserInfo.user_id + '/' + that.data.start + '/' + that.data.point,
      method: 'GET',
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal)
      },
      success: function (res) {
        console.log(res.data);
        for (var i = 0; i < res.data.list.length; i++) {
          res.data.list[i].post_time = util.advanceDay(res.data.list[i].post_time);
        }
        if (res.data.list.length > 0)
          that.data.addProgressList.push.apply(that.data.addProgressList, res.data.list);
        that.setData({
          addProgressList: that.data.addProgressList,
          start: res.data.start,
          point: res.data.point,
          progressAddFinish: res.data.list.length < 20 ? true : false
        })
      },
      error: function (err) {
        console.log(err);
      }
    })
  },

  //获取已读的进度贡献信息
  getOldContribute: function() {
    var that = this;
    wx.request({
      url: that.data.baseUrl + 'getOldContribute/' + app.globalData.fadeuserInfo.user_id + '/' + that.data.start,
      method: 'GET',
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal)
      },
      success: function (res) {
        console.log(res.data);
        for (var i = 0; i < res.data.list.length; i++) {
          res.data.list[i].post_time = util.advanceDay(res.data.list[i].post_time);
        }
        if (res.data.list.length > 0)
          that.data.addProgressList.push.apply(that.data.addProgressList, res.data.list);
        that.setData({
          addProgressList: that.data.addProgressList,
          start: res.data.start,
          progressOldFinish: res.data.list < 20 ? true : false
        })
      },
      error: function (err) {
        console.log(err);
      }
    })
  },

  //获取新的粉丝信息
  getAddFans: function() {
    var that = this;
    wx.request({
      url: that.data.baseUrl + 'getAddFans/' + app.globalData.fadeuserInfo.user_id + '/' + that.data.start + '/' + that.data.point,
      method: 'GET',
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal)
      },
      success: function (res) {
        console.log(res.data);
        if(res.data.list.length > 0 )
          that.data.addFansList.push.apply(that.data.addFansList, res.data.list);
        that.setData({
          addFansList: that.data.addFansList,
          start: res.data.start,
          point: res.data.point,
          fansAddFinish: res.data.list.length < 20 ? true : false
        })
      },
      error: function (err) {
        console.log(err);
      }
    })
  },

  //获取旧的粉丝信息
  getOldFans: function () {
    var that = this;
    wx.request({
      url: that.data.baseUrl + 'getOldFans/' + app.globalData.fadeuserInfo.user_id + '/' + that.data.start,
      method: 'GET',
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal)
      },
      success: function (res) {
        console.log(res.data);
        if (res.data.list.length > 0) 
          that.data.addFansList.push.apply(that.data.addFansList, res.data.list);
        that.setData({
          addFansList: that.data.addFansList,
          start: res.data.start,
          fansOldFinish: res.data.list.length < 20 ? true : false
        })
      },
      error: function (err) {
        console.log(err);
      }
    })
  },

  //获取新的评论信息
  getAddComment: function() {
    var that = this;
    wx.request({
      url: that.data.baseUrl + 'getAddComment/' + app.globalData.fadeuserInfo.user_id + '/' + that.data.start + '/' + that.data.point,
      method: 'GET',
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal)
      },
      success: function (res) {
        console.log(res.data);
        for (var i = 0; i < res.data.list.length; i++) {
          res.data.list[i].comment_time = util.advanceDay(res.data.list[i].comment_time);
        }
        if (res.data.list.length > 0)
          that.data.addCommentList.push.apply(that.data.addCommentList, res.data.list);
        that.setData({
          addCommentList: that.data.addCommentList,
          start: res.data.start,
          point: res.data.point,
          commentAddFinish: res.data.list.length < 20 ? true : false
        })
      },
      error: function (err) {
        console.log(err);
      }
    })
  },

  //获取旧的评论信息
  getOldComment: function() {
    var that = this;
    wx.request({
      url: that.data.baseUrl + 'getOldComment/' + app.globalData.fadeuserInfo.user_id + '/' + that.data.start,
      method: 'GET',
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal)
      },
      success: function (res) {
        console.log(res.data);
        for (var i = 0; i < res.data.list.length; i++) {
          res.data.list[i].comment_time = util.advanceDay(res.data.list[i].comment_time);
        }
        if (res.data.list.length > 0)
          that.data.addCommentList.push.apply(that.data.addCommentList, res.data.list);
        that.setData({
          addCommentList: that.data.addCommentList,
          start: res.data.start,
          commentOldFinish: res.data.list.length < 20 ? true : false
        })
      },
      error: function (err) {
        console.log(err);
      }
    })
  },

  //点击关注按钮
  clickConcernBtn: function (event) {
    var concern = event.target.dataset.concern; //0为未关注
    var star_id = event.currentTarget.dataset.userid;

    if (concern == 0) {
      for (var i = 0; i < this.data.addFansList.length; ++i) {
        if (this.data.addFansList[i].user_id == star_id) break;
      }
      // util.concern(this, this.data.user_id, star_id);
      var that = this;
      wx.request({
        url: app.globalData.baseUrl + "concern",
        method: "POST",
        header: {
          "tokenModel": JSON.stringify(app.globalData.tokenModal),
          "Content-type": "application/x-www-form-urlencoded"
        },
        data: {
          fans_id: app.globalData.fadeuserInfo.user_id,
          star_id: star_id
        },
        success: function (res) {
          console.log(res);
          if (res.data.success) {
            that.data.addFansList[i].isConcern = 1;
            that.setData({
              addFansList: that.data.addFansList
            })
          }
        },
        error: function (err) {
          console.log(err);
        }
      })
    }
  }
})