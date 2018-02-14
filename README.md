## Fade

Fade 是一款含有时间元素的轻博客社交应用，fade的表义即为流逝、消逝，产品应用贯彻fade的思想，通过时间来筛选信息流中的帖子，每条发布的帖子有起始的存活时间，用户通过点击加、减按钮来为帖子续秒或减秒，起到使优质内容的帖子长久流传，而其它帖子流逝消失的效果。

## Requirements

* 微信小程序开发工具
* git bash

## Function

* 首页动态加载查看其它用户发布的信息帖子
* 详情页可评论帖子或回复其他用户的评论
* 通知页接收后台推送通知，通知用户查看新的评论或新的粉丝
* 搜索页可搜索其它用户或帖子
* 个人页查看或修改个人信息（包括已发布的fade帖子、正在流传的帖子和其它基本的信息）

## Details

* 前端通过`wx.request`和`wx.uplodaFile`来向后端发送form-urlencoded和multipart的请求
* 前端通过`wx.connectSocket`与后端建立websocket连接，通知页的推送效果通过`onSocketMessage`监听由后端向前端主动推送的信息
* 首页通过Page的页面滚动、`onPullDownRefresh`监听下拉刷新和`onReachBottom`监听上拉加载实现流式加载
* 详情页的评论列表通过`scrollView`实现，并通过`bindscrolltoupper`监听列表触顶和`bindscrolltolower`监听列表触底来实现动态加载评论效果
* 个人页的各个标签列表通过`hidden`属性控制其显示或隐藏
* 各个页面和样式利用`wxml`和`wxss`编写

## Extra

* 后端服务器通过hadoop运行基于用户的推荐算法，在首页中附带推送一些感兴趣的用户及其帖子
* 安卓端和ios端有更炫酷的帖子消失动画

## Screenshot

<img src="https://github.com/huanghlun/img_repository/raw/master/fade1.jpg" width="35%" style="margin-right:10%" />
<img src="https://github.com/huanghlun/img_repository/raw/master/fade2.jpg" width="35%" />
<img src="https://github.com/huanghlun/img_repository/raw/master/fade3.jpg" width="35%" style="margin-right:10%" />
<img src="https://github.com/huanghlun/img_repository/raw/master/fade4.jpg" width="35%" />

## Author

| Author | E-mail |
| :------:  | :------: |
| Eric_Wong |  564945308@qq.com |
