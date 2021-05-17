// pages/sharePage/sharePage.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    primaryColor: app.globalData.primaryColor,
    rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
    nickName: app.globalData.userInfo.nickName ? app.globalData.userInfo.nickName : 'Femark用户',
    md: '',
    delta: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"],
    })
    var that = this
    let strr = options.json.replace(/~~/, '&')
    let str = strr.replace(/@@/, '=')
    let element = JSON.parse(str)
    let {
      delta,
      heading,
      newShare,
      shareCardBackgroundColor,
      shareCardColor,
      shareCardTheme,
      time,
      useMarkdown,
      md,
      nickName
    } = element

    this.setData({
      heading,
      time,
      shareCardTheme,
      shareCardColor,
      shareCardBackgroundColor,
      useMarkdown,
      newShare,
      md,
      delta
    })
  },

  onPreviewEditorReady() {
    var that = this
    wx.createSelectorQuery().select('#previewEditor').context(function (res) {
      that.previewEditorCtx = res.context
      if (that.data.delta) {
        that.previewEditorCtx.setContents({
          delta: that.data.delta,
        })
      }
    }).exec()
  },

  floatTap() {

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
    // let heading = this.data.heading;
    // let shareCardTheme = this.data.shareCardTheme;
    // let shareCardColor = this.data.shareCardColor;
    // let shareCardBackgroundColor = this.data.shareCardBackgroundColor;
    // let useMarkdown = this.data.useMarkdown;
    // let md = this.data.md;
    // let time = this.data.time
    // let nickName = this.data.nickName
    // let html = this.data.html
    let elementm = {
      newShare: false,
      heading: this.data.heading,
      shareCardTheme: this.data.shareCardTheme,
      shareCardColor: this.data.shareCardColor,
      shareCardBackgroundColor: this.data.shareCardBackgroundColor,
      useMarkdown: this.data.useMarkdown,
      time: this.data.time,
      nickName: this.data.nickName,
      md: this.data.md,
    }
    let elementd = {
      newShare: false,
      heading: this.data.heading,
      shareCardTheme: this.data.shareCardTheme,
      shareCardColor: this.data.shareCardColor,
      shareCardBackgroundColor: this.data.shareCardBackgroundColor,
      useMarkdown: this.data.useMarkdown,
      time: this.data.time,
      nickName: this.data.nickName,
      delta: this.data.delta,
    }
    let textm = JSON.stringify(elementm)
    let textmr = textm.replace(/=/g, '@@')
    let textmrr = textmr.replace(/&/g, '~~')
    let textd = JSON.stringify(elementd)
    let textdr = textd.replace(/=/g, '@@')
    let textdrr = textdr.replace(/&/g, '~~')
    if (this.data.useMarkdown) {
      return {
        title: heading == 'null' ? `由${nickName}分享的内容` : heading,
        path: `/pages/sharePage/sharePage?json=${textmrr}`,
      }
    } else {
      return {
        title: heading == 'null' ? `由${nickName}分享的内容` : heading,
        path: `/pages/sharePage/sharePage?json=${textdrr}`,
      }
    }
  },

  onShareTimeLine() {
    let heading = this.data.heading;
    // let shareCardTheme = this.data.shareCardTheme;
    // let shareCardColor = this.data.shareCardColor;
    // let shareCardBackgroundColor = this.data.shareCardBackgroundColor;
    let useMarkdown = this.data.useMarkdown;
    // let md = this.data.md;
    // let time = this.data.time
    let nickName = this.data.nickName
    let elementm = {
      newShare: false,
      heading: this.data.heading,
      shareCardTheme: this.data.shareCardTheme,
      shareCardColor: this.data.shareCardColor,
      shareCardBackgroundColor: this.data.shareCardBackgroundColor,
      useMarkdown: this.data.useMarkdown,
      time: this.data.time,
      nickName: this.data.nickName,
      md: this.data.md,
    }
    let elementd = {
      newShare: false,
      heading: this.data.heading,
      shareCardTheme: this.data.shareCardTheme,
      shareCardColor: this.data.shareCardColor,
      shareCardBackgroundColor: this.data.shareCardBackgroundColor,
      useMarkdown: this.data.useMarkdown,
      time: this.data.time,
      nickName: this.data.nickName,
      delta: this.data.delta,
    }
    let textm = JSON.stringify(elementm)
    let textmr = textm.replace(/=/g, '@@')
    let textmrr = textmr.replace(/&/g, '~~')
    let textd = JSON.stringify(elementd)
    let textdr = textd.replace(/=/g, '@@')
    let textdrr = textdr.replace(/&/g, '~~')
    if (useMarkdown) {
      return{
        title: heading == 'null' ? `由${nickName}分享的内容` : heading,
        query: `json=${textmrr}`
      }
    }
    else {
      return {
        title: heading == 'null' ? `由${nickName}分享的内容` : heading,
        query: `json=${textdrr}`
      }
    }
  },
})