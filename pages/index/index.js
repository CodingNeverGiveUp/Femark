// index.js
// 获取应用实例
const app = getApp()
const database = require("../../utils/database.js")

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
    sel1: `color:${app.globalData.primaryColor};background:${app.colorRgba(getApp().globalData.primaryColor, .2)};`,

    noteLeft: [],
    noteRight: [],
    text: {
      list: [{
          color: "#20a674",
          month: 'Nov',
          day: 21,
          ddl: '10:00:00',
          topic: '主标题啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊'
        },

        {
          color: "#c54949",
          month: 'Dec',
          day: 31,
          ddl: '10:00:00',
          topic: '主标题啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊'
        },

        {
          color: "#176095",
          month: 'Oct',
          day: 12,
          ddl: '10:00:00',
          topic: '主标题啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊'
        }
      ]
    }
  },

  // 事件处理函数
  onLoad() {
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
      isPad: app.globalData.isPad,
      primaryColor: app.globalData.primaryColor,
      rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
    })
    //数据拉取
    this.setData({
      note: app.globalData.note,
      task: app.globalData.task
    })
    //拉取openid
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid,
      })
    } else {
      console.log("get openid from server")
      wx.cloud.callFunction({
          name: "getOpenid"
        }).then(res => {
          // console.log(res);
          this.data.openid = res.result.openid;
          app.globalData.openid = res.result.openid;
        })
        .catch(res => {
          console.log("failed")
        })
    };
  },

  onReady() {
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
    async function heightComparison() {
      function getHeight() {
        return new Promise((resolve, reject) => {
          var query = wx.createSelectorQuery()
          query.select('#note_left').boundingClientRect(function (res) {
            hw1 = Math.round(res.height)
            // console.log(hw1)
          }).exec()
          query.select('#note_right').boundingClientRect(function (res) {
            hw2 = Math.round(res.height)
            // console.log(hw2)
          }).exec();
          setTimeout(() => {
            resolve()
          }, 100)
        })
      }
      var hw1, hw2;
      await getHeight()
      // console.log(hw1, hw2)
      if (hw1 <= hw2) {
        return true
      } else {
        return false
      }
    }

    //分栏
    var noteLeft = [];
    var noteRight = [];
    this.data.note.forEach((element, index, array) => {
      if (heightComparison()) {
        noteLeft.push(element)
      } else {
        noteRight.push(element)
      }
      this.setData({
        noteLeft,
        noteRight
      })
    })
  },

  onShow() {
    let tabbar = this.getTabBar()
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

  onTabItemTap(e) {
    console.log("aaaaa");
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
        sel1: `color:${this.data.primaryColor};background:${this.data.rgbaPrimaryColor};`,
        sel2: "",
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
        sel1: "",
        sel2: `color:${this.data.primaryColor};background:${this.data.rgbaPrimaryColor};`,
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
    console.log(e)
    var that = this
    wx.navigateTo({
      url: '/pages/note/note',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        acceptDataFromOpenedPage: function (data) {
          console.log(data)
        },
      },
      success(res) {
        res.eventChannel.emit('toNote', {
          edit: false,
          data: e.currentTarget.dataset.data
        })
      }
    })
  },

  //请求用户订阅授权
  requestSubscribeMessage() {
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
        data: {
          openid: this.data.openid,
        }
      }).then(res => {
        console.log("发送单条成功", res);
      })
      .catch(res => {
        console.log("发送单条失败", res)
      })
  },
})