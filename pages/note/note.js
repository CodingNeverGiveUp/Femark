// pages/note/note.js
// 获取应用实例
const app = getApp()
const database = require("../../utils/database.js")
const event = require("../../utils/event.js")
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
    md: "",
    windowHeight: app.globalData.systemInfo.windowHeight,
    edit: null,
    edited: false,
    heading: null,
    content: null,
    gallery: [],
    tempImgs: [],
    floatContent: "edit",
    heading: null,
    content: null,
    useMarkdown: true,
    encrypt: false,
    password: "",
    markdownPreview: true,
    markdownPreviewDelay: 2,
    markdownPreviewDelayData: [1, 2, 3, 4, 5, 6],
    categoryData: app.globalData.categoryData,
  },

  submit() {
    var that = this
    wx.showModal({
      title: "注意",
      content: "是否应用更改",
      confirmColor: this.data.primaryColor
    }).then(res => {
      if (res.confirm) {
        let imgs = {
          paths: this.data.tempImgs,
          IDs: new Array
        }
        async function process() {
          try {
            await database.uploadImg(imgs)
            let object = {
              heading: that.data.heading,
              content: that.data.content,
              gallery: imgs.IDs,
              audio: null,
              category: that.data.category,
              encrypt: that.data.encrypt,
              password: that.data.password,
              useMarkdown: that.data.useMarkdown,
              timestamp: new Date().getTime(),
            }
            await database.addNote(object)
            wx.showToast({
              title: '已保存更改',
            })
          } catch {
            wx.showToast({
              content: "操作失败"
            })
          }
          //传完清除tempPath
          that.setData({
            tempImgs: []
          })
          // console.log(imgs.IDs)
        }
        process()
      }
    })
  },

  back() {
    if (this.data.edited) {
      wx.showModal({
        title: "警告",
        content: "更改未保存，是否舍弃更改",
        confirmColor: '#ff5252',
        confirmText: "仍然退出"
      }).then(res => {
        if (res.confirm) {
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

  addImg() {
    var that = this
    if (!this.data.edit) {
      this.showSnackbar("请先启用编辑")
    } else {
      wx.chooseImage({
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
          console.log(res)
          // tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths
          // console.log(tempFilePaths)
          that.setData({
            tempImgs: that.data.tempImgs.concat(tempFilePaths),
            edited: true
          })
        }
      })
    }
  },

  delete() {
    var that = this
    if (!this.data.edit) {
      this.showSnackbar("请先启用编辑")
    } else {}
  },

  previewTempImg(e) {
    console.log(e.currentTarget.dataset.url)
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: this.data.tempImgs,
    })
  },

  deleteTempImg(e) {
    // console.log(e.currentTarget.dataset.index)
    let array = this.data.tempImgs
    array.splice(e.currentTarget.dataset.index, 1, );
    // console.log(array.length)
    this.setData({
      tempImgs: array,
      edited: true
    })
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
      heading: e.detail.value,
      headingNum: e.detail.value.length,
      edited: true,
    })
  },

  contentTap(e) {

  },

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
    this.data.temp = e.detail.value;
    this.setData({
      content: e.detail.value,
      contentNum: e.detail.value.length,
      btnStyle: "right:0;",
      edited: true
    })
    //预览
    if (this.data.useMarkdown && this.data.markdownPreview) {
      if (this.data.timer) {
        clearTimeout(this.data.timer);
        this.data.timer = setTimeout(() => {
          this.setData({
            md: e.detail.value
          })
        }, this.data.markdownPreviewDelay * 1000);
      } else {
        this.data.timer = setTimeout(() => {
          this.setData({
            md: e.detail.value
          })
        }, this.data.markdownPreviewDelay * 1000);
      }
      // console.log(this.data.markdownPreviewDelay)
    }
  },

  previewRefresh() {
    if (this.data.temp) {
      this.setData({
        md: this.data.temp,
        btnStyle: "right:-300rpx;"
      })
    }
  },

  pick(e) {
    console.log(e);
    if (e.detail.disabled) {
      this.showSnackbar("请先启用编辑")
    } else {
      this.setData({
        edited: true,
      })
      if (e.currentTarget.dataset.id == "markdownPreviewDelay") {
        this.setData({
          markdownPreviewDelay: e.detail.value
        })
      }
      if (e.currentTarget.dataset.id == "category") {
        this.setData({
          category: e.detail.value
        })
      }
    }
  },

  switch (e) {
    console.log(e);
    if (e.detail.disabled) {
      this.showSnackbar("请先启用编辑")
    } else {
      this.setData({
        edited: true,
      })
      if (e.currentTarget.dataset.id == "markdownPreview") {
        this.setData({
          markdownPreview: e.detail.value
        })
      } else if (e.currentTarget.dataset.id == "useMarkdown") {
        this.setData({
          useMarkdown: e.detail.value
        })
      } else if (e.currentTarget.dataset.id == "encrypt") {
        this.setData({
          encrypt: e.detail.value
        })
      }
    }
  },

  input(e) {
    if (e.detail.disabled) {
      this.showSnackbar("请先启用编辑")
    } else {
      this.setData({
        edited: true,
      })
      if (e.currentTarget.dataset.id == "password") {
        this.setData({
          password: e.detail.value
        })
      }
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
        headbarStyle: "background:#222426;box-shadow: 0 0rpx 10rpx #222;",
      })
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
    this.selectAllComponents('.input').forEach(element => {
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
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('addNote', (res) => {
      // console.log(res.edit)
      this.setData({
        edit: res.edit,
      })
      this.selectAllComponents('.switch').forEach(element => {
        element.refreshStatus()
      })
      this.selectAllComponents('.picker').forEach(element => {
        element.refreshStatus()
      })
      this.selectAllComponents('.input').forEach(element => {
        element.refreshStatus()
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
  onShow: function () {},

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
  }
})