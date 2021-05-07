// pages/themeSetting/themeSetting.js
// 获取应用实例
const app = getApp()
const database = require("../../utils/database.js")
const event = require("../../utils/event.js")
const _ = wx.cloud.database().command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    primaryColor: app.globalData.primaryColor,
    pureTheme: app.globalData.pureTheme,
    rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
    theme: app.globalData.systemInfo.theme,
    edited: false
  },

  back() {
    if (this.data.edited) {
      wx.showModal({
        title: "提示",
        content: "是否保存更改",
        confirmColor: `${this.data.primaryColor}`,
      }).then(res => {
        if (res.confirm) {
          wx.showLoading({
            title: '操作进行中',
          })
          wx.cloud.database().collection('note').doc(app.globalData.id).update({
            data: {
              profile: {
                primaryColor: this.data.primaryColor,
                pureTheme: this.data.pureTheme,
                useSidebar: this.data.useSidebar,
                bing: this.data.bing,
                hitokoto: this.data.hitokoto,
              }
            }
          }).then(res => {
            app.globalData.primaryColor = this.data.primaryColor;
            app.globalData.pureTheme = this.data.pureTheme;
            app.globalData.useSidebar = this.data.useSidebar;
            app.globalData.bing = this.data.bing;
            app.globalData.hitokoto = this.data.hitokoto;
            wx.showToast({
              title: '已保存',
              duration: 1000,
            })
            setTimeout(() => {
              wx.navigateBack({
                delta: 1,
              })
            }, 1000)
          })
        } else {
          wx.navigateBack({
            delta: 1,
          })
        }
      })
    } else {
      wx.navigateBack({
        delta: 1,
      })
    }
  },

  switch (e) {
    this.setData({
      edited: true
    })
    if (e.currentTarget.dataset.id == "useSidebar") {
      this.setData({
        useSidebar: e.detail.value
      })
    } else if (e.currentTarget.dataset.id == "bing") {
      this.setData({
        bing: e.detail.value
      })
    } else if (e.currentTarget.dataset.id == "hitokoto") {
      this.setData({
        hitokoto: e.detail.value
      })
    }
  },

  themeColorful() {
    this.setData({
      pureTheme: false,
      themeColorful: `border:${this.data.primaryColor} solid 2px;`,
      themePure: '',
      edited: true
    })
  },
  themePure() {
    this.setData({
      pureTheme: true,
      themePure: `border:${this.data.primaryColor} solid 2px;`,
      themeColorful: '',
      edited: true,
    })
  },

  colorSelect(e) {
    let color = e.currentTarget.dataset.color;
    // console.log(color);
    this.setData({
      primaryColor: color,
      rgbaPrimaryColor: app.colorRgba(color, .2),
      edited: true,
    })
    if (this.data.pureTheme) {
      this.setData({
        themePure: `border:${color} solid 2px;`,
        themeColorful: ''
      })
    } else {
      this.setData({
        themePure: '',
        themeColorful: `border:${color} solid 2px;`,
      })
    }
    this.selectAllComponents('.switch').forEach(element => {
      element.refreshStatus()
    })
  },

  toUpper() {
    if (this.data.theme == 'light') {
      this.setData({
        headbarStyle: "",
      })
    } else if (this.data.theme == 'dark') {
      this.setData({
        headbarStyle: "",
      })
    }
  },

  scroll() {
    if (this.data.theme == 'light') {
      this.setData({
        headbarStyle: "background:#fff;box-shadow: 0 0rpx 10rpx #bbb;",
      })
    } else if (this.data.theme == 'dark') {
      this.setData({
        headbarStyle: "background:#222426;box-shadow: 0 0rpx 10rpx #222;",
      })
    }
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
    this.setData({
      primaryColor: app.globalData.primaryColor,
      pureTheme: app.globalData.pureTheme,
      rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
      theme: app.globalData.systemInfo.theme,
      useSidebar: app.globalData.useSidebar,
      bing: app.globalData.bing,
      hitokoto: app.globalData.hitokoto,
    })
    if (this.data.pureTheme) {
      this.setData({
        pureTheme: true,
        themePure: `border:${this.data.primaryColor} solid 2px;`,
        themeColorful: '',
      })
    } else {
      this.setData({
        pureTheme: false,
        themeColorful: `border:${this.data.primaryColor} solid 2px;`,
        themePure: '',
      })
    }
    this.selectAllComponents('.switch').forEach(element => {
      element.refreshStatus()
    })
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

  }
})