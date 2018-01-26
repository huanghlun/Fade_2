//login.js
var app = getApp();
var util = require('../../utils/util.js');

Page({
  data: {
    user_name: "",
    user_avatar: "",
    finish: false
  },
  onLoad: function () {
    var that = this;
    //获取屏幕信息
    if (app.globalData.fadeuserInfo == null) {
      wx.login({
        success: function (res) {
          wx.getUserInfo({
            withCredentials: true,
            success: function (res_1) {
              app.globalData.fadeuserInfo = res_1.userInfo;
              that.setData({
                user_name: res_1.userInfo.nickName,
                user_avatar: res_1.userInfo.avatarUrl,
                finish: true
              })
              var openID = wx.getStorageSync("user_openid");
              console.log(openID);
              //openID为空证明用户还未注册
              if (openID == "") {
                var user = res_1.userInfo;
                var Gender = user.gender ? "男" : "女";
                wx.request({
                  url: app.globalData.baseUrl+"registerWechat",
                  header: {
                    "Content-type": "application/x-www-form-urlencoded"
                  },
                  data: {
                    js_code: res.code,
                    user: JSON.stringify({
                      nickname: user.nickName,
                      head_image_url: user.avatarUrl,
                      sex: Gender
                    })
                  },
                  method: "POST",
                  success: function (res1) {
                    console.log("注册登录成功");
                    if(res1.data.err != undefined) {
                      wx.showModal({
                        title: '用户注册登录失败',
                        content: '请重试登录连接数据库',
                      })
                    }
                    else {
                      console.log(res1)
                      wx.setStorageSync("user_openid", res1.data.user.wechat_id);
                      app.globalData.fadeuserInfo = res1.data.user;
                      app.globalData.tokenModal = res1.data.user.tokenModal;
                      setTimeout(function(){
                        wx.switchTab({
                          url: '../index/index'
                        })  
                      }, 1500);  
                    }
                  },
                  fail: function () {
                    console.log("fail");
                  }
                })
              }
              //已注册用户则加载得到粉丝数、点赞信息之类
              else {
                wx.request({
                  url: app.globalData.baseUrl+"loginWechat/"+openID,
                  method: "GET",
                  success: function (res1) {
                    console.log(res1.data.user);
                    if (res1.data.err != undefined) {
                      wx.showModal({
                        title: '登录失败',
                        content: '请重试登录',
                      })
                    }
                    else {
                      app.globalData.fadeuserInfo = res1.data.user;
                      app.globalData.tokenModal = res1.data.tokenModal;
                      // console.log(app.globalData.fadeuserInfo);
                      setTimeout(function () {
                        wx.switchTab({
                          url: '../index/index'
                        })
                      }, 1500);  
                    }                 
                  },
                  fail: function () {
                    console.log("连接数据库失败");
                  }
                })
              }
            },
            fail: function (res) {
              wx.showModal({
                title: '提示',
                content: '获取当前用户权限失败，若用户需继续浏览本小程序，应要退出小程序后在发现->小程序中删除fade小程序，再重新进入加载并授权',
              })
            }
          })
        },
        fail: function (e) {
          wx.showModal({
            title: '提示',
            content: '获取当前用户权限失败，若用户需继续浏览本小程序，应要退出小程序后在发现->小程序中删除fade小程序，再重新进入加载并授权',
          })
        }
      })
    }
    else { //直接跳转
      wx.switchTab({
        url: '../index/index'
      }) 
    }
  }
})
