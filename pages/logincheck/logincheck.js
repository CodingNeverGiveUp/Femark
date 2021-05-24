// pages/logincheck/logincheck.js
//获取应用实例
const app = getApp()
const database = require("../../utils/database.js")
const event = require("../../utils/event.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: app.globalData.systemInfo.theme,
    content: "准备中",
    primaryColor: "#4285f4",
    rgbaPrimaryColor: app.colorRgba("#4285f4", .2),
  },

  refresh(){
    app.initialize();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let timer = setTimeout(()=>{
      this.setData({
        content: "网络错误",
        float: "bottom:50rpx;"
      })
    },5000)
    event.on('LoginCheck', this, function (data) {
      clearTimeout(timer)
      if (data == 'register') {
        wx.navigateTo({
          url: '/pages/guide/guide',
        })
      } else if (data == 'finished') {
        wx.switchTab({
          url: '/pages/index/index',
        })
      } else if (data == 'error') {
        this.setData({
          content: "网络错误",
          float: "bottom:50rpx;"
        })
      } else {
        this.setData({
          content: data
        });
      }
    })
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    event.remove('LoginCheck', this);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})