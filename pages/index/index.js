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
    isPad: app.globalData.isPad,
    primaryColor: app.globalData.primaryColor,
    rgbaPrimaryColor: app.colorRgba(getApp().globalData.primaryColor, .2),
    currentPage: app.globalData.currentPage,
    selectorStyle: "",
    sel1: `color:${app.globalData.primaryColor};background:${app.colorRgba(getApp().globalData.primaryColor, .2)};`,


    h1: '',
    h2: '',
    picture_path: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=218852904,1106228157&fm=26&gp=0.jpgs',
    test: {
      test_Array01: [{
          real: '看fJ#$%392888939hfg872g872'
        },
        {
          real: '发i啊呵呵中'
        }, {
          real: '发觉这世界奥哦啊不带u阿飞波尔u'
        }
      ],
      test_Array02: [{
        real: '今年第哦啊八八七八丢丢八二ui'
      }, {
        real: '就拿看就看弄你而安琪儿哦i'
      }, {
        real: ' 就爱看就看哦额弄Enel发你的那几位'
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
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      })
    }

    //跨页面异步传递
    app.addListener((changedData) => {
      // this.setData({
      //   currentPage: changedData,
      // })
    })
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

  addArray() {
    database.addArray()
  },

  addNote() {
    database.addNote(20204851, '学校', '学校', '学校')
  },

  addTask() {
    database.addTask(20204851, '学校', '学校', '学校')
  },

  deleteTask(){
    database.deleteTask();
  },

  getTask(){
    database.getTask();
  }
})