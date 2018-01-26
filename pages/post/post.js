// pages/post/post.js
var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    post_imgs_url: [],
    post_imgs: [],
    photo_index: 0,
    windowWidth: app.globalData.windowWidth,
    photo_height: 0,
    x: 0,
    y: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },
  choosePhoto: function() {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var tempFiles = res.tempFiles;
        console.log(tempFilePaths);
        console.log(tempFiles);
        that.setData({
          post_imgs_url : tempFilePaths,
          post_imgs : tempFiles
        })
      },
      fail: function(err) {
        console.log(err);
      }
    })
  },
  loadImage: function(event) {
    console.log(event.detail);
    var img_size = parseFloat(event.detail.width / event.detail.height);
    if(img_size >= 1.875) { //超宽图
      var cut_height = parseFloat(app.globalData.windowWidth / img_size); //等于原图高
      var cut_width = parseFloat(cut_height * 1.875); // 等于裁剪比例的宽
    } else if(img_size > 1 && img_size < 1.875) { // 宽图
      var cut_width = app.globalData.windowWidth; //等于原图宽
      var cut_height = parseFloat(cut_width / 1.875); // 等于裁剪比例的高
    } else if(img_size > 0.8 && img_size <= 1) {
      var cut_height = parseFloat(app.globalData.windowWidth / img_size); //等于原图高
      var cut_width = parseFloat(cut_height * 0.8); // 等于裁剪比例的宽
    } else { //长图 4:5
      var cut_width = app.globalData.windowWidth; //等于原图宽
      var cut_height = parseFloat(cut_width * 1.25); // 等于裁剪比例的高
    } 
    this.setData({
      photo_height: parseFloat(this.data.windowWidth / img_size),
      cut_width: cut_width,
      cut_height: cut_height
    })
  }
})