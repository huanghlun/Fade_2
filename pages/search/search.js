// pages/search/search.js
var app = getApp();
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputShowed: false,
    inputVal: "",
    "type": "1", //1为用户，2为Fade
    userList: [],
    liveList: [], //活帖
    fadeList: [], //死帖
    user_start: 0,
    fade_start: 0,
    live_start: 0,
    live_num : 0,
    fade_num: 0,
    userFinish: false,
    fadeFinish: false,
    liveFinish: false,
    tapMore: false,
    baseUrl: app.globalData.baseUrl,
    windowWidth: app.globalData.windowWidth,
    windowHeight: app.globalData.windowHeight,
    nodes: [{
      name: 'a',
      attrs: {
        class: 'search_selected'
        // style: 'line-height: 60px; color: red;'
      }
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.searchUser('黄');
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    switch(this.data.type) {
      case "1":
        if(this.data.userFinish == false) {
          this.searchUser(this.data.inputVal);
        }
        break;
      case "2":
        if (this.data.liveFinish == false) {
          this.searchNote(this.data.inputVal, 1);
          break;
        }
        if (this.data.fadeFinish == false) {
          this.searchNote(this.data.inputVal, 0);
        }
        break;
    }
  },

  showInput: function () {
    this.setData({
      inputShowed: true,
      user_start: this.data.type == "1" ? 0 : this.data.user_start,
      fade_start: this.data.type == "2" ? 0 : this.data.fade_start
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
  },

  switchView: function (event) {
    var type_ = event.currentTarget.dataset.type;
    if (type_ != this.data.type) {
      this.setData({
        "type": type_
      })
      // if ((type_ == "1" && this.data.addFinish == false) || (type_ == "2" && this.data.minusFinish == false))
      //   this.getAllSecond();
    }
     console.log(this.data.type);
  },

  //确认输入搜索
  confirmSearch: function (event) {
    console.log(this.data.inputVal);
    switch(this.data.type) {
      case "1" :
        this.setData({userList: [], tapMore: false});
        this.searchUser(this.data.inputVal);
        break;
      case "2" :
        this.setData({ 
          fadeList: [],
          liveList: [],
          tapMore: false
        });
        console.log(this.data.fadeList);
        this.searchNote(this.data.inputVal, 1);
        break;
    }
    // this.hideInput();
    this.setData({
      inputShowed: false
    });
  },

  //点击查看更多
  getFadeList: function() {
    this.setData({tapMore: true});
    this.searchNote(this.data.inputVal, 0);
  },

  searchUser: function (keyword) {
    var that = this;
    if(this.data.user_start == 0) this.data.userList = [];
    wx.request({
      url: app.globalData.baseUrl + 'searchUser/' + keyword + '/' + that.data.user_start,
      method: 'GET',
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal)
      },
      success: function(res) {
        console.log(res.data);
        for(var i = 0; i < res.data.list.length; i++) {
          res.data.list[i].nodes = that.replaceHTML(res.data.list[i].nickname);
        }
        that.data.userList.push.apply(that.data.userList, res.data.list);
        that.setData({
          user_start: res.data.start,
          userList: that.data.userList,
          userFinish: res.data.list.length < 10 ? true : false
        })
      },
      error: function(err) {
        console.log("search error");
      }
    })
  },

  searchNote: function(keyword, live) {
    var that = this;
    if (this.data.fade_start == 0) this.data.fadeList = [];
    wx.request({
      url: app.globalData.baseUrl + 'searchNote/' + keyword + '/' + (live == 0 ? that.data.fade_start : that.data.live_start) + '/' + live + '/' + app.globalData.fadeuserInfo.user_id,
      method: 'GET',
      header: {
        "tokenModel": JSON.stringify(app.globalData.tokenModal)
      },
      success: function (res) {
        console.log(res.data);
        
        for(var i = 0; i < res.data.list.length; ++i) {
          res.data.list[i].nodes = that.replaceHTML(res.data.list[i].note_content || res.data.list[i].origin.note_content || "");
          util.addInformation(i, res.data.list, live == 0 ? that.data.fadeList : that.data.liveList, app.globalData.windowWidth*0.4, "push", 1.33)
        }

        if(live == 0) { //更新死帖 fadeList
          that.setData({
            fade_start: res.data.start,
            fadeList: that.data.fadeList,
            fadeFinish: res.data.list.length < 10 ? true : false
          })
        } else { //更新活帖 liveList
          that.setData({
            live_start: res.data.start,
            liveList: that.data.fadeList,
            live_num: res.data.sum || that.data.live_num,
            liveFinish: res.data.list.length < 10 ? true : false
          })
        }
        
      },
      error: function (err) {
        console.log("search error");
      }
    })
  },

  //替换font标签
  replaceHTML: function(str) {
    // console.log(str);
    var nodes = [], begin_index = -1, end_index = -1;
    while (str.search(/<font[\w#= ]*>/) != -1) {
      begin_index = str.search(/<font[\w#= ]*>/);
      str = str.replace(/<font[\w#= ]*>/, "");

      nodes.push({
        type: 'text',
        text: str.substring(end_index == -1 ? 0 : end_index, begin_index)
      })

      end_index = str.search(/<\/font>/);
      str = str.replace(/<\/font>/, "");
      nodes.push({
        name: 'a', 
        attrs: { class: 'search_selected' }, 
        children: [{ 
          type: 'text', 
          text: str.substring(begin_index, end_index)
        }]
      })
    }

    nodes.push({
      type: 'text',
      text: str.substring(end_index, str.length)
    })

    // str = str.replace(/<font[\w#= ]*>/gi, "<a class='search_selected'>");
    // str = str.replace(/<\/font>/gi, "</a>");
    // console.log(nodes);
    return nodes;
  },

  navigateTo: function (event) {
    var query = event.target.dataset.comment;
    for (var i = 0; i < this.data.fadeList.length; i++) {
      if (this.data.fadeList[i].note_id == event.currentTarget.dataset.pos) {
        app.globalData.detail_item = this.data.fadeList[i];
        app.globalData.detail_item_index = i;
        break;
      }
    }
    wx.navigateTo({
      url: '../detail/detail?type=1' + (query != undefined ? '&comment=1' : '')
    });
  },

  navigateToOthers: function (event) {
    console.log("navigateTo :" + event.currentTarget.dataset.userid);
    util.navigateToOther(event.currentTarget.dataset.userid);
  }

})