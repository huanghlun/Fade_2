//index.js
//获取应用实例
var app = getApp();
var util = require('../../utils/util.js');

function sortLife(a, b){
  return b.life - a.life;
}

Page({
  data: {
    information_list:[],
    zan_icon:"../../image/心形.png",
    comment_picture: "../../image/发现/评论.png",
    repost_picture:'../../image/发现/分享.png',
    zan_picture: '../../image/发现/+1S静态.png',
    inputShowed: false,
    inputVal: "",
    scrollTop: 0,
    windowHeight: 0,
    windowWidth: 0,
    hidden: true,
    uphidden: true,
    userinfo: {}
  },
  onLoad: function () {
    var that = this;
    //获取设备信息
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
    for (var i = 0; i < 5; i++) {
      var information = {
        user: {
          avatarUrl: '../../image/avatar.jpg',
          nickname: 'Eric'+i
        },
        pos: i,
        post_time: '15:10',
        life_url: "../../image/发现/life.png",
        life: 100,
        tapZan: false,
        photoList: [
           //'../../image/photo.jpg',
          "http://pic.58pic.com/58pic/12/81/76/44n58PICAT2.jpg",
           '../../image/photo2.jpg',
           '../../image/photo3.jpg'
        ],
        photo_height: 0,
        photo_width: 0,
        text_describe: 'This is a test!!!!',
        repost: '',
        label_list: ['test', 'difficult', 'hard'],
        zan_num: "10s",
        zanWidth: 36,
        scrollLeft: 0,
        touchstartX: 0
      };
      this.data.information_list.push(information);
      this.data.information_list.sort(sortLife);
    }
    this.setData({
      information_list: this.data.information_list
    })
    //获取用户信息
    wx.login({
      success: function (res) {
        wx.getUserInfo({
          withCredentials: true,
          success: function (res_1) {
            app.globalData.userInfo = res_1.userInfo;
            var openID = wx.getStorageSync("user_openid");
            if (openID == "") {
              var user = res_1.userInfo;
              var Gender = user.gender ? "男" : "女";
              wx.request({
                url: "https://sysufade.cn/Fade/register",
                data: {
                  js_code: res.code,
                  code: "001",
                  nickname: user.nickName,
                  image_url: user.avatarUrl,
                  sex: Gender
                },
                method: "GET",
                success: function (res1) {
                  console.log(res1.data.wechat_id);
                  wx.setStorageSync("user_openid", res1.data.wechat_id);
                },
                fail: function () {
                  console.log("fail");
                }
              })
            }
            else {
              //加载得到粉丝数、点赞信息之类
            }
            //发出首次加载的请求
            wx.request({
              url: "https://sysufade.cn/Fade/note",
              data: {
                start: "0",
                code: "05"
              },
              method: "GET",
              success: function (res2) {
                console.log(res2);
              },
              fail: function () {
                console.log("connect fail");
              }
            })
          },
          fail: function (res) {
            wx.showModal({
              title: '提示',
              content: '获取当前用户权限失败，若用户需继续浏览本小程序，应要退出小程序后在发现->小程序中删除fade小程序，再重新进入加载并授权',
            })
          }
        })
      },
      fail: function(e) {
        wx.showModal({
          title: '提示',
          content: '获取当前用户权限失败，若用户需继续浏览本小程序，应要退出小程序后在发现->小程序中删除fade小程序，再重新进入加载并授权',
        })
      }
    })
  },
  //事件处理函数
  negavitorTo: function(event) {
    console.log(event.detail);
  },
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  getPhotoWH: function(event) {
    var index = event.target.dataset.pos;
    this.data.information_list[index].photo_width = this.data.windowWidth - 20;
    this.data.information_list[index].photo_height = util.CalPhotoHeight(this.data.information_list[index].photo_width, event.detail.height, event.detail.width);
    this.setData({
      information_list: this.data.information_list
    })
  },
  tapPhoto: function(event) {
    var index = event.target.dataset.pos;
    var that = this;
    wx.previewImage({
      //urls: that.data.information_list[index].photoList
      urls: ["http://pic.58pic.com/58pic/12/81/76/44n58PICAT2.jpg",
      "http://img.juimg.com/tuku/yulantu/140119/328287-14011915425369.jpg"],
      fail: function() {
        wx.showToast({
          title: '图片加载失败，请稍后重试',
          icon: 'loading'
        })
      }
    })
  },
  upper: function(event) {
    this.setData({
      uphidden: false
    })
    //下拉刷新请求
    // wx.request({
    //   url: "https://sysufade.cn/Fade/note",
    //   data: {
    //     start: "0",
    //     code: "05"
    //   },
    //   method: "GET",
    //   success: function (res2) {
    //     console.log(res2);
    //   },
    //   fail: function () {
    //     console.log("connect fail");
    //   }
    // })
    var that = this;
    setTimeout(function(){
      that.setData({
        scrollTop: 0,
        uphidden: true
      })
      console.log("finish")
    }, 4000)
  },
  scroll: function(event) {
    this.setData({
      scrollTop: event.detail.scrollTop
    })
  },
  lower: function(event) {
    // var information = this.data.information_list[this.data.information_list.length-1];
    // this.data.information_list.push(information);
    this.setData({
      information_list: this.data.information_list,
      hidden: false,
      scrollTop: event.detail.scrollTop
    })
  },
  tapzan: function(event) {
    var index = event.target.dataset.pos;
    this.data.information_list[index].tapZan = !this.data.information_list[index].tapZan;
    this.data.information_list[index].zanWidth = (this.data.information_list[index].zanWidth==20) ? 36 : 20;
    this.setData({
      information_list: this.data.information_list
    })
  },
  // onPullDownRefresh: function(){
  //   wx.showNavigationBarLoading() //在标题栏中显示加载
  //   wx.showToast({
  //     title: 'waiting',
  //     icon: 'loading'
  //   })
  //   var information = {
  //     user: {
  //       avatarUrl: '../../image/avatar.jpg',
  //       nickname: 'Amy'
  //     },
  //     post_time: '15:10',
  //     life_url: "../../image/心形.png",
  //     life: 200,
  //     photoList: [{
  //       url: '../../image/photo.jpg',
  //       name: 'first'
  //     },
  //     {
  //       url: '../../image/photo2.jpg',
  //       name: 'second'
  //     },
  //     {
  //       url: '../../image/photo3.jpg',
  //       name: 'third'
  //     }],
  //     photo_height: Photo_height,
  //     photo_width: Photo_width,
  //     text_describe: 'This is a test!!!!',
  //     repost: '',
  //     label_list: ['test', 'difficult', 'hard'],
  //     zan_num: 10,
  //     scrollLeft: 0,
  //     to_photo: "",
  //     touchstartX: 0
  //   };
  //   information.photo_height = Photo_height + "px";
  //   information.photo_width = Photo_width + "px";
  //   this.data.information_list.push(information);
  //   this.data.information_list.sort(sortLife);
  //   for(var i = 0; i < this.data.information_list.length; i++)
  //     this.data.information_list[i].pos = i;
  //   this.setData({
  //     information_list: this.data.information_list
  //   })
  //   wx.hideNavigationBarLoading() //完成停止加载
  //   wx.stopPullDownRefresh();
  // },
  // touchstart: function(event) {
  //   var id = event.target.dataset.id;
  //   //console.log(event.changedTouches[0].pageX);
  //   this.data.information_list[id].touchstartX = event.changedTouches[0].pageX;
  // },
  // touchmove: function(event) {
  //   // var id = event.target.dataset.id;
  //   // var dist = this.data.information_list[id].touchstartX - event.changedTouches[0].pageX;
  //   // this.data.information_list[id].scrollLeft += dist;
  // },
  // touchend: function(event) {
  //   var id = event.target.dataset.id;
  //   var dist = this.data.information_list[id].touchstartX - event.changedTouches[0].pageX;
  //   this.data.information_list[id].scrollLeft += dist;
  //   console.log(this.data.information_list[id].scrollLeft);
  //   if (this.data.information_list[id].scrollLeft < 0) this.data.information_list[id].scrollLeft = 0;
  //   else if (this.data.information_list[id].scrollLeft > ((this.data.information_list[id].photoList.length-1) * Photo_width)){
  //     this.data.information_list[id].scrollLeft = (this.data.information_list[id].photoList.length-1) * Photo_width;
  //   }
  //   else{
  //     var more = this.data.information_list[id].scrollLeft % Photo_width;
  //     var multi = Math.floor(this.data.information_list[id].scrollLeft / Photo_width);
  //     if (more < Photo_width / 2) this.data.information_list[id].scrollLeft = Photo_width * multi;
  //     else this.data.information_list[id].scrollLeft = Photo_width * (multi+1);
  //   }
  //   console.log(this.data.information_list[id].scrollLeft);
  //   this.setData({
  //     information_list: this.data.information_list
  //   })
  // },
  showInput: function () {
    this.setData({
      inputShowed: true
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
  }
})
