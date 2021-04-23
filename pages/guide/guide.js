// pages/guide/guide.js
const app = getApp()
const database = require("../../utils/database.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: app.globalData.systemInfo.theme,
    primaryColor: app.globalData.primaryColor,
    rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
    isPad: app.globalData.isPad,
    windowWidth: app.globalData.systemInfo.windowWidth,
    buttonContent: "chevron_right"
  },

  toLower() {
    var that = this;
    if (this.data.buttonContent == "chevron_right") {
      this.setData({
        scrollTo: 'sss',
      })
    } else if (this.data.buttonContent == "settings" || this.data.buttonContent == "priority_high") {
      wx.getUserProfile({
        desc: '完善个人资料',
        success: function (res) {
          that.setData({
            buttonContent: "done",
          })
          var userInfo = res.userInfo
          app.globalData.userInfo = userInfo
          console.log('userInfo==>', userInfo)
          // wx.setStorageSync('storage_info', 1); //本地标记
          //下面将userInfo存入服务器中的用户个人资料
          //...
        },
        fail() {
          that.setData({
            buttonContent: "priority_high"
          })
          console.log("用户拒绝授权")
        }
      })
    }
  },

  setStatus() {
    if(this.data.buttonContent != "done"){
      this.setData({
        buttonContent: "settings"
      })
    }
  },

  cancelStatus() {
    if(this.data.buttonContent != "done"){
      this.setData({
        buttonContent: "chevron_right"
      })
    }
  },

  animation() {
    this.animate('.icon', [{
      transform: 'rotate(0deg)',
      offset: 0.0
    }, {
      transform: 'rotate(360deg)',
      offset: 1.0
    }], 1000, {
      scrollSource: '.scroll',
      orientation: 'horizontal',
      timeRange: 1000,
      startScrollOffset: 0,
      endScrollOffset: this.data.windowWidth,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.animation();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.onThemeChange((result) => {
      // console.log(result)
      this.setData({
        theme: result.theme
      })
    })
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

  },
})