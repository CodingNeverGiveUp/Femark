// index.js
// 获取应用实例
const app = getApp()
const database = require("../../utils/database.js")
const event = require("../../utils/event.js")
let plugin = requirePlugin("QCloudAIVoice");
plugin.setQCloudSecret(1305453934, 'AKIDf8KFuIODm56qJWS7VLvEGaiaDahY9UaQ', 'cy95lBLHxNXS7WfYDcleHfnfHelbCYeU', false); //设置腾讯云账号信息，其中appid是数字，secret是字符串，openConsole是布尔值(true/false)，为控制台打印日志开关
// let speechRecognizerManager = plugin.speechRecognizerManager();
let httpSpeechRecognizerManager = plugin.getRecordRecognitionManager();
Page({
  data: {
    userInfo: {},
    note: [],
    task: [],
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    pureTheme: app.globalData.pureTheme,
    isPad: app.globalData.isPad,
    useSidebar: app.globalData.useSidebar,
    primaryColor: app.globalData.primaryColor,
    rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
    currentPage: app.globalData.currentPage,
    selectorStyle: "",
    sel1: '',

    noteLeft: [],
    noteRight: [],
  },

  startAsr(){
    console.log("触发成功")
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
    httpSpeechRecognizerManager.start({
      duration: 30000,
      engine_model_type: lang,
      // 以下为非必填参数，可跟据业务自行修改
      hotword_id: '08003a00000000000000000000000000',
      filter_dirty: 2,
      filter_modal: 2,
      filter_punc: 0,
      convert_num_mode: 1,
      // needvad = 1
    })
  },
  stopAsr(){
    console.log("触发成功")
    httpSpeechRecognizerManager.stop()
  },

  // 事件处理函数
  onLoad() {
    var tabbar = this.getTabBar();
    //HTTP语音识别
    httpSpeechRecognizerManager.onStart((res) => {
      console.log('recorder start', res.msg);
      tabbar.setData({
        recordValue: "试着说点什么",
        recordStatus: 1,
      })
      tabbar.timer = setInterval(() => {
        tabbar.setData({
          voiceBtnBorder: `border:10px solid ${tabbar.data.rgbaPrimaryColor};`
        })
        setTimeout(() => {
          tabbar.setData({
            voiceBtnBorder: `border:4px solid ${tabbar.data.rgbaPrimaryColor};`
          })
        }, 200);
      }, 800)
    })
    httpSpeechRecognizerManager.onStop((res) => {
      clearInterval(this.timer)
      console.log('recorder stop', res.tempFilePath);
      console.log(res)
      tabbar.setData({
        uploadVideoDetail: res
      })
      tabbar.setData({
        voiceBtnBorder: `border:4px solid ${this.data.rgbaPrimaryColor};`,
        recordStatus: 0,
      })
      if (tabbar.data.recordValue == '请提高音量') {
        tabbar.setData({
          recordValue: '单击开始'
        })
      }
    })
    httpSpeechRecognizerManager.onError((res) => {
      console.log('recorder error', res.errMsg);
      clearInterval(tabbar.timer)
      if (tabbar.data.recordStatus != 0) {
        tabbar.setData({
          voiceBtnBorder: `border:4px solid ${app.colorRgba('#ff5252',.2)};`,
          recordStatus: 2,
          recordValue: '识别失败'
        })
      }
    })
    httpSpeechRecognizerManager.onRecognize((res) => {
      if (res.result || res.resList) {
        console.log("current result:", res.result);
        tabbar.setData({
          recordValue: res.result == '' ? '请提高音量' : res.result
        })
      } else if (res.errMsg) {
        console.log("recognize error", res.errMsg);
      }
    })
    

    //拉取openid
    // if (app.globalData.openid) {
    //   this.setData({
    //     openid: app.globalData.openid,
    //   })
    // } else {
    //   console.log("get openid from server")
    //   wx.cloud.callFunction({
    //       name: "getOpenid"
    //     }).then(res => {
    //       // console.log(res);
    //       this.data.openid = res.result.openid;
    //       app.globalData.openid = res.result.openid;
    //     })
    //     .catch(res => {
    //       console.log("failed")
    //     })
    // };
  },

  onHide: function () {
    event.remove('Theme', this);
  },

  onReady() {
    var that = this
    this.onPullDownRefresh()
    // let test_Array01_lenth = this.data.test.test_Array01.length
    // let test_Array02_lenth = this.data.test.test_Array02.length
    // let color_number1 = 0
    // let color_number2 = 0
    // for (; color_number1 < test_Array01_lenth; color_number1++) {
    //   let color1 = getApp().getRandomColor()
    //   let str1 = 'test' + '.test_Array01' + '[' + color_number1 + ']' + '.color'
    //   this.setData({
    //     [str1]: color1
    //   })
    // }
    // for (; color_number2 < test_Array02_lenth; color_number2++) {
    //   let color2 = getApp().getRandomColor()
    //   let str2 = 'test' + '.test_Array02' + '[' + color_number2 + ']' + '.color'
    //   this.setData({
    //     [str2]: color2
    //   })
    // }
    //以下是比较两边高度
    // async function heightComparison() {
    //   function getHeight() {
    //     return new Promise((resolve, reject) => {
    //       var query = wx.createSelectorQuery()
    //       query.select('#note_left').boundingClientRect(function (res) {
    //         hw1 = Math.round(res.height)
    //       }).exec()
    //       query.select('#note_right').boundingClientRect(function (res) {
    //         hw2 = Math.round(res.height)
    //       }).exec();
    //       setTimeout(() => {
    //         resolve()
    //       }, 100)
    //     })
    //   }
    //   var hw1, hw2;
    //   await getHeight()
    //   console.log(hw1, hw2)
    //   if (hw1 <= hw2) {
    //     return true
    //   } else {
    //     return false
    //   }
    // }
  },

  onShow() {
    //主题event
    event.on('Theme', this, function (data) {
      wx.showLoading({
        title: '应用主题更改',
        mask: true
      })
      this.setData({
        theme: data
      })
      this.onPullDownRefresh()
    })
    //重新拉取侧栏
    let tabbar = this.getTabBar();
    tabbar.setData({
      useSidebar: app.globalData.useSidebar,
      primaryColor: app.globalData.primaryColor,
      rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
      uploadVideo: app.globalData.saveRecordFileByDefault,
    })
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      })
    }
    //重新拉取配置
    this.setData({
      useSidebar: app.globalData.useSidebar,
      pureTheme: app.globalData.pureTheme,
      isPad: app.globalData.isPad,
      primaryColor: app.globalData.primaryColor,
      rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
      sel1: `color:${app.globalData.primaryColor};background:${app.colorRgba(getApp().globalData.primaryColor, .2)};`,
    })
    //数据拉取
    this.setData({
      note: app.globalData.note,
      task: app.globalData.task
    })
    //侧栏状态
    this.setData({
      currentPage: app.globalData.currentPage,
    })
    tabbar.setData({
      currentPage: app.globalData.currentPage,
      btn1: `color:${this.data.primaryColor}`,
      slide: false,
      sidebarStyle: "left:-250px",
      ["sld" + app.globalData.currentPage]: `color:${this.data.primaryColor};background:var(--rgbaprimaryColor--);transition:none;`,
      ["sld" + app.globalData.formerPage]: 'transition:none;',
      sld3: 'transition:none;',
      sld4: 'transition:none;',
    })
    setTimeout(() => {
      tabbar.setData({
        ["sld" + app.globalData.currentPage]: `color:${this.data.primaryColor};background:var(--rgbaprimaryColor--);`,
        ["sld" + app.globalData.formerPage]: '',
        sld3: '',
        sld4: '',
      })
    }, 250)
    console.log("拉取")
    // if(app.globalData.currentPage == 1){
    //   tabbar.setData({
    //     sld1: `color:${this.data.primaryColor};background:var(--rgbaprimaryColor--);`,
    //     sld2: '',
    //   })
    // }
    // if(app.globalData.currentPage == 2){
    //   tabbar.setData({
    //     sld1: '',
    //     sld2: `color:${this.data.primaryColor};background:var(--rgbaprimaryColor--);`,
    //   })
    // }

  },

  onPullDownRefresh() {
    app.refresh().then(res => {
      //重新拉取侧栏
      let tabbar = this.getTabBar();
      tabbar.setData({
        useSidebar: app.globalData.useSidebar,
        primaryColor: app.globalData.primaryColor,
        rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
      })
      if (wx.getUserProfile) {
        this.setData({
          canIUseGetUserProfile: true,
        })
      }
      //重新拉取配置
      this.setData({
        useSidebar: app.globalData.useSidebar,
        pureTheme: app.globalData.pureTheme,
        primaryColor: app.globalData.primaryColor,
        rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
      })
      //数据拉取
      this.setData({
        note: app.globalData.note,
        task: app.globalData.task
      })
      console.log("整理")
      this.column()
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '数据已更新',
      })
    }).catch(err => {
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '网络错误',
        icon: "error"
      })
    })
  },

  test() {
    var currenttime = (new Date()).valueOf();
    var currentdate = new Date(currenttime);
    console.log(currenttime, currentdate)
    const db = wx.cloud.database()
    const formatNumber = n => {
      n = n.toString()
      return n[1] ? n : `0${n}`
    }
    const formatTime = date => {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = date.getHours()
      const minute = date.getMinutes()
      const second = date.getSeconds()

      return `${year}年${month}月${day}日 ${[hour, minute, second].map(formatNumber).join(':')}`
    }
    var messages = []
    db.collection('note').field({
        task: true,
        _openid: true,
        _id: true,
      }).get()
      .then(res => {
        console.log(res)
        res.data.forEach((element, index) => {
          element.task.forEach((innerElement, innerIndex) => {
            if (innerElement.notification == true && innerElement.done == false) {
              let message = {
                _openid: element._openid,
                _id: element._id,
                heading: innerElement.heading == null ? '' : innerElement.heading,
                time: formatTime(new Date(innerElement.notificationTimestamp)),
                urgency: "紧急且重要",
                content: innerElement.content == null ? '' : innerElement.content,
                reminderStatus: "待确认",
                index: innerIndex,
              }
              messages.push(message)
            }
          })
        })
        console.log(messages)
        messages.forEach(message=>{
          cloud.openapi.subscribeMessage.send({
            touser: message._openid, //要推送用户的openid
            //page:'',
            data: { //推送的内容
              thing1: {
                value: message.heading //'xx会议'
              },
              time2: {
                value: message.time //'2019年11月30日 21:00:00'
              },
              phrase9: {
                value: message.urgency //'紧急且重要'
              },
              thing4: {
                value: message.content //'会议内容为.....'
              },
              phrase8: {
                value: message.reminderStatus //'待确认'
              }
            },
            templateId: 'n5ZgQ_uHeZFwKecg8S_WjDb3Gfx7a9BUTZbkLPnWTXI' //模板id
          })
          // wx.cloud.database().collection('note')
          // .doc(message._id)
          // .update({
          //   data: {
          //     [`task.${message.index}`]: {
          //       done: true,
          //     }
          //   },
          // })
        })
      })
  },

  onTabItemTap(e) {
    console.log("aaaaa");
  },

  //分栏
  column() {
    var that = this
    //定时器
    function timeOut(time) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, time)
      })
    };
    //分栏
    async function sort() {
      var noteLeft = [];
      var noteRight = [];
      var query = wx.createSelectorQuery()
      for (let i = 0; i < that.data.note.length; i++) {
        var hw1, hw2;
        query.select('#note_left').boundingClientRect(function (res) {
          hw1 = Math.round(res.height)
          // console.log(hw1)
        }).exec()
        query.select('#note_right').boundingClientRect(function (res) {
          hw2 = Math.round(res.height)
          // console.log(hw2)
        }).exec();
        await timeOut(200);
        if (hw1 <= hw2) {
          noteLeft.push(that.data.note[i])
        } else {
          noteRight.push(that.data.note[i])
        }
        that.setData({
          noteLeft,
          noteRight
        })
      }
    }
    if (this.data.currentPage == 1) {
      sort()
    }
  },

  showSelector() {
    this.setData({
      selectorStyle: "top:0"
    })
  },

  sel1() {
    let tabbar = this.getTabBar()
    if (app.globalData.currentPage == 2) {
      this.setData({
        currentPage: 1
      })
      tabbar.setData({
        sld1: `color:${this.data.primaryColor};background:${this.data.rgbaPrimaryColor};`,
        sld2: "",
        sld3: "",
        sld4: "",
      })
      app.globalData.currentPage = 1;
      app.globalData.formerPage = 2;
    }
    setTimeout(() => {
      this.setData({
        selectorStyle: "",
      })
    }, 300)
  },
  sel2() {
    let tabbar = this.getTabBar()
    if (app.globalData.currentPage == 1) {
      this.setData({
        currentPage: 2
      })
      tabbar.setData({
        sld1: "",
        sld2: `color:${this.data.primaryColor};background:${this.data.rgbaPrimaryColor};`,
        sld3: "",
        sld4: "",
      })
      app.globalData.currentPage = 2;
      app.globalData.formerPage = 1;
    }
    setTimeout(() => {
      this.setData({
        selectorStyle: "",
      })
    }, 300)
  },

  getUserProfileTap(e) {
    //如果未授权，就提示授权，如果授权了，就执行正常的业务逻辑
    if (!wx.getStorageSync('storage_info')) {
      app.getUserProfile()
      return
    }
    //下面是正常业务逻辑
    //...
  },

  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        app.globalData.userInfo = res.userInfo;
        app.globalData.hasUserInfo = true;
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  note(e) {
    var that = this
    let tabbar = this.getTabBar()
    console.log(e)
    if (!e.currentTarget.dataset.data.encrypt) {
      wx.navigateTo({
        url: '/pages/note/note',
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          toIndex: function (data) {
            that.onPullDownRefresh()
          },
        },
        success(res) {
          res.eventChannel.emit('toNote', {
            edit: false,
            data: e.currentTarget.dataset.data
          })
        }
      })
    } else {
      tabbar.popupPassword(e.currentTarget.dataset.data)
    }
  },

  todo(e) {
    console.log(e)
    var that = this
    wx.navigateTo({
      url: '/pages/todo/todo',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        toIndex: function (data) {
          that.onPullDownRefresh()
        },
      },
      success(res) {
        res.eventChannel.emit('toTodo', {
          edit: false,
          data: e.currentTarget.dataset.data
        })
      }
    })
  },

  //请求用户订阅授权
  requestSubscribeMessage() {
    var that = this
    wx.requestSubscribeMessage({
      tmplIds: ['n5ZgQ_uHeZFwKecg8S_WjDb3Gfx7a9BUTZbkLPnWTXI'],
      success(res) {
        console.log('授权成功', res)
      },
      fail(res) {
        console.log('授权失败', res)
      }
    })
  },

  //发送消息给单个用户
  sendOne() { //title,time,urgency,content,reminderStatus
    wx.cloud.callFunction({
        name: "sendOne",
      }).then(res => {
        console.log("发送单条成功", res);
      })
      .catch(res => {
        console.log("发送单条失败", res)
      })
  },
})