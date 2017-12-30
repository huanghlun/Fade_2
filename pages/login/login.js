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
    if (app.globalData.fadeuserInfo == null) {
      wx.login({
        success: function (res) {
          wx.getUserInfo({
            withCredentials: true,
            success: function (res_1) {
              app.globalData.userInfo = res_1.userInfo;
              that.setData({
                user_name: res_1.userInfo.nickName,
                user_avatar: res_1.userInfo.avatarUrl,
                finish: true
              })
              var openID = wx.getStorageSync("user_openid");
              //openID为空证明用户还未注册
              if (openID == "") {
                var user = res_1.userInfo;
                var Gender = user.gender ? "男" : "女";
                wx.request({
                  url: "https://sysufade.cn/fade/user",
                  data: {
                    js_code: res.code,
                    code: "02",
                    nickname: user.nickName,
                    head_image_url: user.avatarUrl,
                    sex: Gender
                  },
                  method: "GET",
                  success: function (res1) {
                    console.log("注册成功");
                    if(res1.data.err == '用户不存在') {
                      wx.showModal({
                        title: '用户注册失败',
                        content: '请重试登录连接数据库',
                      })
                    }
                    else {
                      wx.setStorageSync("user_openid", res1.data.wechat_id);
                      app.globalData.fadeuserInfo = res1.data;
                      setTimeout(function(){
                        wx.switchTab({
                          url: '../index/index'
                        })  
                      }, 2000);  
                    }
                  },
                  fail: function () {
                    console.log("fail");
                  }
                })
              }
              //已注册用户则加载得到粉丝数、点赞信息之类
              else {
                var wechat_id_ = wx.getStorageSync("user_openid");
                wx.request({
                  url: "https://sysufade.cn/fade/user",
                  data: {
                    code: "01",
                    wechat_id: wechat_id_
                  },
                  method: "GET",
                  success: function (res1) {
                    console.log(res1.data);
                    if (res1.data.err == '用户不存在') {
                      wx.showModal({
                        title: '数据库连接失败',
                        content: '请重试登录连接数据库',
                      })
                    }
                    else {
                      app.globalData.fadeuserInfo = res1.data;
                      // console.log(app.globalData.fadeuserInfo);
                      setTimeout(function () {
                        wx.switchTab({
                          url: '../index/index'
                        })
                      }, 2000);  
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
    else {
      wx.switchTab({
        url: '../index/index'
      }) 
    }
  }
})
