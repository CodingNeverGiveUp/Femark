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
    newShare: false,
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
      nickName,
      fromTimeLine,
    } = element
    console.log(newShare, typeof (newShare))
    this.setData({
      newShare,
      heading,
      time,
      shareCardTheme,
      shareCardColor,
      shareCardBackgroundColor,
      useMarkdown,
      md,
      delta,
      nickName
    })
    // if (newShare == "false") {
    //   this.setData({
    //     newShare: false,
    //   })
    // } else {
    //   this.setData({
    //     newShare: true,
    //   })
    // }
    setTimeout(() => {
      if (fromTimeLine) {
        wx.navigateTo({
          url: '/pages/logincheck/logincheck',
        })
        app.initialize();
      }
    }, 1000);
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
    //重新拉取配置
    this.setData({
      primaryColor: app.globalData.primaryColor,
      rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
    })
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
    let telementm = {
      newShare: false,
      heading: this.data.heading,
      shareCardTheme: this.data.shareCardTheme,
      shareCardColor: this.data.shareCardColor,
      shareCardBackgroundColor: this.data.shareCardBackgroundColor,
      useMarkdown: this.data.useMarkdown,
      time: this.data.time,
      nickName: this.data.nickName,
      md: this.data.md,
      fromTimeLine: true,
    }
    let telementd = {
      newShare: false,
      heading: this.data.heading,
      shareCardTheme: this.data.shareCardTheme,
      shareCardColor: this.data.shareCardColor,
      shareCardBackgroundColor: this.data.shareCardBackgroundColor,
      useMarkdown: this.data.useMarkdown,
      time: this.data.time,
      nickName: this.data.nickName,
      delta: this.data.delta,
      fromTimeLine: true,
    }
    let ttextm = JSON.stringify(telementm)
    let ttextmr = ttextm.replace(/=/g, '@@')
    let ttextmrr = ttextmr.replace(/&/g, '~~')
    let ttextd = JSON.stringify(telementd)
    let ttextdr = ttextd.replace(/=/g, '@@')
    let ttextdrr = ttextdr.replace(/&/g, '~~')
    this.setData({
      ttextdrr,
      ttextmrr,
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
    return {
      title: this.data.heading == 'null' ? `由${this.data.nickName}分享的内容` : this.data.heading,
      path: `/pages/sharePage/sharePage?json=${this.data.useMarkdown ? this.data.textmrr : this.data.textdrr}`,
    }
  },

  onShareTimeline() {
    return {
      title: this.data.heading ? this.data.heading : `由 ${this.data.nickName} 分享的内容`,
      // title: this.data.heading == 'null' ? `由${this.data.nickName}分享的内容` : this.data.heading,
      query: `json=${this.data.useMarkdown ? this.data.ttextmrr : this.data.ttextdrr}`
    }
  },
})