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

function updateInformation(a, array, that, ori_len, mark) {
  var temp = array[a];
  var image_size = 0;
  var other_repost_ = [], origin_note_ = null, image_list_ = temp.image_list;
  if (temp.isRelay != 0) {
    for (var i = 0; i < temp.relay_list.length - 1; i++) {
      other_repost_[i] = temp.relay_list[i];
    }
    origin_note_ = temp.relay_list[temp.relay_list.length - 1];
    image_list_ = origin_note_.image_list;
  }
  if (image_list_.length > 0) {
    image_size = image_list_[0].image_size;
  }
  var information = {
    note_id: temp.note_id,
    user: {
      avatarUrl: temp.head_image_url,
      nickname: temp.nickname,
      user_id: temp.user_id
    },
    pos: (a+ori_len),
    post_time: temp.post_time,
    life: '10分钟',
    tapZan: temp.isGood ? true : false,
    tapclick: temp.isGood ? 1 : 0,
    post_pos: "中国-广东-佛山",
    photoList: image_list_,
    photo_height: parseFloat(that.data.windowWidth / image_size),
    photo_width: that.data.windowWidth,
    real_height: parseFloat(that.data.windowWidth / image_size),
    text_describe: temp.note_content,
    label_list: temp.tag_list,
    zan_num: temp.good_num,
    isRelay: temp.isRelay,
    zanWidth: temp.isGood ? 40 : 72,
    other_repost: other_repost_,
    origin_note: origin_note_
  };
  if(image_size < 0.8) {
    information.real_height = information.photo_width * 0.8;
  }
  // else if(image_size > 1 && image_size < 1.875) {
  //   information.real_height = information.photo_width * 1.875;
  // }
  var life_str = calLeftTime(information.zan_num, information.post_time, mark);
  information.life = life_str;
  that.data.information_list.push(information);
  //console.log(information.orgin_note);
}

function caltime(time_) {
  var day_ = Math.floor(time_ / 86400);
  time_ = time_ % 86400;
  var hour_ = Math.floor(time_ / 3600);
  time_ = time_ % 3600;
  var minute_ = Math.floor(time_ / 60);
  time_ = time_ % 60;
  var second_ = time_;
  return {day:day_, hour:hour_, minute:minute_, second:second_};
}
  //计算剩余时间
function calLeftTime(zan_num, time, mark){
  var post_time_ymd = time.split(" ")[0];
  var post_time_hms = time.split(" ")[1];
  var year = post_time_ymd.split("-")[0];
  var month = post_time_ymd.split("-")[1];
  var day = post_time_ymd.split("-")[2];
  var hour = post_time_hms.split(":")[0];
  var minute = post_time_hms.split(":")[1];
  var second = post_time_hms.split(":")[2];
  var date = new Date(year, month, day, hour, minute, second);
  var cur_date = new Date();
  cur_date.setMonth(cur_date.getMonth() + 1);
  var time_;
  if (mark == "index") {
    time_ = zan_num * 300 - Math.ceil((cur_date.getTime() - date.getTime()) / 1000) + 3600;
  }
  else if (mark == "discover") {
    time_ = zan_num * 300 - Math.ceil((cur_date.getTime() - date.getTime()) / 1000) + 900;
  }
  var time_obj = caltime(time_);
  var life_str = "";
  if (time_obj.day != 0) life_str += time_obj.day + "天";
  if (time_obj.hour != 0) life_str += time_obj.hour + "小时";
  if (time_obj.minute != 0) life_str += time_obj.minute + "分钟";
  if (time_obj.second != 0) life_str += time_obj.second + "秒";
  return life_str;
}

module.exports = {
  formatTime: formatTime,
  CalPhotoHeight: CalPhotoHeight,
  updateInformation: updateInformation,
  calLeftTime: calLeftTime
}
