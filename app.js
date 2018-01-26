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

  globalData: {
    fadeuserInfo: null,
    detail_item: null,
    detail_item_index: -1,
    baseUrl: "https://sysufade.cn/fade_pro/",
    tokenModal:null,
    windowHeight: 0,
    windowWidth: 0
  }
})
