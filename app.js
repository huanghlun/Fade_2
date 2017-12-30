//app.js
App({
  onLaunch: function() {
    //获取用户信息
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
    userInfo: null,
    fadeuserInfo: null,
    detail_information: null
  }
})
