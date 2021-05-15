// pages/note/note.js
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
    headingNum: 0,
    contentNum: 0,
    md: "",
    windowHeight: app.globalData.systemInfo.windowHeight,
    isPad: app.globalData.isPad,
    edit: null,
    edited: false,
    heading: null,
    content: null,
    contentDelta: null,
    galleryDetail: [],
    tempImgs: [],
    category: 0,
    useMarkdown: true,
    encrypt: false,
    password: "",
    markdownPreview: app.globalData.markdownPreview,
    markdownPreviewDelay: app.globalData.markdownPreviewDelay,
    markdownPreviewDelayData: [1, 2, 3, 4, 5, 6],
    categoryData: app.globalData.categoryData,
    // 编辑器
    formats: {},
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    editorCtx: null,
    toolbarActivated: null,
  },

  submit() {
    var that = this
    wx.showModal({
      title: "注意",
      content: "是否保存更改",
      confirmColor: this.data.primaryColor
    }).then(res => {
      if (res.confirm) {
        wx.showLoading({
          title: '操作进行中',
        })
        if (this.data.id == null) {
          console.log("new")
          //新建
          let imgs = {
            paths: this.data.tempImgs,
            IDs: new Array
          }
          async function process() {
            try {
              if (imgs.paths.length != 0) {
                await database.uploadImg(imgs)
                wx.cloud.getTempFileURL({
                  fileList: imgs.IDs,
                }).then(res => {
                  let newGalleryDetail = that.data.galleryDetail.concat(res.fileList)
                  that.setData({
                    galleryDetail: newGalleryDetail,
                  })
                })
              }
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
            } catch (e) {
              console.log(e)
              wx.showToast({
                icon: "error",
                title: "操作失败"
              })
            }
            //传完清除tempPath
            that.setData({
              tempImgs: [],
            })
            // console.log(imgs.IDs)
          }
          process()
        } else {
          //修改
          console.log("edit")
          let imgs = {
            paths: this.data.tempImgs,
            IDs: new Array
          }
          async function process() {
            try {
              if (imgs.paths.length != 0) {
                await database.uploadImg(imgs)
                await wx.cloud.database().collection('note').doc(app.globalData.id).update({
                  data: {
                    [`note.${that.data.id}.gallery`]: _.push(imgs.IDs)
                  }
                })
                wx.cloud.getTempFileURL({
                  fileList: imgs.IDs,
                }).then(res => {
                  let newGalleryDetail = that.data.galleryDetail.concat(res.fileList)
                  that.setData({
                    galleryDetail: newGalleryDetail,
                  })
                })
              }
              await wx.cloud.database().collection('note').doc(app.globalData.id).update({
                data: {
                  [`note.${that.data.id}.heading`]: that.data.heading,
                  [`note.${that.data.id}.content`]: that.data.content,
                  [`note.${that.data.id}.category`]: that.data.category,
                  [`note.${that.data.id}.encrypt`]: that.data.encrypt,
                  [`note.${that.data.id}.password`]: that.data.password,
                  [`note.${that.data.id}.useMarkdown`]: that.data.useMarkdown,
                  [`note.${that.data.id}.timestamp`]: new Date().getTime(),
                }
              })
              wx.showToast({
                title: "已保存更改",
              })
              const eventChannel = that.getOpenerEventChannel()
              eventChannel.emit('toIndex', function (data) {

              })
            } catch (e) {
              console.log(e)
              wx.showToast({
                icon: "error",
                title: "操作失败"
              })
            }
            //传完清除tempPath
            that.setData({
              tempImgs: [],
            })
          }
          process()
        }
        this.setData({
          edited: false
        })
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
          var tempFilePaths = []
          res.tempFilePaths.map(element => {
            tempFilePaths.push({
              src: element,
              timestamp: new Date().getTime(),
              fromContent: false
            })
          })
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
    var _ = wx.cloud.database().command
    if (!this.data.edit) {
      this.showSnackbar("请先启用编辑")
    } else {
      wx.showModal({
        title: "警告",
        content: "将永久删除该笔记，该过程不可逆转，是否继续操作",
        confirmText: "仍然继续",
        confirmColor: "#ff5252",
      }).then(res => {
        if (res.confirm) {
          wx.showLoading({
            title: '正在删除',
          })
          wx.cloud.database().collection('note').doc(app.globalData.id).update({
            data: {
              note: _.pull({
                timestamp: that.data.timestamp
              })
            }
          }).then(res => {
            wx.showToast({
              title: '已删除',
            })
            setTimeout(() => {
              wx.navigateBack({
                delta: 1,
              })
              const eventChannel = that.getOpenerEventChannel()
              eventChannel.emit('toIndex', function (data) {

              })
            }, 1500)
          }).catch(err => {
            wx.showToast({
              title: '网络错误',
              icon: 'error'
            })
          })
        }
      })
    }
  },

  previewImg(e) {
    console.log(e.currentTarget.dataset.url)
    let urls = []
    this.data.galleryDetail.forEach(element => {
      urls.push(element.tempFileURL)
    })
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: urls,
    })
  },

  deleteImg(e) {
    var that = this
    const _ = wx.cloud.database().command
    wx.showModal({
      title: "警告",
      content: "将同时从云端移除图片，该过程不可逆转，是否继续操作",
      confirmText: "仍然继续",
      confirmColor: "#ff5252",
    }).then(res => {
      if (res.confirm) {
        //云存储移除
        async function process() {
          try {
            var fileID = that.data.galleryDetail[e.currentTarget.dataset.index].fileID;
            wx.showLoading({
              title: '正在删除文件',
            })
            await wx.cloud.deleteFile({
              fileList: [fileID]
            })
            //数据库移除
            wx.showLoading({
              title: '正在修改数据',
            })
            await wx.cloud.database().collection('note').doc(app.globalData.id).update({
              data: {
                [`note.${that.data.id}.gallery`]: _.pull(fileID)
              }
            })
            //前端移除
            let array = that.data.galleryDetail
            array.splice(e.currentTarget.dataset.index, 1, );
            // console.log(array.length)
            that.setData({
              galleryDetail: array,
            })
            wx.showToast({
              title: "操作成功",
            })
          } catch (e) {
            console.log(e)
            wx.showToast({
              icon: "error",
              title: "操作失败"
            })
          }
        }
        process()
      }
    })
    // console.log(e.currentTarget.dataset.index)
  },

  previewTempImg(e) {
    console.log(e.currentTarget.dataset.url)
    let urls = []
    this.data.tempImgs.forEach(element=>{
      urls.push(element.src)
    })
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: urls,
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

  contentFocus() {
    this.setData({
      contentNumStyle: `color:${this.data.primaryColor};`
    })
  },

  contentBlur() {
    this.setData({
      contentNumStyle: "",
    })
  },

  contentInput(e) {
    console.log(e)
    this.setData({
      contentNum: e.detail.text.length - 1,
      content: e.detail.text,
      contentDelta: e.detail.delta,
    })
  },

  // contentInput(e) {
  //   this.data.temp = e.detail.value;
  //   this.setData({
  //     content: e.detail.value,
  //     contentNum: e.detail.value.length,
  //     btnStyle: "right:0;",
  //     edited: true
  //   })
  //   if (this.data.useMarkdown && this.data.markdownPreview) {
  //     if (this.data.timer) {
  //       clearTimeout(this.data.timer);
  //       this.data.timer = setTimeout(() => {
  //         this.setData({
  //           md: e.detail.value
  //         })
  //       }, this.data.markdownPreviewDelay * 1000);
  //     } else {
  //       this.data.timer = setTimeout(() => {
  //         this.setData({
  //           md: e.detail.value
  //         })
  //       }, this.data.markdownPreviewDelay * 1000);
  //     }
  //   }
  // },

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
          category: e.detail.valueKey
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
        headbarStyle: "background:#303638;box-shadow: 0 0rpx 10rpx #222;",
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
        })
      }
    } else {
      this.setData({
        edit: true,
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

  updatePosition(keyboardHeight) {
    const toolbarHeight = 50
    const {
      windowHeight,
      platform
    } = wx.getSystemInfoSync()
    let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight
    this.setData({
      editorHeight,
      keyboardHeight
    })
  },
  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync()
    const {
      statusBarHeight,
      platform
    } = systemInfo
    const isIOS = platform === 'ios'
    const navigationBarHeight = isIOS ? 44 : 48
    return statusBarHeight + navigationBarHeight
  },
  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context
    }).exec()
  },
  format(e) {
    console.log(e)
    let {
      name,
      value
    } = e.currentTarget.dataset
    if (!name) return
    // console.log('format', name, value)
    this.editorCtx.format(name, value)
  },
  onStatusChange(e) {
    // console.log(e.detail)
    const formats = e.detail
    this.setData({
      edited: true,
      formats
    })
  },
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
        console.log('insert divider success')
      }
    })
    this.setData({
      edited: true
    })
  },
  clear() {
    this.editorCtx.clear({
      success: function (res) {
        console.log("clear success")
      }
    })
  },
  undo() {
    this.editorCtx.undo({
      success: function (res) {
        console.log("undo success")
      }
    })
  },
  redo() {
    this.editorCtx.redo({
      success: function (res) {
        console.log("redo success")
      }
    })
  },
  removeFormat() {
    this.editorCtx.removeFormat()
  },
  insertDate() {
    const date = new Date()
    const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    this.editorCtx.insertText({
      text: formatDate
    })
  },
  insertImage() {
    this.setData({
      toolbarActivated: null
    })
    const that = this
    wx.chooseImage({
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      count: 1,
      success: function (res) {
        let timestamp = new Date().getTime()
        that.editorCtx.insertImage({
          src: res.tempFilePaths[0],
          data: {
            timestamp,
          },
          width: '80%',
          success: function () {
            console.log('insert image success')
          }
        })
        that.setData({
          tempImgs: that.data.tempImgs.concat([{
            src: res.tempFilePaths[0],
            timestamp,
            fromContent: true
          }]),
          edited: true
        })
      }
    })
  },

  popupToolbox(e) {
    if (e.currentTarget.dataset.name == this.data.toolbarActivated) {
      this.setData({
        toolbarActivated: null,
      })
    } else {
      this.setData({
        toolbarActivated: e.currentTarget.dataset.name
      })
    }
  },

  formatSize(e) {
    let value = e.detail.value;
    if (value == 4) {
      this.editorCtx.format("header", 4)
      this.editorCtx.format("header", 4)
    } else {
      this.editorCtx.format("header", value)
    }
  },

  formatColor(e) {
    let value = e.currentTarget.dataset.color;
    if (value == '#000000') {
      this.editorCtx.format("color", value);
      this.editorCtx.format("color", value);
    } else {
      this.editorCtx.format("color", value);
    }
  },
  formatPaint(e) {
    let value = e.currentTarget.dataset.color;
    if (value == '#ffffff') {
      this.editorCtx.format("backgroundColor", value);
      this.editorCtx.format("backgroundColor", value);
    } else {
      this.editorCtx.format("backgroundColor", value);
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
    //重新拉取配置
    this.setData({
      pureTheme: app.globalData.pureTheme,
      isPad: app.globalData.isPad,
      primaryColor: app.globalData.primaryColor,
      categoryData: app.globalData.categoryData,
      rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
      markdownPreview: app.globalData.markdownPreview,
      markdownPreviewDelay: app.globalData.markdownPreviewDelay,
    })
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
    eventChannel.on('toNote', (res) => {
      // console.log(res.edit)
      this.setData({
        edit: res.edit,
        id: res.data.id,
        heading: res.data.heading,
        content: res.data.content,
        galleryDetail: res.data.galleryDetail,
        encrypt: res.data.encrypt,
        password: res.data.password,
        useMarkdown: res.data.useMarkdown,
        category: res.data.category,
        timestamp: res.data.timestamp,
        headingNum: res.data.heading == null ? 0 : res.data.heading.length,
        contentNum: res.data.content == null ? 0 : res.data.content.length,
        md: res.data.content,
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
    //初始化编辑器
    const platform = wx.getSystemInfoSync().platform
    const isIOS = platform === 'ios'
    this.setData({
      isIOS
    })
    const that = this
    this.updatePosition(0)
    let keyboardHeight = 0
    wx.onKeyboardHeightChange(res => {
      if (res.height === keyboardHeight) return
      const duration = res.height > 0 ? res.duration * 1000 : 0
      keyboardHeight = res.height
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight)
            that.editorCtx.scrollIntoView()
          }
        })
      }, duration)

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

  },

  onThemeChange: function () {
    console.log(app.globalData.systemInfo.theme)
    this.setData({
      theme: app.globalData.systemInfo.theme
    })
  }
})