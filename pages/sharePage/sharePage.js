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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    console.log(options)
    this.setData({
      heading: options.heading,
      time: options.time,
      shareCardTheme: Number(options.shareCardTheme),
      shareCardColor: options.shareCardColor,
      shareCardBackgroundColor: options.shareCardBackgroundColor,
      useMarkdown: options.useMarkdown == 'true' ? true : false,
      new: options.new == 'true' ? true : false,
      md: options.md
    })
  },

  floatTap(){
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage","shareTimeline"],
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
    let heading = this.data.heading;
    let shareCardTheme = this.data.shareCardTheme;
    let shareCardColor = this.data.shareCardColor;
    let shareCardBackgroundColor = this.data.shareCardBackgroundColor;
    let useMarkdown = this.data.useMarkdown;
    let md = this.data.md;
    let time = this.data.time
    let nickName = this.data.nickName
    return {
      title: this.data.heading == 'null' ? `由${nickName}分享的内容` : this.data.heading,
      path: `/pages/sharePage/sharePage?new="true"&heading=${heading}&time=${time}&shareCardTheme=${shareCardTheme}&shareCardColor=${shareCardColor}&shareCardBackgroundColor=${shareCardBackgroundColor}&useMarkdown=${useMarkdown}&md=${md}`,
    }
  }
})