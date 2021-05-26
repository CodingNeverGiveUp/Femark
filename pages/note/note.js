// pages/note/note.js
// 获取应用实例
const app = getApp()
const database = require("../../utils/database.js")
const event = require("../../utils/event.js")
const time = require("../../utils/util.js")
const _ = wx.cloud.database().command
// var plugin = requirePlugin("WechatSI")
// const manager = plugin.getRecordRecognitionManager()
const recordManager = wx.getRecorderManager();
let plugin = requirePlugin("QCloudAIVoice");
plugin.setQCloudSecret(1305453934, 'AKIDf8KFuIODm56qJWS7VLvEGaiaDahY9UaQ', 'cy95lBLHxNXS7WfYDcleHfnfHelbCYeU', true); //设置腾讯云账号信息，其中appid是数字，secret是字符串，openConsole是布尔值(true/false)，为控制台打印日志开关
let innerAudioContext = wx.createInnerAudioContext()
let speechRecognizerManager = plugin.speechRecognizerManager();
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
    files: [],
    voices: [],
    tempImgs: [],
    tempFiles: [],
    tempVoices: [],
    imgTimestamps: [],
    category: 0,
    useMarkdown: app.globalData.markdownByDefault,
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
    //语音识别
    popupRecord: false,
    popupRecordIf: false,
    uploadVideo: app.globalData.saveRecordFileByDefault,
    recordStatus: 0, //0日常/1识别/2错误
    voiceBtnBorder: `border:4px solid ${app.colorRgba(app.globalData.primaryColor, .2)};`,
    recordValue: '单击开始',
    //录音
    popupVoice: false,
    popupVoiceIf: false,
    voiceStatus: 0, //0日常1录制2暂停
    recordBtnBorder: `border:4px solid ${app.colorRgba(app.globalData.primaryColor, .2)};
    `,
    uploadVoice: false,
    //计时器
    hours: '0' + 0, // 时
    minute: '0' + 0, // 分
    second: '0' + 0 // 秒
  },

  //音频操作栏
  voiceAction(e) {
    let index = e.currentTarget.dataset.index
    wx.showActionSheet({
      itemList: ['移除', '下载到本地'],
    }).then(res => {
      if (res.tapIndex == 0) {
        this.deleteVoice(index)
      } else if (res.tapIndex == 1) {
        this.downloadVoice(index)
      }
    })
  },

  downloadVoice(index) {
    var that = this
    wx.showLoading({
      title: '正在下载文件',
      mask: true,
    })
    wx.cloud.downloadFile({
      fileID: this.data.voices[index].fileID
    }).then(res => {
      let tempFilePath = res.tempFilePath
      let filePath = wx.env.USER_DATA_PATH + '/' + that.data.voices[index].name + '.jpg'
      wx.getFileSystemManager().saveFile({
        tempFilePath,
        filePath,
        success(res) {
          wx.saveImageToPhotosAlbum({
            filePath: filePath,
            success: res => {
              wx.setClipboardData({
                data: that.data.voices[index].name,
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

  deleteVoice(index) {
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
            var fileID = that.data.voices[index].fileID;
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
                [`note.${that.data.id}.voices`]: _.pull({
                  fileID: fileID
                })
              }
            })
            //前端移除
            let array = that.data.voices
            array.splice(index, 1, )
            that.setData({
              voices: array
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

  previewVoice(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index
    this.setData({
      playingIndex: index
    })
    innerAudioContext.src = this.data.voices[index].fileID
    if (this.data.voices[index].playingTime == null) {
      setTimeout(() => {
        innerAudioContext.play()
      }, 10)
    } else {
      innerAudioContext.pause()
    }
  },

  //临时音频操作栏
  tempVoiceAction(e) {
    let index = e.currentTarget.dataset.index
    wx.showActionSheet({
      itemList: ['移除', '下载到本地'],
    }).then(res => {
      if (res.tapIndex == 0) {
        let array = this.data.tempVoices
        array.splice(index, 1, )
        this.setData({
          tempVoices: array
        })
      } else if (res.tapIndex == 1) {
        this.downloadTempVoice(index)
      }
    })
  },

  downloadTempVoice(index) {
    var that = this
    let tempFilePath = this.data.tempVoices[index].tempFilePath
    wx.showLoading({
      title: '正在下载文件',
      mask: true,
    })
    let savePath = wx.env.USER_DATA_PATH + '/' + that.data.tempVoices[index].name + '.jpg'
    wx.getFileSystemManager().saveFile({
      tempFilePath,
      filePath: savePath,
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: savePath,
          success: res => {
            wx.setClipboardData({
              data: that.data.tempVoices[index].name,
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

  previewTempVoice(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index
    this.setData({
      tempPlayingIndex: index
    })
    innerAudioContext.src = this.data.tempVoices[index].tempFilePath

    if (this.data.tempVoices[index].playingTime == null) {
      setTimeout(() => {
        innerAudioContext.play()
      }, 10)
    } else {
      innerAudioContext.pause()
    }
  },


  voiAction() {
    if (!this.data.edit) {
      this.showSnackbar("请先启用编辑")
    } else {
      wx.showActionSheet({
        itemList: ['语音识别', '录音'],
      }).then(res => {
        if (res.tapIndex == 0) {
          this.popupRecord()
        } else if (res.tapIndex == 1) {
          this.popupVoice()
        }
      })
    }
  },
  //计时器
  setTimer: function () {
    const that = this
    var second = that.data.second
    var minute = that.data.minute
    var hours = that.data.hours
    this.recordTimer = setInterval(function () { // 设置定时器
      second++
      if (second >= 60) {
        second = 0 //  大于等于60秒归零
        minute++
        if (minute >= 60) {
          minute = 0 //  大于等于60分归零
          hours++
          if (hours < 10) {
            // 少于10补零
            that.setData({
              hours: '0' + hours
            })
          } else {
            that.setData({
              hours: hours
            })
          }
        }
        if (minute < 10) {
          // 少于10补零
          that.setData({
            minute: '0' + minute
          })
        } else {
          that.setData({
            minute: minute
          })
        }
      }
      if (second < 10) {
        // 少于10补零
        that.setData({
          second: '0' + second
        })
      } else {
        that.setData({
          second: second
        })
      }
    }, 1000)
  },

  //录音
  voiceSwitch() {
    if (this.data.voiceStatus == 0) {
      this.startRecord()
      this.setTimer()
      this.timer = setInterval(() => {
        this.setData({
          recordBtnBorder: `border:10px solid ${app.colorRgba('#ff5252',.2)};`
        })
        setTimeout(() => {
          this.setData({
            recordBtnBorder: `border:4px solid ${app.colorRgba('#ff5252',.2)};`
          })
        }, 200);
      }, 800)
    } else if (this.data.voiceStatus == 1) {
      this.pauseRecord()
      clearInterval(this.timer)
      clearInterval(this.recordTimer)
      this.setData({
        recordBtnBorder: `border:4px solid ${this.data.rgbaPrimaryColor};`
      })
    } else if (this.data.voiceStatus == 2) {
      this.setTimer()
      this.resumeRecord()
      this.timer = setInterval(() => {
        this.setData({
          recordBtnBorder: `border:10px solid ${app.colorRgba('#ff5252',.2)};`
        })
        setTimeout(() => {
          this.setData({
            recordBtnBorder: `border:4px solid ${app.colorRgba('#ff5252',.2)};`
          })
        }, 200);
      }, 800)
    }
  },

  startRecord() {
    this.setData({
      voiceStatus: 1,
    })
    recordManager.start()
  },
  pauseRecord() {
    this.setData({
      voiceStatus: 2,
    })
    recordManager.pause()
  },
  resumeRecord() {
    this.setData({
      voiceStatus: 1,
    })
    recordManager.resume()
  },
  stopRecord() {
    if (this.data.voiceStatus == 2) {
      this.setData({
        uploadVoice: true,
        edited: true
      })
      clearInterval(this.timer)
      clearInterval(this.recordTimer)
      this.setData({
        hours: '0' + 0, // 时
        minute: '0' + 0, // 分
        second: '0' + 0 // 秒
      })
      recordManager.stop()
      wx.showToast({
        title: '已保存至媒体库',
      })
    }
  },

  deleteRecord() {
    if (this.data.voiceStatus == 2) {
      clearInterval(this.timer)
      clearInterval(this.recordTimer)
      this.setData({
        hours: '0' + 0, // 时
        minute: '0' + 0, // 分
        second: '0' + 0 // 秒
      })
      recordManager.stop(false)
      setTimeout(() => {
        this.setData({
          voiceStatus: 0,
        })
      }, 200);
    }
  },

  //语音识别

  voiceFocus() {
    this.setData({
      voiceInput: true
    })
  },

  voiceBlur() {
    this.setData({
      voiceInput: false
    })
  },

  voiceInput(e) {
    this.setData({
      recordValue: e.detail.value
    })
  },

  videoSwitch() {
    this.setData({
      uploadVideo: this.data.uploadVideo ? false : true,
    })
  },

  popupRecord() {
    this.setData({
      popupRecordIf: true,
    })
    setTimeout(() => {
      this.setData({
        popupRecord: true,
      })
    }, 100)
  },

  popupVoice() {
    this.setData({
      popupVoiceIf: true,
    })
    setTimeout(() => {
      this.setData({
        popupVoice: true,
      })
    }, 100)
  },

  deleteContainer() {
    this.stopRecord()
    this.stopSpeechRecognize()
    setTimeout(() => {
      this.setData({
        popupRecordIf: false,
        popupVoiceIf: false,
      })
    }, 100);
  },
  recordSwitch() {
    if (this.data.recordStatus == 1) {
      this.stopSpeechRecognize()
    } else if (this.data.recordStatus == 3) {} else {
      this.startSpeechRecognize()
    }
  },

  startSpeechRecognize() {
    // this.speechRecognizerManager = plugin.speechRecognizerManager();
    switch (app.globalData.recordLanguage) {
      case 0:
        var lang = '16k_zh'
        break;
      case 1:
        var lang = '16k_en'
        break;
      case 2:
        var lang = '16k_ca'
        break;
      case 3:
        var lang = '16k_ko'
        break;
      case 4:
        var lang = '16k_zh-TW'
        break;
      case 5:
        var lang = '16k_ja'
        break;
      default:
        var lang = '16k_zh'
        break;
    }
    let params = {
      signCallback: null, // 鉴权函数
      // 用户参数
      secretkey: 'cy95lBLHxNXS7WfYDcleHfnfHelbCYeU',
      secretid: 'AKIDf8KFuIODm56qJWS7VLvEGaiaDahY9UaQ',
      appid: '1305453934',
      // 录音参数
      duration: 10000,
      frameSize: 0.32, //单位:k

      // 实时识别接口参数
      engine_model_type: lang,
      // 以下为非必填参数，可跟据业务自行修改
      // hotword_id : '08003a00000000000000000000000000',
      // needvad: 0,
      filter_dirty: 2,
      filter_modal: 2,
      filter_punc: 0,
      convert_num_mode: 1,
      // word_info: 2,
      // vad_silence_time: 200
    };
    speechRecognizerManager.start(params);
    this.setData({
      recordStatus: 3,
      recordValue: '启动中',
    })
  },

  stopSpeechRecognize() {
    // this.speechRecognizerManager = plugin.speechRecognizerManager();
    speechRecognizerManager.stop();
  },

  recordConfirm() {
    var that = this
    let content = this.data.recordValue
    if (content != '' && content != '单击开始' && content != '试着说点什么' && content != '请提高音量' && content != '识别失败') {
      wx.showModal({
        title: "是否创建笔记？"
      }).then(res => {
        if (res.confirm) {
          let array = this.data.contentDelta.ops
          array.push({
            insert: content + '\n'
          })
          this.setData({
            ['contentDelta.ops']: array,
            edited: true
          })
          that.editorCtx.setContents({
            delta: that.data.contentDelta,
          })
        }
      })
    }
  },

  // touchdown_plugin: function () {
  //   var _this = this
  //   wx.showToast({
  //     title: '正在倾听...',
  //   })
  //   manager.start({ //开始识别
  //     duration: 30000, //30s最长时间  最大60s
  //     lang: "zh_CN"
  //   })
  // },

  // //手指松开 
  // touchup_plugin: function (e) {
  //   // var searchType = e.currentTarget.dataset.type;
  //   // this.setData({
  //   //   searchType: searchType,
  //   // });
  //   manager.stop(); //结束识别
  //   wx.showToast({
  //     title: '正在识别……',
  //     icon: 'loading',
  //     duration: 2000
  //   })
  // },

  //ocr
  startOcr() {
    let that = this
    if (!this.data.edit) {
      this.showSnackbar("请先启用编辑")
    } else {
      wx.showModal({
        title: "注意",
        content: "是否启动图片文字提取（OCR）",
        confirmColor: that.data.primaryColor,
      }).then(res => {
        if (res.confirm) {
          wx.chooseImage({
            success: res => {
              wx.showLoading({
                title: '正在提取内容',
              })
              var filepath = res.tempFilePaths[0]
              let filebuffer = wx.getFileSystemManager().readFileSync(filepath)
              // console.log(filebuffer)
              wx.cloud.callFunction({
                  name: "ocr",
                  data: {
                    buffer: filebuffer
                  }
                })
                .then(res => {
                  wx.showToast({
                    title: '已提取文字',
                  })
                  console.log(res)
                  let text = ""
                  let data = res.result.result.items
                  data.forEach(element => {
                    text += element.text + '\n'
                  })
                  this.setData({
                    contentDelta: this.data.contentDelta.ops.concat({
                      insert: text
                    })
                  })
                  that.editorCtx.setContents({
                    delta: that.data.contentDelta,
                  })

                  // that.setData({
                  //   res
                  // })
                }).catch(err => {
                  wx.showToast({
                    title: '网络错误',
                    icon: "error"
                  })
                  console.log(err)
                })
            }
          })
        }
      })
    }
  },

  shareAction() {
    wx.showActionSheet({
      itemList: ['以卡片形式分享', '复制内容到剪贴板'],
    }).then(res => {
      if (res.tapIndex == 0) {
        this.toSharePage()
      } else if (res.tapIndex == 1) {
        wx.setClipboardData({
          data: this.data.content
        }).then(res => {
          wx.hideToast()
          this.showSnackbar('已复制内容到剪贴板')
        }).catch(err => {
          this.showSnackbar('内容为空')
        })
      }
    })
  },


  //转到分享
  toSharePage() {
    // console.log(this.data.shareCardTheme,typeof(this.data.shareCardTheme))
    let elementm = {
      newShare: true,
      heading: this.data.heading,
      shareCardTheme: this.data.shareCardTheme == 0 ? this.data.theme == 'light' ? 1 : 2 : this.data.shareCardTheme,
      shareCardColor: this.data.shareCardColor,
      shareCardBackgroundColor: this.data.shareCardBackgroundColor,
      useMarkdown: app.globalData.markdownByDefault,
      time: this.data.time,
      nickName: app.globalData.userInfo.nickName,
      md: this.data.md,
    }
    let elementd = {
      newShare: true,
      heading: this.data.heading,
      shareCardTheme: this.data.shareCardTheme == 0 ? this.data.theme == 'light' ? 1 : 2 : this.data.shareCardTheme,
      shareCardColor: this.data.shareCardColor,
      shareCardBackgroundColor: this.data.shareCardBackgroundColor,
      useMarkdown: app.globalData.markdownByDefault,
      time: this.data.time,
      nickName: app.globalData.userInfo.nickName,
      delta: this.data.contentDelta,
    }
    let textm = JSON.stringify(elementm)
    let textmr = textm.replace(/=/g, '@@')
    let textmrr = textmr.replace(/&/g, '~~')
    let textd = JSON.stringify(elementd)
    let textdr = textd.replace(/=/g, '@@')
    let textdrr = textdr.replace(/&/g, '~~')
    console.log(textdr)
    if (this.data.useMarkdown) {
      wx.navigateTo({
        // url: `/pages/sharePage/sharePage?new=true&heading=${heading}&time=${time}&shareCardTheme=${shareCardTheme}&shareCardColor=${shareCardColor}&shareCardBackgroundColor=${shareCardBackgroundColor}&useMarkdown=${useMarkdown}&md=${md}`,
        url: `/pages/sharePage/sharePage?json=${textmrr}`,
      })
    } else {
      wx.navigateTo({
        // url: `/pages/sharePage/sharePage?new=true&heading=${heading}&time=${time}&shareCardTheme=${shareCardTheme}&shareCardColor=${shareCardColor}&shareCardBackgroundColor=${shareCardBackgroundColor}&useMarkdown=${useMarkdown}&delta=${delta}`,
        url: `/pages/sharePage/sharePage?json=${textdrr}`,
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
          let voices = this.data.tempVoices
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
              if (voices.length != 0) {
                await database.uploadVoice(voices)
                // await database.idToUrl(voices)
                that.setData({
                  voices: that.data.voices.concat(voices),
                })
              }
              let object = {
                heading: that.data.heading,
                content: that.data.content,
                contentDelta: that.data.contentDelta,
                gallery: imgs,
                files: files,
                voices: voices,
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
              tempVoices: [],
            })
            // console.log(imgs.IDs)
          }
          process()
        } else {
          //修改
          console.log("edit")
          let imgs = this.data.tempImgs
          let files = this.data.tempFiles
          let voices = this.data.tempVoices
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
              if (voices.length != 0) {
                await database.uploadVoice(voices)
                // await database.idToUrl(files)
                await wx.cloud.database().collection('note').doc(app.globalData.id).update({
                  data: {
                    [`note.${that.data.id}.voices`]: _.push(voices)
                  }
                })
                that.setData({
                  voices: that.data.voices.concat(voices)
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
              tempVoices: [],
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
            filePath: filePath,
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

  contentFocus(e) {
    // this.editorCtx.scrollIntoView()
    this.setData({
      contentNumStyle: `color:${this.data.primaryColor};`,
      contentNum: e.detail.text.length - 1,
      content: e.detail.text,
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
      edited: true
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
    // console.log(e.currentTarget.dataset.id)
    if (e.detail.disabled) {
      this.showSnackbar("请先启用编辑")
      // console.log("Input编辑")
      // this.setData({
      //   edited: true,
      // })
    }
    if (e.currentTarget.dataset.id == 'password') {
      this.setData({
        password: e.detail.value,
        edited: true,
      })
    }
  },

  toUpper() {
    this.setData({
      headbarStyle: "background: rgba(0, 0, 0, 0);",
    })
  },

  scroll(e) {
    let num = e.detail.scrollTop
    if (num < 20) {
      this.setData({
        headbarStyle: "background: rgba(0, 0, 0, 0);",
      })
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

  mainScroll(e) {
    // console.log(e.detail.scrollLeft)
    let screenWidth = app.globalData.systemInfo.screenWidth
    let num = e.detail.scrollLeft / (e.detail.scrollWidth - screenWidth)
    if (num < 0.2) {
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
    } else if (num > 0.8) {
      this.setData({
        onPreview: true,
        headbarStyle: ""
      })
    } else {
      this.setData({
        onPreview: false,
        headbarStyle: ""
      })
    }
    // this.setData({
    //   onPreview: false
    // })
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
      console.log(res)
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
      useMarkdown: app.globalData.markdownByDefault,
      markdownPreview: app.globalData.markdownPreview,
      markdownPreviewDelay: app.globalData.markdownPreviewDelay,
      uploadVideo: app.globalData.saveRecordFileByDefault,
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
      //音频预处理
      let voices = res.data.voices
      // database.idToUrl(files).then(
      this.setData({
        voices,
      })
      // )
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
      // return
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
    //初始化语音识别
    // manager.onRecognize = function (res) { //有新的识别内容返回，则会调用此事件
    //   console.log("current result", res.result)
    // }
    // manager.onStop = function (res) { //识别结束事件
    //   console.log('识别开始');
    //   var result = res.result;
    //   console.log(res)
    //   // var s = result.indexOf('。') //找到第一次出现下划线的位置
    //   // result = result.substring(0, s) //取下划线前的字符
    //   var searchType = that.data.searchType;
    //   wx.showToast({
    //     title: '识别成功',
    //   })

    //   //console.log(result)
    //   if (result != "") {
    //     that.setData({
    //       result: result //这里的result才是最终结果
    //     })
    //   } else {
    //     wx.showToast({
    //       title: '请说话',
    //     })
    //   }
    // }
    // manager.onError = function (res) { //识别错误事件
    //   console.log('manager.onError')
    //   console.log(res) //报错信息打印
    //   wx.showToast({
    //     title: "识别出现错误",
    //   })
    // }


    //初始化语音识别
    // 开始识别
    speechRecognizerManager.OnRecognitionStart = (res) => {
      this.setData({
        recordValue: "试着说点什么",
        recordStatus: 1,
      })
      this.timer = setInterval(() => {
        this.setData({
          voiceBtnBorder: `border:10px solid ${this.data.rgbaPrimaryColor};`
        })
        setTimeout(() => {
          this.setData({
            voiceBtnBorder: `border:4px solid ${this.data.rgbaPrimaryColor};`
          })
        }, 200);
      }, 800)
      recordManager.start()
    }
    // 一句话开始
    speechRecognizerManager.OnSentenceBegin = (res) => {
      console.log('一句话开始', res)
    }
    // 识别变化时
    speechRecognizerManager.OnRecognitionResultChange = (res) => {
      console.log('识别变化时', res)
      this.setData({
        recordValue: res.voice_text_str == '' ? '请提高音量' : res.voice_text_str
      })
    }
    // 一句话结束
    speechRecognizerManager.OnSentenceEnd = (res) => {
      console.log('一句话结束', res)
    }
    // 识别结束
    speechRecognizerManager.OnRecognitionComplete = (res) => {
      console.log('识别结束', res);
      clearInterval(this.timer)
      if (this.data.recordValue == '请提高音量') {
        this.setData({
          recordValue: '单击开始'
        })
      }
      this.setData({
        voiceBtnBorder: `border:4px solid ${this.data.rgbaPrimaryColor};`,
        recordStatus: 0,
      })
      if (this.data.uploadVideo) {
        this.setData({
          uploadVoice: true,
        })
      } else {
        this.setData({
          uploadVoice: false,
        })
      }
      recordManager.stop()
    }
    // 识别错误
    speechRecognizerManager.OnError = (res) => {
      console.log(res);
      clearInterval(this.timer)
      if (this.data.recordStatus != 0) {
        this.setData({
          voiceBtnBorder: `border:4px solid ${app.colorRgba('#ff5252',.2)};`,
          recordStatus: 2,
          recordValue: '识别失败'
        })
      }
    }
    // 录音超过固定时长（最长10分钟）时回调
    speechRecognizerManager.OnRecorderStop = () => {
      console.log('超过录音时长');
      this.setData({
        recordStatus: 0,
        recordValue: '请重新录音'
      })
    }
    //取得录音文件


    //初始化录音
    recordManager.onStart(res => {
      console.log("start record")
    })
    recordManager.onError()
    recordManager.onStop(res => {
      console.log(res)
      if (this.data.uploadVoice) {
        let array = this.data.tempVoices
        array.push({
          tempFilePath: res.tempFilePath,
          name: 'Record_' + new Date().getTime(),
          duration: res.duration
        })
        this.setData({
          tempVoices: array
        })
      }
      this.setData({
        voiceStatus: 0,
        uploadVoice: false
      })
    })
    //初始化录音播放
    innerAudioContext.onWaiting(res => {
      wx.showLoading({
        title: '正在请求',
        mask: true
      })
    })

    innerAudioContext.onPlay(res => {
      wx.hideLoading()
    })

    innerAudioContext.onEnded(res => {
      wx.hideLoading()
      if (this.data.playingIndex != null) {
        this.setData({
          [`voices[${Number(this.data.playingIndex)}].playingTime`]: null,
        })
      } else if (this.data.tempPlayingIndex != null) {
        this.setData({
          [`tempVoices[${Number(this.data.tempPlayingIndex)}].playingTime`]: null
        })
      }
      this.setData({
        playingIndex: null,
        tempPlayingIndex: null,
      })
      innerAudioContext.stop()
    })

    innerAudioContext.onPause(res => {
      if (this.data.playingIndex != null) {
        this.setData({
          [`voices[${Number(this.data.playingIndex)}].playingTime`]: null
        })
      } else if (this.data.tempPlayingIndex != null) {
        this.setData({
          [`tempVoices[${Number(this.data.tempPlayingIndex)}].playingTime`]: null
        })
      }
    })

    innerAudioContext.onTimeUpdate(res => {
      wx.hideLoading()

      function Zero(num) {
        if (num >= 0 && num < 10) {
          return `0${num}`
        }
      }
      if (this.data.playingIndex != null) {
        console.log("playingMain")
        this.setData({
          [`voices[${Number(this.data.playingIndex)}].playingTime`]: `${Zero(Math.floor(innerAudioContext.currentTime / 60))}:${Zero(Math.floor(innerAudioContext.currentTime % 60))}/${Zero(Math.floor(innerAudioContext.duration / 60))}:${Zero(Math.floor(innerAudioContext.duration % 60))}`
        })
      } else if (this.data.tempPlayingIndex != null) {
        console.log("playingTemp")
        this.setData({
          [`tempVoices[${Number(this.data.tempPlayingIndex)}].playingTime`]: `${Zero(Math.floor(innerAudioContext.currentTime / 60))}:${Zero(Math.floor(innerAudioContext.currentTime % 60))}/${Zero(Math.floor(innerAudioContext.duration / 60))}:${Zero(Math.floor(innerAudioContext.duration % 60))}`
        })
      }
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