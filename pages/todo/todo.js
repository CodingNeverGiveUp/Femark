// pages/todo/todo.js
const app = getApp()
const database = require("../../utils/database.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    primaryColor: app.globalData.primaryColor,
    pureTheme: app.globalData.pureTheme,
    rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
    theme: app.globalData.systemInfo.theme,
    headingNum: 0,
    contentNum: 0,
    edit: false,
    list: true,
    listData: [{
      content: "测试文本1",
      top: 0,
      finished: false,
      dragging: false,
    }, {
      content: "测试文本2",
      top: 0,
      finished: true,
      dragging: false,
    }, {
      content: "测试文本3",
      top: 0,
      finished: true,
      dragging: false,
    }, {
      content: "测试文本4",
      top: 0,
      finished: true,
      dragging: false,
    }],
    listTop: null,
    listMin: null,
    listMax: null,
    notification: false,
    autoDelete: true,
    autoDeleteDelay: 5,
    autoDeleteDelayData: [1, 2, 3, 4, 5, 6, 7],
    floatContent: "edit",
  },

  delete() {
    var that = this
    if (!this.data.edit) {
      this.showSnackbar("请先启用编辑")
    } else {}
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

  headingFocus() {
    this.setData({
      headingStyle: `border-bottom-color:${this.data.primaryColor};`,
      headingNumStyle: `color:${this.data.primaryColor};`
    })
  },

  headingBlur() {
    this.setData({
      headingStyle: "",
      headingNumStyle: "",
    })
  },

  headingInput(e) {
    // console.log(e.detail.value.length);
    this.setData({
      headingNum: e.detail.value.length,
    })
  },

  contentTap() {},

  contentFocus() {
    this.setData({
      contentStyle: `border-bottom-color:${this.data.primaryColor};`,
      contentNumStyle: `color:${this.data.primaryColor};`
    })
  },

  contentBlur() {
    this.setData({
      contentStyle: "",
      contentNumStyle: "",
    })
  },

  contentInput(e) {
    // console.log(e.detail.value.length);
    // this.data.temp = e.detail.value;
    this.setData({
      contentNum: e.detail.value.length,
      btnStyle: "right:0;"
    })
  },

  listTap() {
    var that = this
    if (!this.data.edit) {
      this.showSnackbar("请先启用编辑")
    } else {
      this.setData({
        list: this.data.list ? false : true,
      })
    }
  },

  listInput(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index
    this.setData({
      [`listData[${index}].content`]: e.detail.value
    })
  },

  listSwitch(e) {
    if (!this.data.edit) {
      this.showSnackbar("请先启用编辑")
    } else {
      let index = e.currentTarget.dataset.index
      this.setData({
        [`listData[${index}].finished`]: this.data.listData[index].finished ? false : true,
      })
    }
  },

  listAddItem() {
    let array = this.data.listData
    array.push({
      content: "",
      top: 0,
      finished: false,
    })
    this.setData({
      listData: array
    })
  },

  listDeleteItem(e) {
    let index = e.currentTarget.dataset.index
    let array = this.data.listData
    array.splice(index, 1, )
    this.setData({
      listData: array
    })
  },

  dragStart(e) {
    // console.log(e)
    var that = this;
    var index = e.currentTarget.dataset.index;
    var query = wx.createSelectorQuery()
    query.select('.list').boundingClientRect(rect => {
      console.log(index * (-40), (this.data.listData.length - index - 1) * 40)
      this.setData({
        listTop: rect.top + index * 40,
        listMin: index * (-40),
        listMax: (this.data.listData.length - index - 1) * 40,
        [`listData.[${index}].dragging`]: true
      })
      // console.log(rect.top)
    }).exec()
  },
  dragMove(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var top = this.data.listTop
    var res = e.changedTouches[0].clientY - top - 20
    // console.log(e.changedTouches[0].clientY - top)
    if (res >= this.data.listMin && res <= this.data.listMax) {
      this.setData({
        [`listData[${index}].top`]: res
      })
    }
  },
  dragEnd(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    this.setData({
      [`listData.[${index}].dragging`]: false
    })
  },

  pick(e) {
    console.log(e);
    if (e.detail.disabled) {
      this.showSnackbar("请先启用编辑")
    } else {
      if (e.currentTarget.dataset.id == "markdownPreviewDelay") {
        this.setData({
          markdownPreviewDelay: e.detail.value
        })
      }
    }
  },

  switch (e) {
    console.log(e);
    if (e.detail.disabled) {
      this.showSnackbar("请先启用编辑")
    } else {
      if (e.currentTarget.dataset.id == "notification") {
        this.setData({
          notification: e.detail.value
        })
      } else if (e.currentTarget.dataset.id == "autoDelete") {
        this.setData({
          autoDelete: e.detail.value
        })
      }
    }
  },

  floatTap() {
    if (this.data.edit) {
      if (this.data.edited) {
        this.submit();
      } else {
        this.setData({
          edit: false,
          floatContent: "edit"
        })
      }
    } else {
      this.setData({
        edit: true,
        floatContent: "save"
      })
    }
    this.selectAllComponents('.switch').forEach(element => {
      element.refreshStatus()
    })
    this.selectAllComponents('.picker').forEach(element => {
      element.refreshStatus()
    })
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

  onThemeChange: function () {
    console.log(app.globalData.systemInfo.theme)
    this.setData({
      theme: app.globalData.systemInfo.theme
    })
  },
})