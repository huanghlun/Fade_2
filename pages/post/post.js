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
    note_content: "",
    note_position: "打开开关获取位置",
    photo_index: 0,
    windowWidth: app.globalData.windowWidth,
    photo_height: 0,
    x: 0,
    y: 0,
    send_pos: false
  },
  onLoad: function (options) {
  },
  onReady: function () {
  },
  onUnload: function () {
    app.globalData.post_finish = true;
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
    var img_size = parseFloat(event.detail.width / event.detail.height);
    if(img_size >= 1.875) { //超宽图
      var cut_height = parseFloat(app.globalData.windowWidth / img_size); //等于原图高
      var cut_width = parseFloat(cut_height * 1.875); // 等于裁剪比例的宽
      var cut_size = 2;
    } else if(img_size > 1 && img_size < 1.875) { // 宽图
      var cut_width = app.globalData.windowWidth; //等于原图宽
      var cut_height = parseFloat(cut_width / 1.875); // 等于裁剪比例的高
      var cut_size = 2;
    } else if(img_size > 0.8 && img_size <= 1) {
      var cut_height = parseFloat(app.globalData.windowWidth / img_size); //等于原图高
      var cut_width = parseFloat(cut_height * 0.8); // 等于裁剪比例的宽
      var cut_size = 1;
    } else { //长图
      var cut_width = app.globalData.windowWidth; //等于原图宽
      var cut_height = parseFloat(cut_width * 1.25); // 等于裁剪比例的高
      var cut_size = 1;
    } 
    this.data.post_imgs[this.data.photo_index].img_size = img_size;
    this.data.post_imgs[this.data.photo_index].cut_size = cut_size;
    this.data.post_imgs[this.data.photo_index].width = app.globalData.windowWidth;
    this.data.post_imgs[this.data.photo_index].height = parseFloat(app.globalData.windowWidth / img_size);
    this.setData({
      photo_height: parseFloat(this.data.windowWidth / img_size),
      cut_width: cut_width,
      cut_height: cut_height,
      post_imgs: this.data.post_imgs
    })
  },
  changeContent: function(event) {
    this.setData({
      note_content: event.detail.value
    })
  },
  postItem: function() {
    var that = this;
    wx.showLoading({
      title: '正在发布'
    })
    wx.createSelectorQuery().select("#movableArea").boundingClientRect(function(rect1) { //父元素边界值
      console.log(rect1);
      var x1 = rect1.left;
      var y1 = rect1.top;
      wx.createSelectorQuery().select("#movableView").boundingClientRect(function (rect) {
        console.log(rect);
        var images = [];
        for (var i = 0; i < that.data.post_imgs.length; i++) {
          var x = Math.round((rect.left - x1) / that.data.post_imgs[i].width * 1000);
          var y = Math.round((rect.top - y1) / that.data.post_imgs[i].height * 1000);
          var temp = {
            image_cut_size: that.data.post_imgs[i].cut_size,
            image_size: that.data.post_imgs[i].img_size,
            image_coordinate: x + ":" + y
          }
          images.push(temp);
        }
        console.log(images);
        var note = {
          user_id: app.globalData.fadeuserInfo.user_id,
          nickname: app.globalData.fadeuserInfo.nickname,
          head_image_url: app.globalData.fadeuserInfo.head_image_url,
          note_content: that.data.note_content,
          note_area: that.data.send_pos == true ? that.data.note_position : undefined,
          images: images
        };
        wx.uploadFile({
          url: app.globalData.baseUrl + 'addNote',
          filePath: that.data.post_imgs_url[that.data.photo_index] || "",
          name: 'file',
          header: {
            "tokenModel": JSON.stringify(app.globalData.tokenModal),
            "Content-Type": "multipart/form-data"
          },
          formData: {
            note: JSON.stringify(note)
          },
          success: function (res) {
            console.log(res.data);
            var data = JSON.parse(res.data);
            note.note_id = data.extra.note_id;
            note.post_time = data.extra.post_time;
            note.add_num = 0;
            note.comment_num = 0;
            note.sub_num = 0;
            note.is_die = 1;
            note.target_id = 0;
            note.type = 0;
            note.action = 0;
            note.origin = null;
            note.fetchTime = util.formatDate(data.extra.post_time).getTime();
            for (var i = 0; i < data.extra.imageUrls.length; ++i) {
              note.images[i].image_url = data.extra.imageUrls[i];
              note.images[i].note_id = data.extra.note_id;
            }
            app.globalData.post_item = note;
            wx.navigateBack({
              delta: 1
            })
          },
          error: function (err) {
            console.log(err);
            wx.showModal({
              title: '发布失败',
              content: '内容发布失败，请检查网络情况'
            })
          }
        })

      }).exec();
    }).exec();
  },
  switch1Change: function(event) {
    this.setData({
      send_pos: event.detail.value
    })
    var that = this;
    if(event.detail.value == true) {
      wx.chooseLocation({
        success: function(res) {
          console.log(res);
          if(res.address) {
            that.setData({
              note_position : res.address
            })
          }
        },
        error: function(err) {
          wx.showModal({
            title: '获取失败',
            content: '获取位置信息失败'
          })
        }
      })
    } else{
      that.setData({
        note_position: "打开开关获取位置"
      })
    }
  }
})