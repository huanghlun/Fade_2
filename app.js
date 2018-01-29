//app.js
App({
  onLaunch: function() {
    //获取系统、用户信息
    var system_res = wx.getSystemInfoSync();
    this.globalData.windowHeight = system_res.windowHeight;
    this.globalData.windowWidth = system_res.windowWidth;
  },
  getUserInfo: function(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: true,
        success: function(res) {
          that.globalData.userInfo = res.userInfo;
          typeof cb == "function" && cb(that.globalData.userInfo)
        },
        fail: function(res) {
          console.log(res);
        }
      })
    }
  },
  //连接websocket
  openWebSocket: function(user_id, token_str) {
    wx.connectSocket({
      url: 'wss://sysufade.cn/fade_pro/webSocketServer?user_id=' + user_id + '&token=' + token_str,
      success: function(res) {
        console.log(res);
      }
    })
    wx.onSocketOpen(function (res) {
      console.log('open WebSocket')
    })
    wx.onSocketError(function (res) {
      console.log('open WebSocket fail')
    })
    // wx.onSocketMessage(function (res) {
    //   console.log('收到服务器内容：' + res.data);
    //   if (res.data.success == "00") {
    //     this.globalData.addProgressNum ++ ;
    //   } else if (res.data.success == "01") {
    //     this.globalData.addFansNum ++;
    //   } else if (res.data.success == "02") {
    //     this.globalData.addCommentNum ++;
    //   }
    // })
    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')
    })
  },
  //上线请求
  onlineRequest: function(user_id, token) {
    var that = this;
    wx.request({
      url: that.globalData.baseUrl + 'online',
      data: {
        user_id: user_id
      },
      method:'POST',
      header: {
        "token": token,
        "Content-type" : "application/x-www-form-urlencoded"
      },
      success: function(res) {
        if(res.data.err == undefined) {
          console.log("online success");
        } else {
          console.log("online error");
        }
      },
      error: function(err) {
        console.log("online error");
      }
    })
  },
  //下线请求
  offlineRequest: function(user_id, token) {
    var that = this;
    wx.request({
      url: that.globalData.baseUrl + 'offline',
      data: {
        user_id: user_id
      },
      method: 'POST',
      header: {
        "token": token,
        "Content-type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        if (res.data.err == undefined) {
          console.log("offline success");
        } else {
          console.log("offline error");
        }
      },
      error: function (err) {
        console.log("offline error");
      }
    })
  },
  globalData: {
    fadeuserInfo: null,
    detail_item: null,
    detail_item_index: -1,
    baseUrl: "https://sysufade.cn/fade_pro/",
    tokenModal:null,
    windowHeight: 0,
    windowWidth: 0,
    post_item: null,
    post_finish: false,
    addProgressNum: 0,
    addFansNum: 0,
    addCommentNum: 0
  }
})
