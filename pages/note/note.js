// pages/note/note.js
// 获取应用实例
const app = getApp()
const database = require("../../utils/database.js")
const event = require("../../utils/event.js")
const time = require("../../utils/util.js")
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
    contentHtml: null,
    galleryDetail: [],
    files: [],
    tempImgs: [],
    tempFiles: [],
    imgTimestamps: [],
    category: 0,
    useMarkdown: true,
    encrypt: false,
    password: "",
    onPreview: false,
    markdownPreview: app.globalData.markdownPreview,
    markdownPreviewDelay: app.globalData.markdownPreviewDelay,
    markdownPreviewDelayData: [1, 2, 3, 4, 5, 6],
    categoryData: app.globalData.categoryData,
    timestamp: new Date().getTime(),
    time: time.formatChsTime(new Date()),
    //分享卡片
    shareCardTheme: 0,
    shareCardColor: app.globalData.systemInfo.theme == 'dark' ? 'rgb(48, 54, 56)' : 'rgb(255, 255, 255)',
    showShareCardColorPicker: false,
    shareCardBackgroundColor: app.globalData.systemInfo.theme == 'dark' ? 'rgb(34, 36, 38)' : 'rgb(241, 241, 241)',
    showShareCardBackgroundColorPicker: false,
    // 编辑器
    formats: {},
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    editorCtx: null,
    toolbarActivated: null,
  },

  //转到分享
  toSharePage() {
    let heading = this.data.heading;
    let shareCardTheme = this.data.shareCardTheme;
    let shareCardColor = this.data.shareCardColor;
    let shareCardBackgroundColor = this.data.shareCardBackgroundColor;
    let useMarkdown = this.data.useMarkdown;
    let md = this.data.md;
    let time = this.data.time;
    let html = this.data.contentHtml
    if(useMarkdown){
      wx.navigateTo({
        url: `/pages/sharePage/sharePage?new=true&heading=${heading}&time=${time}&shareCardTheme=${shareCardTheme}&shareCardColor=${shareCardColor}&shareCardBackgroundColor=${shareCardBackgroundColor}&useMarkdown=${useMarkdown}&md=${md}&html=${contentHtml}`,
      })
    }
  },

  // 显示取色器
  toPick: function (e) {
    let id = e.currentTarget.dataset.id
    if (id == 'cardColor') {
      this.setData({
        showShareCardColorPicker: true
      })
    } else if (id == 'cardBackgroundColor') {
      this.setData({
        showShareCardBackgroundColorPicker: true
      })
    }

  },
  //取色结果回调
  pickColor(e) {
    let rgb = e.detail.color;
    let id = e.currentTarget.id
    console.log(rgb, id)
    if (id == 'cardColor') {
      this.setData({
        shareCardColor: rgb
      })
    } else if (id == 'cardBackgroundColor') {
      this.setData({
        shareCardBackgroundColor: rgb
      })
    }
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
          mask: true
        })
        if (this.data.id == null) {
          console.log("new")
          //新建
          let imgs = this.data.tempImgs
          let files = this.data.tempFiles
          async function process() {
            try {
              if (imgs.length != 0) {
                await database.uploadImg(imgs)
                await database.idToUrl(imgs)
                that.setData({
                  galleryDetail: that.data.galleryDetail.concat(imgs),
                })
              }
              if (files.length != 0) {
                await database.uploadFile(files)
                await database.idToUrl(files)
                that.setData({
                  files: that.data.files.concat(files),
                })
              }
              let object = {
                heading: that.data.heading,
                content: that.data.content,
                contentDelta: that.data.contentDelta,
                gallery: imgs,
                files: files,
                audio: null,
                category: that.data.category,
                encrypt: that.data.encrypt,
                password: that.data.password,
                useMarkdown: that.data.useMarkdown,
                timestamp: new Date().getTime(),
                imgTimestamps: that.data.imgTimestamps
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
              tempFiles: [],
            })
            // console.log(imgs.IDs)
          }
          process()
        } else {
          //修改
          console.log("edit")
          let imgs = this.data.tempImgs
          let files = this.data.tempFiles
          async function process() {
            try {
              if (imgs.length != 0) {
                await database.uploadImg(imgs)
                await database.idToUrl(imgs)
                await wx.cloud.database().collection('note').doc(app.globalData.id).update({
                  data: {
                    [`note.${that.data.id}.gallery`]: _.push(imgs)
                  }
                })
                that.setData({
                  galleryDetail: that.data.galleryDetail.concat(imgs),
                })
              }
              if (files.length != 0) {
                await database.uploadFile(files)
                await database.idToUrl(files)
                await wx.cloud.database().collection('note').doc(app.globalData.id).update({
                  data: {
                    [`note.${that.data.id}.files`]: _.push(files)
                  }
                })
                that.setData({
                  files: that.data.files.concat(files)
                })
              }
              await wx.cloud.database().collection('note').doc(app.globalData.id).update({
                data: {
                  [`note.${that.data.id}.heading`]: that.data.heading,
                  [`note.${that.data.id}.content`]: that.data.content,
                  [`note.${that.data.id}.contentDelta`]: _.set(that.data.contentDelta),
                  [`note.${that.data.id}.category`]: that.data.category,
                  [`note.${that.data.id}.encrypt`]: that.data.encrypt,
                  [`note.${that.data.id}.password`]: that.data.password,
                  [`note.${that.data.id}.useMarkdown`]: that.data.useMarkdown,
                  [`note.${that.data.id}.timestamp`]: new Date().getTime(),
                  [`note.${that.data.id}.imgTimestamps`]: that.data.imgTimestamps,
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
              tempFiles: [],
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

  attach() {
    if (!this.data.edit) {
      this.showSnackbar("请先启用编辑")
    } else {
      wx.showActionSheet({
        itemList: ['添加图片附件', '添加视频附件', '添加文档附件'],
      }).then(res => {
        if (res.tapIndex == 0) {
          this.addImg()
        } else if (res.tapIndex == 1) {
          this.chooseMedia()
        } else if (res.tapIndex == 2) {
          this.chooseFile()
        }
      }).catch(err => {

      })
    }
  },

  chooseFile: function () {
    var that = this
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success(res) {
        console.log(res)
        // tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFiles
        if (tempFilePaths[0].size > 52428000) {
          wx.showModal({
            title: "警告",
            content: "文件过大（" + (tempFilePaths[0].size / 1048576).toFixed(2) + "MiB），超出 50 MiB 限制，请重新选择",
            confirmColor: '#ff5252',
            confirmText: "重试"
          }).then(res => {
            if (res.confirm) {
              that.chooseFile()
            }
          })
        } else {
          if (tempFilePaths[0].type == "image") {
            wx.showModal({
              title: "注意",
              content: "检测到已选择图片类型文件，建议上传至图库",
              confirmColor: that.data.primaryColor,
              cancelText: "仍然上传",
              confirmText: "放弃上传"
            }).then(res => {
              if (res.confirm) {} else if (res.cancel) {
                that.setData({
                  tempFiles: that.data.tempFiles.concat(tempFilePaths),
                  edited: true
                })
              }
            })
          } else {
            that.setData({
              tempFiles: that.data.tempFiles.concat(tempFilePaths),
              edited: true
            })
          }
        }
      },
      fail(err) {
        console.log(err)
      }
    })
  },

  chooseMedia() {
    var that = this
    wx.chooseMedia({
      mediaType: ['video'],
      sourceType: ['album'],
      success(res) {
        console.log(res)
        if (res.type == 'image') {
          wx.showModal({
            title: "注意",
            content: "检测到已选择图片类型文件，建议上传至图库",
            confirmColor: that.data.primaryColor,
            cancelText: "仍然上传",
            confirmText: "放弃上传"
          }).then(res => {
            if (res.confirm) {} else if (res.cancel) {
              process()
            }
          })
        } else {
          process()
        }

        function process() {
          var tempFilePaths = res.tempFiles
          var tooLarge = 0
          tempFilePaths.forEach((element, index, array) => {
            if (element.size > 52428000) {
              tooLarge++;
              tempFilePaths.splice(index, 1, )
            } else {
              element.path = element.tempFilePath
              element.name = `Media_${new Date().getTime()}`
              element.type = element.fileType
            }
          })
          that.setData({
            tempFiles: that.data.tempFiles.concat(tempFilePaths),
            edited: true
          })
          if (tooLarge != 0) {
            wx.showModal({
              title: "警告",
              content: `${tooLarge}个文件超过最大上传大小（50MiB），将不会被上传`,
              confirmColor: that.data.primaryColor,
              showCancel: false,
            })
          }
        }
      }
    })
  },

  deleteTempFile(index) {
    let array = this.data.tempFiles
    array.splice(index, 1, )
    this.setData({
      tempFiles: array
    })
  },

  deleteFile(index) {
    var that = this
    const _ = wx.cloud.database().command
    wx.showModal({
      title: "警告",
      content: "将同时从云端移除文件，该过程不可逆转，是否继续操作",
      confirmText: "仍然继续",
      confirmColor: "#ff5252",
    }).then(res => {
      if (res.confirm) {
        async function process() {
          try {
            var fileID = that.data.files[index].fileID;
            wx.showLoading({
              title: '正在删除文件',
              mask: true
            })
            await wx.cloud.deleteFile({
              fileList: [fileID]
            })
            //数据库移除
            wx.showLoading({
              title: '正在修改数据',
              mask: true
            })
            if (!that.data.id && that.data.id != 0) {
              console.log("noID")
              await wx.cloud.database().collection('note').doc(app.globalData.id).get()
                .then(res => {
                  that.data.id = res.data.note.length - 1
                })
            }
            await wx.cloud.database().collection('note').doc(app.globalData.id).update({
              data: {
                [`note.${that.data.id}.files`]: _.pull({
                  fileID: fileID
                })
              }
            })
            //前端移除
            let array = that.data.files
            array.splice(index, 1, )
            that.setData({
              files: array
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
  },

  fileAction(e) {
    let index = e.currentTarget.dataset.index
    const pattern = /.*.(doc|docx|xls|xlsx|ppt|pptx|pdf)$/g
    if (pattern.test(this.data.files[index].name) || this.data.files[index].type == 'image' || this.data.files[index].type == 'video') {
      pattern.lastIndex = 0; //巨坑
      var list = ['下载到本地', '删除', '预览']
    } else {
      pattern.lastIndex = 0; //巨坑
      var list = ['下载到本地', '删除']
    }
    wx.showActionSheet({
      itemList: list,
    }).then(res => {
      if (res.tapIndex == 0) {
        this.downloadFile(index)
      } else if (res.tapIndex == 1) {
        this.deleteFile(index)
      } else if (res.tapIndex == 2) {
        this.previewFile(index)
      }
    }).catch(err => {})
  },

  previewFile(index) {
    const pattern = /.*.(doc|docx|xls|xlsx|ppt|pptx|pdf)$/g
    if (pattern.test(this.data.files[index].name)) {
      pattern.lastIndex = 0; //巨坑
      wx.showLoading({
        title: '正在下载文件',
        mask: true
      })
      wx.cloud.downloadFile({
        fileID: this.data.files[index].fileID,
      }).then(res => {
        console.log("download finished")
        console.log(res.tempFilePath)
        let filePath = res.tempFilePath
        wx.hideLoading()
        wx.openDocument({
          filePath,
          showMenu: true,
        })
      })
    } else if (this.data.files[index].type == 'image') {
      pattern.lastIndex = 0; //巨坑
      // console.log(this.data.files[index].src)
      wx.previewImage({
        urls: [this.data.files[index].src],
      })
    } else if (this.data.files[index].type == 'video') {
      pattern.lastIndex = 0; //巨坑
      wx.showLoading({
        title: '正在下载文件',
        mask: true
      })
      wx.cloud.downloadFile({
        fileID: this.data.files[index].fileID,
      }).then(res => {
        console.log("download finished")
        wx.hideLoading()
        wx.previewMedia({
          sources: [{
            url: res.tempFilePath,
            type: 'video'
          }],
        })
      })
    } else {
      pattern.lastIndex = 0; //巨坑
      this.showSnackbar("暂不支持此类文件预览")
    }
  },

  downloadFile(index) {
    var that = this
    wx.showLoading({
      title: '正在下载文件',
      mask: true,
    })
    wx.cloud.downloadFile({
      fileID: this.data.files[index].fileID
    }).then(res => {
      let tempFilePath = res.tempFilePath
      let filePath = wx.env.USER_DATA_PATH + '/' + that.data.files[index].name + '.jpg'
      wx.getFileSystemManager().saveFile({
        tempFilePath,
        filePath,
        success(res) {
          wx.saveImageToPhotosAlbum({
            filePath: savePath,
            success: res => {
              wx.setClipboardData({
                data: that.data.files[index].name,
              })
              wx.showModal({
                title: "保存成功",
                showCancel: false,
                content: "文件已保存至sdcard/Pitcure/WeiXin下。原文件名已复制到剪贴板，手动重命名更改.jpg后缀即可",
                confirmColor: that.data.primaryColor,
              })
            }
          })
        }
      })
    })
  },

  tempFileAction(e) {
    let index = e.currentTarget.dataset.index
    const pattern = /.*.(doc|docx|xls|xlsx|ppt|pptx|pdf)$/g
    if (pattern.test(this.data.tempFiles[index].name) || this.data.tempFiles[index].type == 'image' || this.data.tempFiles[index].type == 'video') {
      pattern.lastIndex = 0; //巨坑
      var list = ['下载到本地', '删除', '预览']
    } else {
      pattern.lastIndex = 0; //巨坑
      var list = ['下载到本地', '删除']
    }
    wx.showActionSheet({
      itemList: list,
    }).then(res => {
      if (res.tapIndex == 0) {
        this.downloadTempFile(index)
      } else if (res.tapIndex == 1) {
        this.deleteTempFile(index)
      } else if (res.tapIndex == 2) {
        this.previewTempFile(index)
      }
    }).catch(err => {})
  },

  previewTempFile(index) {
    const pattern = /.*.(doc|docx|xls|xlsx|ppt|pptx|pdf)$/g
    if (pattern.test(this.data.tempFiles[index].name)) {
      pattern.lastIndex = 0; //巨坑
      wx.openDocument({
        filePath: this.data.tempFiles[index].path,
        showMenu: true,
      })
    } else if (this.data.tempFiles[index].type == 'image') {
      pattern.lastIndex = 0; //巨坑
      console.log(this.data.tempFiles[index].path)
      wx.previewImage({
        urls: [this.data.tempFiles[index].path],
      })
    } else if (this.data.tempFiles[index].type == 'video') {
      pattern.lastIndex = 0; //巨坑
      console.log(this.data.tempFiles[index].path)
      wx.previewMedia({
        sources: [{
          url: this.data.tempFiles[index].path,
          type: 'video'
        }],
      })
    } else {
      pattern.lastIndex = 0; //巨坑
      this.showSnackbar("暂不支持此类文件预览")
    }
  },

  downloadTempFile(index) {
    var that = this
    let tempFilePath = this.data.tempFiles[index].path
    wx.showLoading({
      title: '正在下载文件',
      mask: true,
    })
    let savePath = wx.env.USER_DATA_PATH + '/' + that.data.tempFiles[index].name + '.jpg'
    wx.getFileSystemManager().saveFile({
      tempFilePath,
      filePath: savePath,
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: savePath,
          success: res => {
            wx.setClipboardData({
              data: that.data.tempFiles[index].name,
            })
            wx.showModal({
              title: "保存成功",
              showCancel: false,
              content: "文件已保存至sdcard/Pitcure/WeiXin下。原文件名已复制到剪贴板，手动重命名更改.jpg后缀即可",
              confirmColor: that.data.primaryColor,
            })
          }
        })
      }
    })
  },

  addImg() {
    var that = this
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
            mask: true
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
      urls.push(element.src)
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
              mask: true
            })
            await wx.cloud.deleteFile({
              fileList: [fileID]
            })
            //数据库移除
            wx.showLoading({
              title: '正在修改数据',
              mask: true
            })
            if (!that.data.id) {
              await wx.cloud.database().collection('note').doc(app.globalData.id).get()
                .then(res => {
                  // console.log(res)
                  that.data.id = res.data.note.length - 1
                })
            }
            await wx.cloud.database().collection('note').doc(app.globalData.id).update({
              data: {
                [`note.${that.data.id}.gallery`]: _.pull({
                  fileID: fileID
                })
              }
            })

            //如果是混排图片
            let array = that.data.galleryDetail
            let index = e.currentTarget.dataset.index
            if (array[index].fromContent && !that.data.contentDelta) {
              let delta = that.data.contentDelta
              delta.ops.forEach((element, innerIndex) => {
                if (element.attributes && element.attributes['data-custom']) {
                  const pattern = /timestamp=(\d{13})/g;
                  let text = element.attributes['data-custom']
                  if (pattern.test(text)) {
                    pattern.lastIndex = 0; //巨坑
                    let matches = pattern.exec(text)
                    pattern.lastIndex = 0; //巨坑
                    if (matches[1] == array[index].timestamp) {
                      console.log("删除了" + innerIndex)
                      delta.ops.splice(innerIndex, 1, )
                      that.editorCtx.setContents({
                        delta,
                      })
                    }
                  } else {
                    pattern.lastIndex = 0; //巨坑
                  }
                }
              })
            }
            //前端移除
            array.splice(index, 1, );
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
    this.data.tempImgs.forEach(element => {
      urls.push(element.src)
    })
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: urls,
    })
  },

  deleteTempImg(e) {
    var that = this
    // console.log(e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index
    let array = this.data.tempImgs
    //如果是混排图片
    if (array[index].fromContent) {
      let delta = this.data.contentDelta
      delta.ops.forEach((element, innerIndex) => {
        if (element.attributes && element.attributes['data-custom']) {
          const pattern = /timestamp=(\d{13})/g;
          let text = element.attributes['data-custom']
          if (pattern.test(text)) {
            pattern.lastIndex = 0; //巨坑
            let matches = pattern.exec(text)
            pattern.lastIndex = 0; //巨坑
            if (matches[1] == array[index].timestamp) {
              console.log("删除了" + innerIndex)
              delta.ops.splice(innerIndex, 1, )
              that.editorCtx.setContents({
                delta,
              })
            }
          } else {
            pattern.lastIndex = 0; //巨坑
          }
        }
      })
    }
    array.splice(index, 1, );
    // console.log(array.length)
    this.setData({
      tempImgs: array,
      edited: true
    })
  },

  deleteTempImgByTimestamp(timestamp) {
    let array = this.data.tempImgs
    array.forEach((element, index, array) => {
      if (element.timestamp == timestamp) {
        array.splice(index, 1, )
      }
    })
    this.setData({
      tempImgs: array,
      edited: true,
    })
  },

  deleteImgByTimestamp(timestamp) {
    var that = this
    let array = this.data.galleryDetail
    array.forEach((element, index, array) => {
      if (element.timestamp == timestamp) {
        async function process() {
          wx.showLoading({
            title: '操作进行中',
            mask: true
          })
          await wx.cloud.deleteFile({
            fileList: [element.fileID]
          })
          if (!that.data.id) {
            await wx.cloud.database().collection('note').doc(app.globalData.id).get()
              .then(res => {
                console.log(res)
                that.data.id = res.data.note.length - 1
              })
          }
          await wx.cloud.database().collection('note').doc(app.globalData.id).update({
            data: {
              [`note.${that.data.id}.gallery`]: _.pull({
                fileID: element.fileID
              })
            }
          })
          array.splice(index, 1, )
          wx.showToast({
            title: "操作成功",
          })
          that.setData({
            galleryDetail: array,
            edited: true,
          })
        }
        process()
      }
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
    var that = this
    console.log(e)
    this.setData({
      contentNum: e.detail.text.length - 1,
      content: e.detail.text,
      contentDelta: e.detail.delta,
      contentHtml: e.detail.html
    })
    //缓存内容
    if (this.data.useMarkdown) {
      this.data.temp = e.detail.text
    } else {
      this.previewEditorCtx.setContents({
        delta: e.detail.delta,
      })
    }
    //处理Markdown预览
    if (this.data.useMarkdown && this.data.markdownPreview) {
      if (this.data.timer) {
        clearTimeout(this.data.timer);
        this.data.timer = setTimeout(() => {
          this.setData({
            md: e.detail.text
          })
        }, this.data.markdownPreviewDelay * 1000);
      } else {
        this.data.timer = setTimeout(() => {
          this.setData({
            md: e.detail.text
          })
        }, this.data.markdownPreviewDelay * 1000);
      }
    }
    //处理图片增删
    const pattern = /timestamp=(\d{13})/g;
    let imgTimestamps = []
    e.detail.delta.ops.forEach(element => {
      // console.log(element.attributes['data-custom'], pattern.test(element.attributes['data-custom']))
      if (element.attributes && element.attributes['data-custom']) {
        let text = element.attributes['data-custom']
        if (pattern.test(text)) {
          pattern.lastIndex = 0; //巨坑
          let matches = pattern.exec(text)
          pattern.lastIndex = 0; //巨坑
          imgTimestamps.push(matches[1])
        } else {
          pattern.lastIndex = 0; //巨坑
        }
      }
    })
    imgTimestamps.sort((a, b) => {
      return a - b
    })
    if (imgTimestamps.length > this.data.imgTimestamps.length) {
      console.log("增加")
    } else if (imgTimestamps.length < this.data.imgTimestamps.length) {
      console.log("删除")
      let del = this.data.imgTimestamps[this.data.imgTimestamps.length - 1]
      for (let i = 0; i < imgTimestamps.length; i++) {
        if (imgTimestamps[i] != this.data.imgTimestamps[i]) {
          del = this.data.imgTimestamps[i];
          break;
        }
      }
      // console.log(del)
      this.deleteTempImgByTimestamp(del)
      this.deleteImgByTimestamp(del)
    } else {

    }
    this.setData({
      imgTimestamps,
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
      })
    }
  },

  pick(e) {
    console.log(e);
    if (e.detail.disabled) {
      this.showSnackbar("请先启用编辑")
    } else {
      console.log("Pick编辑")
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
      if (e.currentTarget.dataset.id == "shareCardTheme") {
        this.setData({
          shareCardTheme: e.detail.valueKey
        })
        if (e.detail.valueKey == 0) {
          this.setData({
            shareCardColor: app.globalData.systemInfo.theme == 'dark' ? 'rgb(48, 54, 56)' : 'rgb(255, 255, 255)',
            shareCardBackgroundColor: app.globalData.systemInfo.theme == 'dark' ? 'rgb(34, 36, 38)' : 'rgb(241, 241, 241)',
          })
        } else if (e.detail.valueKey == 1) {
          this.setData({
            shareCardColor: 'rgb(255, 255, 255)',
            shareCardBackgroundColor: 'rgb(241, 241, 241)',
          })
        } else if (e.detail.valueKey == 2) {
          this.setData({
            shareCardColor: 'rgb(48, 54, 56)',
            shareCardBackgroundColor: 'rgb(34, 36, 38)',

          })
        }
      }
    }
  },

  switch (e) {
    console.log(e);
    if (e.detail.disabled) {
      this.showSnackbar("请先启用编辑")
    } else {
      console.log("Switch编辑")
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
      console.log("Input编辑")
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
    this.setData({
      headbarStyle: "background: rgba(0, 0, 0, 0);",
    })
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

  mainToUpper() {
    if (this.data.theme == 'light') {
      this.setData({
        headbarStyle: "background:#fff;box-shadow: 0 0rpx 10rpx #bbb;",
        onPreview: false,
      })
    } else if (this.data.theme == 'dark') {
      this.setData({
        headbarStyle: "background:#303638;box-shadow: 0 0rpx 10rpx #222;",
        onPreview: false,
      })
    }
  },

  mainScroll() {
    this.setData({
      onPreview: false
    })
  },

  mainToLower() {
    this.setData({
      headbarStyle: "background: rgba(0, 0, 0, 0);",
      onPreview: true,
    })
  },


  floatTap() {
    if (this.data.onPreview) {
      console.log("previewing")
      this.previewRefresh()
    } else {
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
      //初始化编辑器内容
      if (that.data.contentDelta) {
        let delta = that.data.contentDelta
        const pattern = /timestamp=(\d{13})/g;
        delta.ops.forEach(element => {
          if (element.attributes && element.attributes['data-custom']) {
            let text = element.attributes['data-custom']
            if (pattern.test(text)) {
              pattern.lastIndex = 0; //巨坑
              let matches = pattern.exec(text)
              pattern.lastIndex = 0; //巨坑
              that.data.galleryDetail.forEach(innerElement => {
                if (matches[1] == innerElement.timestamp) {
                  element.insert.image = innerElement.src
                }
              })
            }
          }
        })
        that.editorCtx.setContents({
          delta,
        })
        setTimeout(() => {
          that.setData({
            edited: false
          })
        }, 200);
      }
    }).exec()
  },
  onPreviewEditorReady() {
    var that = this
    wx.createSelectorQuery().select('#previewEditor').context(function (res) {
      that.previewEditorCtx = res.context
      if (that.data.contentDelta) {
        that.previewEditorCtx.setContents({
          delta: that.data.contentDelta,
        })
      }
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
    console.log("富文本编辑器编辑")
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
    console.log("分割线编辑")
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
        console.log(res)
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
        console.log("插入图片编辑")
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
    var that = this
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
        contentDelta: res.data.contentDelta,
        gallery: res.data.gallery,
        encrypt: res.data.encrypt,
        password: res.data.password,
        useMarkdown: res.data.useMarkdown,
        category: res.data.category,
        timestamp: res.data.timestamp,
        imgTimestamps: res.data.imgTimestamps,
        headingNum: res.data.heading == null ? 0 : res.data.heading.length,
        contentNum: res.data.content == null ? 0 : res.data.content.length,
        md: res.data.content,
        timestamp: res.data.timestamp,
        time: time.formatChsTime(new Date(res.data.timestamp)),
      })
      //图片预处理
      let gallery = res.data.gallery
      database.idToUrl(gallery).then(
        this.setData({
          galleryDetail: gallery
        })
      )
      //文件预处理
      let files = res.data.files
      database.idToUrl(files).then(
        this.setData({
          files,
        })
      )
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