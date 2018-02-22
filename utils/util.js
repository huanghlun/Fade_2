function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function CalPhotoHeight(e, origin_photo_height, origin_photo_width) {
  var scale = origin_photo_height * e / origin_photo_width;
  return scale;
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//添加新帖子
function addInformation(a, array, information_list, windowWidth, mark, search_size) {
  var temp = array[a];
  var time_life;
  if(temp.type != 0) {
    time_life = calLeftTime(temp.origin.add_num, temp.origin.sub_num, temp.origin.post_time, temp.origin.fetchTime || new Date());
    temp.images = temp.origin.images;
  } else {
    time_life = calLeftTime(temp.add_num, temp.sub_num, temp.post_time, temp.fetchTime || new Date());
  }
  temp.life = time_life.life_str;
  temp.progress_len = time_life.progress_len;

  //调整图片
  adjustImage(temp, windowWidth, search_size);
  if(mark == "push")
    information_list.push(temp);
  else 
    information_list.unshift(temp);
}

//调整图片尺寸
function adjustImage(temp, windowWidth, search_size) {
  if (temp.images != undefined && temp.images.length > 0) {
    if (search_size == undefined) { //非搜索页显示
      temp.show_width = windowWidth;
      if (temp.images[0].image_cut_size == 1) { //长图(即小于15:8)，以4:5进行裁剪
        temp.show_height = parseFloat(windowWidth * 1.25);
      } else { //宽图
        temp.show_height = parseFloat(temp.show_width * 8 / 15);
      }

      for (var i = 0; i < temp.images.length; i++) {
        if (temp.images[i].image_size <= 1) { //长图
          temp.images[i].real_width = temp.show_width;
          temp.images[i].real_height = parseFloat(temp.images[i].real_width / temp.images[i].image_size);
          if (temp.images[i].image_size > 0.8) {
            temp.images[i].real_width *= parseFloat(temp.images[i].image_size / 0.8);
            temp.images[i].real_height *= parseFloat(temp.images[i].image_size / 0.8);
          }

        } else { //宽图
          temp.images[i].real_height = temp.show_height;
          temp.images[i].real_width = parseFloat(temp.images[i].real_height * temp.images[i].image_size);
          if (temp.images[i].image_size < 1.875) {
            temp.images[i].real_width *= parseFloat(1.875 / temp.images[i].image_size);
            temp.images[i].real_height *= parseFloat(1.875 / temp.images[i].image_size);
          }
        }
        temp.images[i].coordinate = {
          x: parseFloat(temp.images[i].real_width * parseFloat(temp.images[i].image_coordinate.split(":")[0]) / 1000),
          y: parseFloat(temp.images[i].real_height * parseFloat(temp.images[i].image_coordinate.split(":")[1]) / 1000)
        }
      }
    } else { //搜索页显示
      temp.show_width = windowWidth;
      temp.show_height = windowWidth / search_size;
      if (temp.images[0].image_size >= search_size) { //宽图
        temp.images[0].real_height = temp.show_height;
        temp.images[0].real_width = temp.images[0].real_height * temp.images[0].image_size;
        temp.images[0].coordinate = {
          x: parseFloat((temp.images[0].real_width - temp.show_width) / 2),
          y: 0
        }
      } else { //长图
        temp.images[0].real_width = temp.show_width;
        temp.images[0].real_height = temp.images[0].real_width / temp.images[0].image_size;
        temp.images[0].coordinate = {
          x: 0,
          y: parseFloat((temp.images[0].real_height - temp.show_height) / 2)
        }
      }
    }
  }
}

//更新帖子
function updateInformation(a, array, ori_array, that) {
  var temp = array[a];
  for(var i = 0; i < ori_array.length; i++) {
    if (temp.note_id == ori_array[i].note_id && temp.is_die == 1) {
      updateTime(ori_array[i], temp, temp.origin);
      ori_array[i].action = temp.action;
    }
  }
}

function caltime(time_) {
  var day_ = Math.floor(time_ / 86400);
  if (day_.toString().length == 1) day_ = "0" + day_;
  time_ = time_ % 86400;
  var hour_ = Math.floor(time_ / 3600);
  if (hour_.toString().length == 1) hour_ = "0" + hour_;
  time_ = time_ % 3600;
  var minute_ = Math.floor(time_ / 60);
  if (minute_.toString().length == 1) minute_ = "0" + minute_;
  time_ = time_ % 60;
  var second_ = Math.floor(time_);
  if (second_.toString().length == 1) second_ = "0" + second_;
  return {day:day_, hour:hour_, minute:minute_, second:second_};
}

//更新评论、点赞及剩余时间
function updateTime(update_note, new_note, new_note_origin) {
  if (update_note.type == 0) {
    update_note.add_num = new_note.add_num;
    update_note.sub_num = new_note.sub_num;
    update_note.comment_num = new_note.comment_num;
  } else {
    update_note.origin.add_num = new_note_origin.add_num;
    update_note.origin.sub_num = new_note_origin.sub_num;
    update_note.origin.comment_num = new_note_origin.comment_num;
  }
  var time_life;
  if (update_note.type != 0) {
    time_life = calLeftTime(new_note_origin.add_num, new_note_origin.sub_num, update_note.origin.post_time, new_note_origin.fetchTime || new Date().getTime());
  } else {
    time_life = calLeftTime(new_note.add_num, new_note.sub_num, update_note.post_time, new_note.fetchTime || new Date().getTime());
  }
  update_note.life = time_life.life_str;
  update_note.progress_len = time_life.progress_len;
}

//比较时间
function CompareDay(time_2) {
  var time_1 = new Date();
  if(time_1.getDate() == time_2.getDate() && time_1.getFullYear() == time_2.getFullYear() && time_1.getMonth() == time_2.getMonth()) { //当天
    time_1 = null;
    return 0;
  } else if (time_1.getDate() == time_2.getDate()-1 && time_1.getFullYear() == time_2.getFullYear() && time_1.getMonth() == time_2.getMonth()) { //昨天
    time_1 = null;
    return -1;
  } else {
    time_1 = null;
    return -2;
  }
}

//比较年份
function CompareYear(time_2) {
  var time_1 = new Date();
  if(time_1.getFullYear() == time_2.getFullYear()) { //同一年
    return 1;
  }
  return 0;
}

//优化时间表示
function advanceDay(time_) {
  var time = formatDate(time_);
  var compare_result = CompareDay(time);
  var time_split = time_.split(" ");
  if (compare_result == 0) {
    time = time_split[1].split(":")[0] + ":" + time_split[1].split(":")[1];
  } else if (compare_result == -1) {
    time = "昨天 " + time_split[1].split(":")[0] + ":" + time_split[1].split(":")[1];
  } else {
    if(CompareYear(time)) {
      time = time_split[0].split("-")[1] + "-" + time_split[0].split("-")[2] + " " + time_split[1].split(":")[0] + ":" + time_split[1].split(":")[1];
    } else {
      time = time_split[0] + " " + time_split[1].split(":")[0] + ":" + time_split[1].split(":")[1];
    }
  }
  return time;
}

//日志转格式
function formatDate(time) {
  var post_time_ymd = time.split(" ")[0];
  var post_time_hms = time.split(" ")[1];
  var year = post_time_ymd.split("-")[0];
  var month = post_time_ymd.split("-")[1];
  var day = post_time_ymd.split("-")[2];
  var hour = post_time_hms.split(":")[0];
  var minute = post_time_hms.split(":")[1];
  var second = post_time_hms.split(":")[2];
  var temp_date = new Date(year, month - 1, day, hour, minute, second);
  return temp_date;
}

//计算剩余时间
function calLeftTime(add_num, sub_num, time, cur_time){
  var date = formatDate(time);
  var time_ = parseFloat(add_num * 300 - sub_num * 60 + 3600 - (cur_time - date.getTime()) / 1000);
  var time_obj = caltime(time_);
  var progress_len = calProgressLen(time_);
  var life_str = "", carry = 0;
  if (time_obj.day != 0) {
    life_str += time_obj.day + "天";
    carry = 1;
  }
  if (time_obj.hour != 0) {
    life_str += time_obj.hour + ":";
    carry = 1;
  } else if (time_obj.hour == 0 && carry == 1) life_str += "00:";
  
  if (time_obj.minute != 0) {
    life_str += time_obj.minute + ":";
    carry = 1;
  } else if (time_obj.minute == 0 && carry == 1) life_str += "00:";

  if (time_obj.second != 0) life_str += time_obj.second;
  else if (time_obj.second == 0) life_str += "00";

  if (carry == 0) life_str += "秒"
  return {
    "progress_len" : progress_len,
    "life_str" : life_str
  };
}

//计算进度条长度
function calProgressLen(time) {
  var base_length = 350; //初始进度条长度
  var unit_length = 0.0917; //每秒增加的长度
  var add_length = time > 3600 ? 680 : (base_length + time * unit_length);
  return add_length;
}

//json转表单key-value形式
function json2Form(json) {
  var str = [];
  for (var p in json) {
    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
  }
  return str.join("&");
} 

//判断帖子存活消失
function noteIfDie(that) {
  wx.createSelectorQuery().selectAll(".information_container").boundingClientRect(function (rects) {
    rects.forEach(function (res) {
      if (res.top > 0 && res.top <= parseFloat(that.data.windowHeight * 4 / 5)) {
        // console.log(res.id + " " + res.top + " " + that.data.windowHeight)
        for (var i = 0; i < that.data.sub_list.length; i++) {
          if (res.id == "id_" + that.data.sub_list[i].note_id) {
            console.log(res.id);
            for (var j = 0; j < that.data.information_list.length; j++) {
              if (that.data.information_list[j].note_id == that.data.sub_list[i].note_id) {
                that.data.information_list[j].is_die = 0;
                that.data.sub_list.splice(i, 1);
                i--;
                console.log(that.data.information_list[j].note_id);
                break;
              }
            }
          }
        }
      }
    })
    that.setData({
      information_list: that.data.information_list,
      sub_list: that.data.sub_list
    })
  }).exec()
}

//数组相减
function cutArray(arr1, arr2) { //arr2被减
  for (var i = arr1.length - 1; i >= 0; i--) {
    for (var j = arr2.length - 1; j >= 0; j--) {
      if (arr1[i].note_id == arr2[j].note_id) {
        arr2.splice(j, 1);
        break;
      }
    }
  }
}

//获取刷新个人信息
function getPersonPage(that, app, user_id, my_id) {
  wx.request({
    url: app.globalData.baseUrl + 'getPersonPage/' + user_id + '/' + my_id,
    method: 'GET',
    header: {
      "tokenModel": JSON.stringify(app.globalData.tokenModal)
    },
    success: function (res) {
      console.log(res.data);
      that.data.live_list = [];
      for (var i = 0; i < res.data.query.list.length; i++) {
        addInformation(i, res.data.query.list, that.data.live_list, app.globalData.windowWidth, "push");
      }
      that.setData({
        isConcern: res.data.isConcern,
        fadeuserInfo: res.data.user,
        live_list: that.data.live_list,
        live_start: res.data.query.start
      })
    },
    error: function (err) {
      console.log(err);
    }
  })
}

//获取动态
function getLiveNote(that, app, user_id, my_id, start, mark) {
  wx.request({
    url: app.globalData.baseUrl + 'getLiveNote/' + user_id + '/' + my_id + '/' + start,
    method: 'GET',
    header: {
      "tokenModel": JSON.stringify(app.globalData.tokenModal)
    },
    success: function (res) {
      console.log(res.data);
      if (mark == 'unshift') {
        cutArray(that.data.live_list, res.data.list); //查重
        for (var i = res.data.list.length - 1; i >= 0; --i) {
          addInformation(i, res.data.list, that.data.live_list, app.globalData.windowWidth, "unshift");
        }
      } else {
        for (var i = 0; i < res.data.list.length; ++i) {
          addInformation(i, res.data.list, that.data.live_list, app.globalData.windowWidth, "push");
        }
      }
      that.setData({
        live_start: (mark == 'push' && res.data.list.length >= 10) ? res.data.start : that.data.live_start,
        live_list: that.data.live_list,
        live_finish: res.data.list.length >= 10 ? false : true
      })
    },
    error: function (err) {
      console.log(err);
    }
  })
}

//获取自己原创fade
function getMyNote(that, app, user_id, start, mark) {
  wx.request({
    url: app.globalData.baseUrl + 'getMyNote/' + user_id + '/' + start,
    method: 'GET',
    header: {
      "tokenModel": JSON.stringify(app.globalData.tokenModal)
    },
    success: function (res) {
      console.log(res.data);
      if (mark == 'unshift') {
        cutArray(that.data.fade_list, res.data.list); //查重
        for (var i = res.data.list.length - 1; i >= 0; --i) {
          addInformation(i, res.data.list, that.data.fade_list, app.globalData.windowWidth, "unshift");
        }
      } else {
        for (var i = 0; i < res.data.list.length; ++i) {
          addInformation(i, res.data.list, that.data.fade_list, app.globalData.windowWidth, "push");
        }
      }
      that.setData({
        fade_start: mark == 'push' ? res.data.start : that.data.fade_start,
        fade_list: that.data.fade_list,
        fade_finish: res.data.list.length >= 10 ? false : true
      })
    },
    error: function (err) {
      console.log(err);
    }
  })
}

//获取粉丝
function getFans(that, app, user_id, start, mark) {
  wx.request({
    url: app.globalData.baseUrl + 'getFans/' + user_id + '/' + start,
    method: 'GET',
    header: {
      "tokenModel": JSON.stringify(app.globalData.tokenModal)
    },
    success: function (res) {
      console.log(res.data);
      if (mark == 'unshift') {
        cutArray(that.data.fans_list, res.data.list); //查重
        that.data.fans_list.unshift.apply(that.data.fans_list, res.data.list);
      } else {
        that.data.fans_list.push.apply(that.data.fans_list, res.data.list);
      }
      that.setData({
        fans_start: mark == 'push' ? res.data.start : that.data.fans_start,
        fans_list: that.data.fans_list,
        fans_finish: res.data.list.length >= 20 ? false : true
      })
    },
    error: function (err) {
      console.log(err);
    }
  })
}

//获取关注
function getConcerns(that, app, user_id, start, mark) {
  wx.request({
    url: app.globalData.baseUrl + 'getConcerns/' + user_id + '/' + start,
    method: 'GET',
    header: {
      "tokenModel": JSON.stringify(app.globalData.tokenModal)
    },
    success: function (res) {
      console.log(res.data);
      if (mark == 'unshift') {
        cutArray(that.data.concern_list, res.data.list); //查重
        that.data.concern_list.unshift.apply(that.data.concern_list, res.data.list);
      } else {
        that.data.concern_list.push.apply(that.data.concern_list, res.data.list);
      }
      that.setData({
        concern_start: mark == 'push' ? res.data.start : that.data.concern_start,
        concern_list: that.data.fans_list,
        concern_finish: res.data.list.length >= 20 ? false : true
      })
    },
    error: function (err) {
      console.log(err);
    }
  })
}

//个人页点赞
function changeSecond(that, app, event) {
  var type_ = event.target.dataset.type;
  var list_name = event.target.dataset.list;
  var note_id = event.target.dataset.pos;
  if (list_name == 'fade') {
    for (var i = 0; i < that.data.fade_list.length; i++) {
      if (that.data.fade_list[i].note_id == note_id) {
        that.data.fade_list[i].action = type_;
        break;
      }
    }
  } else {
    for (var i = 0; i < that.data.live_list.length; i++) {
      if (that.data.live_list[i].note_id == note_id) {
        that.data.live_list[i].action = type_;
        break;
      }
    }
  }
  that.setData({
    live_list: that.data.live_list,
    fade_list: that.data.fade_list
  })
  var temp_obj = {
    user_id: app.globalData.fadeuserInfo.user_id,
    nickname: app.globalData.fadeuserInfo.nickname,
    head_image_url: app.globalData.fadeuserInfo.head_image_url,
    "type": list_name == "fade" ? that.data.fade_list[i].action : that.data.live_list[i].action,
    target_id: list_name == "fade" ? that.data.fade_list[i].note_id : that.data.live_list[i].note_id
  }
  wx.request({
    url: app.globalData.baseUrl + "changeSecond",
    method: "POST",
    header: {
      "tokenModel": JSON.stringify(app.globalData.tokenModal),
      "Content-type": "application/x-www-form-urlencoded"
    },
    data: {
      note: JSON.stringify(temp_obj)
    },
    success: function (res2) {
      console.log(res2.data);
      var temp = list_name == "fade" ? that.data.fade_list[i] : that.data.live_list[i],
        data1 = res2.data;
      if (res2.data.err != undefined) {
        console.log("changeSecond fail");
      } else {
        console.log("changeSecond success");
        updateTime(temp, res2.data.extra, res2.data.extra);
        that.setData({
          fade_list: that.data.fade_list,
          live_list: that.data.live_list
        })
      }
    },
    fail: function () {
      console.log("connect fail");
    }
  })
}

module.exports = {
  formatTime: formatTime,
  CalPhotoHeight: CalPhotoHeight,
  updateInformation: updateInformation,
  updateTime : updateTime,
  adjustImage: adjustImage,
  addInformation: addInformation,
  calLeftTime: calLeftTime,
  json2Form: json2Form,
  noteIfDie: noteIfDie,
  advanceDay: advanceDay,
  formatDate: formatDate,
  cutArray: cutArray,
  getPersonPage: getPersonPage,
  getLiveNote: getLiveNote,
  getMyNote: getMyNote,
  getFans: getFans,
  getConcerns: getConcerns,
  changeSecond: changeSecond
}
