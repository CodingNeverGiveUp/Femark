// pages/behaviorSetting/behaviorSetting.js
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
    edited: false,
    markdownPreviewDelayData: [1, 2, 3, 4, 5, 6],
    enableRecord: false,
  },

  //获取授权
  recordSetting() {
    var that = this
    wx.openSetting({
      success(res) {
        if (res.authSetting['scope.record']) {
          that.setData({
            authed: true
          })
        }
      }
    })
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
                saveRecordFileByDefault: app.globalData.saveRecordFileByDefault,
                recordLanguage: app.globalData.recordLanguage,
              }
            }
          }).then(res => {
            app.globalData.markdownByDefault = this.data.markdownByDefault;
            app.globalData.markdownPreview = this.data.markdownPreview;
            app.globalData.markdownPreviewDelay = Number(this.data.markdownPreviewDelay);
            app.globalData.saveRecordFileByDefault = this.data.saveRecordFileByDefault;
            app.globalData.recordLanguage = this.data.recordLanguage;
            wx.showToast({
              title: '已保存',
              duration: 1000,
            })
            const eventChannel = this.getOpenerEventChannel()
            eventChannel.emit('toAccount', function (data) {

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
    } else if (e.currentTarget.dataset.id == "saveRecordFileByDefault") {
      this.setData({
        saveRecordFileByDefault: e.detail.value
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
    } else if (e.currentTarget.dataset.id == "recordLanguage") {
      this.setData({
        recordLanguage: e.detail.valueKey
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

  scroll() {
    if (this.data.theme == 'light') {
      this.setData({
        headbarStyle: "background:#fff;box-shadow: 0 0rpx 10rpx #bbb;",
      })
    } else if (this.data.theme == 'dark') {
      this.setData({
        headbarStyle: "background:#303638;box-shadow: 0 0rpx 10rpx #222;",
      })
    }
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
    var that = this
    //拉取设置信息
    wx.getSetting({
      withSubscriptions: true,
    }).then(res => {
      // console.log(res)
      if (res.authSetting["scope.record"]) {
        that.setData({
          enableRecord: true
        })
      } else {
        that.setData({
          enableRecord: false
        })
      }
    })
    this.setData({
      primaryColor: app.globalData.primaryColor,
      pureTheme: app.globalData.pureTheme,
      rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
      theme: app.globalData.systemInfo.theme,
      markdownByDefault: app.globalData.markdownByDefault,
      markdownPreview: app.globalData.markdownPreview,
      markdownPreviewDelay: app.globalData.markdownPreviewDelay,
      saveRecordFileByDefault: app.globalData.saveRecordFileByDefault,
      recordLanguage: app.globalData.recordLanguage,
    })
    this.selectAllComponents('.switch').forEach(element => {
      element.refreshStatus()
    })
    this.selectAllComponents('.picker').forEach(element => {
      element.refreshStatus()
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
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
                saveRecordFileByDefault: this.data.saveRecordFileByDefault,
                recordLanguage: this.data.recordLanguage,
              }
            }
          }).then(res => {
            app.globalData.markdownByDefault = this.data.markdownByDefault;
            app.globalData.markdownPreview = this.data.markdownPreview;
            app.globalData.markdownPreviewDelay = Number(this.data.markdownPreviewDelay);
            app.globalData.saveRecordFileByDefault = this.data.saveRecordFileByDefault;
            app.globalData.recordLanguage = this.data.recordLanguage;

            wx.showToast({
              title: '已保存',
              duration: 1000,
            })
            const eventChannel = this.getOpenerEventChannel()
            eventChannel.emit('toAccount', function (data) {

            })
            setTimeout(() => {
              wx.navigateBack({
                delta: 1,
              })
            }, 1000)
          })
        }
      })
    }
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