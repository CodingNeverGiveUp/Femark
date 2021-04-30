// index.js
// 获取应用实例
const app = getApp()
const database = require("../../utils/database.js")

Page({
  data: {
    userInfo: {},
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

    h1: '',
    h2: '',
    picture_path: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=218852904,1106228157&fm=26&gp=0.jpgs',
    test: {
      test_Array01: [{
          real: '看fJ#$%392888939hfg872g872',
          color: ''
        },
        {
          real: '发i啊呵呵中',
          color: ''
        }, {
          real: '发觉这世界奥哦啊不带u阿飞波尔u',
          color: ''
        }
      ],
      test_Array02: [{
        real: '今年第哦啊八八七八丢丢八二ui',
        color: ''
      }, {
        real: '就拿看就看弄你而安琪儿哦i',
        color: ''
      }, {
        real: ' 就爱看就看哦额弄Enel发你的那几位',
        color: ''
      }]
    },

    text_lenth: '',
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

    //跨页面异步传递
    // app.addListener((changedData) => {
    //   this.setData({
    //     currentPage: changedData,
    //   })
    // })
  },

  onReady() {
    //拉取openid
    console.log(app.globalData.openid)
    console.log(app.globalData.systemInfo)
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
    //拉取状态
    setTimeout(() => {
      let tabbar = this.getTabBar()
      tabbar.setData({
        btn1: `color:${this.data.primaryColor}`,
        sidebarStyle: "left:-250px",
        currentPage: 1,
      })
    }, 500)
    //拉取强调色  
    let test_Array01_lenth = this.data.test.test_Array01.length
    let test_Array02_lenth = this.data.test.test_Array02.length
    let color_number1 = 0
    let color_number2 = 0
    for (; color_number1 < test_Array01_lenth; color_number1++) {
      let color1 = getApp().getRandomColor()
      let str1 = 'test' + '.test_Array01' + '[' + color_number1 + ']' + '.color'
      this.setData({
        [str1]: color1
      })
    }
    for (; color_number2 < test_Array02_lenth; color_number2++) {
      let color2 = getApp().getRandomColor()
      let str2 = 'test' + '.test_Array02' + '[' + color_number2 + ']' + '.color'
      this.setData({
        [str2]: color2
      })
    }
    //以下是比较两边高度
    var hw1, hw2;
    setTimeout(() => {
      var query = wx.createSelectorQuery()
      query.select('#b1').boundingClientRect(function (res) {
        // that.setData({
        // h1:res.height
        // })
        hw1 = parseInt(res.height)
      }).exec();
      query.select('#b2').boundingClientRect(function (res) {
        hw2 = parseInt(res.height)

      }).exec();
    }, 300)
    if (hw1 >= hw2) {
      console.log('box1')
    } else {
      console.log('box2')
    }


    //别改我的
    let n = this.data.text.list.length
    this.setData({
      text_lenth: n
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

  addArray() {
    database.addArray()
  },

  //添加测试待办
  addTask2() {
    database.addTask2('腾讯会议','2019年11月30日 21:00:00','紧急且重要','会议内容为制作小程序','待确认',false)
  },

  addNote() {
    database.addNote(20204851, '学校', '学校', '学校')
  },

  addTask() {
    database.addTask(20204851, '学校', '学校', '学校')
  },

  deleteTask() {
    database.deleteTask();
  },

  getTask() {
    database.getTask();
  },

  //获取当前时间
  getTime() {
    var currenttime = (new Date()).valueOf();
    var currentdate = new Date(currenttime);
    console.log(currentdate.valueOf());
  }
})