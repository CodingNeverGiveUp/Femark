// pages/about/about.js
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
    edited: false,
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
            mask: true
          })
          wx.cloud.database().collection('note').doc(app.globalData.id).update({
            data: {
              profile: {
                markdownByDefault: this.data.markdownByDefault,
                markdownPreview: this.data.markdownPreview,
                markdownPreviewDelay: Number(this.data.markdownPreviewDelay),
              }
            }
          }).then(res => {
            app.globalData.markdownByDefault = this.data.markdownByDefault;
            app.globalData.markdownPreview = this.data.markdownPreview;
            app.globalData.markdownPreviewDelay = Number(this.data.markdownPreviewDelay);
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
    if (e.currentTarget.dataset.id == "markdownByDefault") {
      this.setData({
        markdownByDefault: e.detail.value
      })
    } else if (e.currentTarget.dataset.id == "markdownPreview") {
      this.setData({
        markdownPreview: e.detail.value
      })
    }
  },

  pick(e) {
    this.setData({
      edited: true,
    })
    if (e.currentTarget.dataset.id == "markdownPreviewDelay") {
      this.setData({
        markdownPreviewDelay: e.detail.value
      })
    }
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

  scroll(e) {
    let num = e.detail.scrollTop
    // console.log(num)
    if (num < 200) {
      if (this.data.theme == 'light') {
        this.setData({
          headbarStyle: "",
        })
      } else if (this.data.theme == 'dark') {
        this.setData({
          headbarStyle: "",
        })
      }
    } else {
      if (this.data.theme == 'light') {
        this.setData({
          headbarStyle: "background:#fff;box-shadow: 0 0rpx 10rpx #bbb;",
        })
      } else if (this.data.theme == 'dark') {
        this.setData({
          headbarStyle: "background:#303638;box-shadow: 0 0rpx 10rpx #222;",
        })
      }
    }
  },

  showSnackbar(content) {
    this.setData({
      snackbarStyle: "bottom:0",
      snackbarContent: content
    })
    setTimeout(() => {
      this.setData({
        snackbarStyle: "bottom:-50px",
      })
    }, 1500);
  },

  setClipboard(e){
    let data = e.currentTarget.dataset.data
    let toast = e.currentTarget.dataset.toast
    var that = this
    wx.setClipboardData({
      data: data,
      success(res){
        wx.hideToast({
          success: (res) => {
            that.showSnackbar(toast)
          },
        })
      } 
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    event.on('Theme', this, function (data) {
      this.setData({
        theme: data
      })
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
    this.setData({
      primaryColor: app.globalData.primaryColor,
      pureTheme: app.globalData.pureTheme,
      rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
      theme: app.globalData.systemInfo.theme,
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
    event.remove('Theme', this);
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