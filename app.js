// app.js
const event = require("/utils/event.js")
const time = require("/utils/util.js")
App({
  onLaunch() {
    //注册云开发
    wx.cloud.init({
      env: "suiyi-5goxhr285fd1f64b",
    })

    //初始化
    this.initialize();

    // // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     console.log(res);
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserProfile 获取头像昵称，不会弹框
    //       wx.getUserProfile({
    //         desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    //         success: (res) => {
    //           console.log(res)
    //           // this.setData({
    //           //   userInfo: res.userInfo,
    //           //   hasUserInfo: true
    //           // })
    //           this.globalData.userInfo = res.userInfo;
    //           this.globalData.hasUserInfo = true;
    //         }
    //       })
    //     }
    //   }
    // })

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    //获取系统信息
    let systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo;
    if (systemInfo.windowWidth > 600) {
      this.globalData.isPad = true;
    }
  },

  //初始化
  initialize() {
    event.emit('LoginCheck', '检查用户信息');
    //获取openid及_id
    wx.cloud.callFunction({
        name: "getOpenid"
      }).then(res => {
        // console.log("step1")
        let openid = res.result.openid;
        this.globalData.openid = openid;
        //获取用户配置
        event.emit('LoginCheck', '获取用户配置');
        wx.cloud.database().collection('note').where({
            _openid: openid
          }).get()
          .then(res => {
            if (res.data.length == 0) {
              event.emit('LoginCheck', 'register');
            } else {
              // console.log("step2")
              // console.log(res)
              this.globalData.id = res.data[0]._id;
              this.globalData.useSidebar = res.data[0].profile.useSidebar;
              this.globalData.markdownByDefault = res.data[0].profile.markdownByDefault;
              this.globalData.markdownPreview = res.data[0].profile.markdownPreview;
              this.globalData.markdownPreviewDelay = res.data[0].profile.markdownPreviewDelay;
              // console.log(this.globalData.useSidebar)
              this.globalData.pureTheme = res.data[0].profile.pureTheme;
              this.globalData.userInfo.nickName = res.data[0].profile.nickName;
              this.globalData.userInfo.avatarUrl = res.data[0].profile.avatarUrl;
              this.globalData.primaryColor = res.data[0].profile.primaryColor;
              this.globalData.categoryData = res.data[0].profile.categoryData;
              this.globalData.bing = res.data[0].profile.bing;
              this.globalData.hitokoto = res.data[0].profile.hitokoto;
              //提前拉取及预处理笔记待办数据
              res.data[0].note.forEach((element, index) => {
                element.color = this.getRandomColor()
                element.id = index
                wx.cloud.getTempFileURL({
                  fileList: element.gallery,
                }).then(res => {
                  element.galleryDetail = res.fileList
                })
              })
              res.data[0].task.forEach((element, index) => {
                element.color = this.getRandomColor()
                element.id = index
                if (element.heading == null) {
                  if (element.list) {
                    let tempHeading = ""
                    element.listData.forEach(element => {
                      tempHeading += element.content + " "
                    })
                    element.heading = tempHeading
                  } else {
                    element.heading = element.content
                  }
                }
                let monthNum = new Date(element.notificationTimestamp).getMonth() + 1
                var monthStr
                switch (monthNum) {
                  case 1:
                    monthStr = "Jan"
                    break;
                  case 2:
                    monthStr = "Feb"
                    break;
                  case 3:
                    monthStr = "Mar"
                    break;
                  case 4:
                    monthStr = "Apr"
                    break;
                  case 5:
                    monthStr = "May"
                    break;
                  case 6:
                    monthStr = "Jun"
                    break;
                  case 7:
                    monthStr = "Jul"
                    break;
                  case 8:
                    monthStr = "Aug"
                    break;
                  case 9:
                    monthStr = "Sep"
                    break;
                  case 10:
                    monthStr = "Oct"
                    break;
                  case 11:
                    monthStr = "Nov"
                    break;
                  case 12:
                    monthStr = "Dec"
                    break;
                  default:
                    monthStr = "NaN"
                    break;
                }
                element.month = monthStr
                element.date = new Date(element.notificationTimestamp).getDate()
                element.time = `${monthStr} ${element.date}, ${time.formatNumber(new Date(element.notificationTimestamp).getHours())}:${time.formatNumber(new Date(element.notificationTimestamp).getMinutes())}`
              })
              this.globalData.note = res.data[0].note;
              this.globalData.task = res.data[0].task;
              //修改
              setTimeout(() => {
                event.emit('LoginCheck', 'finished');
              }, 500)
            }
          })
          .catch(err => {
            event.emit('LoginCheck', 'error');
          })
      })
      .catch(err => {
        // console.log("failed")
        console.log(err)
        event.emit('LoginCheck', 'error');
      })
  },

  refresh() {
    var that = this
    return new Promise((resort, reject) => {
      async function process() {
        var db
        await wx.cloud.database().collection('note').doc(that.globalData.id).get()
          .then(res => {
            db = res
          })
        console.log(db)
        //拉取及预处理笔记待办数据
        for (let i = 0; i < db.data.note.length; i++) {
          db.data.note[i].color = that.getRandomColor()
          db.data.note[i].id = i
          await wx.cloud.getTempFileURL({
            fileList: db.data.note[i].gallery,
          }).then(res => {
            console.log("get url * 1")
            db.data.note[i].galleryDetail = res.fileList
          }).catch(err => {
            reject()
          })
        }
        // db.data.note.forEach((element, index) => {
        //   element.color = that.getRandomColor()
        //   element.id = index
        //   wx.cloud.getTempFileURL({
        //     fileList: element.gallery,
        //   }).then(res => {
        //     console.log("get url * 1")
        //     element.galleryDetail = res.fileList
        //   }).catch(err=>{
        //     reject()
        //   })
        // })
        console.log("other")
        db.data.task.forEach((element, index) => {
          element.color = that.getRandomColor()
          element.id = index
          if (element.heading == null) {
            if (element.list) {
              let tempHeading = ""
              element.listData.forEach(element => {
                tempHeading += element.content + " "
              })
              element.heading = tempHeading
            } else {
              element.heading = element.content
            }
          }
          let monthNum = new Date(element.notificationTimestamp).getMonth() + 1
          var monthStr
          switch (monthNum) {
            case 1:
              monthStr = "Jan"
              break;
            case 2:
              monthStr = "Feb"
              break;
            case 3:
              monthStr = "Mar"
              break;
            case 4:
              monthStr = "Apr"
              break;
            case 5:
              monthStr = "May"
              break;
            case 6:
              monthStr = "Jun"
              break;
            case 7:
              monthStr = "Jul"
              break;
            case 8:
              monthStr = "Aug"
              break;
            case 9:
              monthStr = "Sep"
              break;
            case 10:
              monthStr = "Oct"
              break;
            case 11:
              monthStr = "Nov"
              break;
            case 12:
              monthStr = "Dec"
              break;
            default:
              monthStr = "NaN"
              break;
          }
          element.month = monthStr
          element.date = new Date(element.notificationTimestamp).getDate()
          element.time = `${monthStr} ${element.date}, ${time.formatNumber(new Date(element.notificationTimestamp).getHours())}:${time.formatNumber(new Date(element.notificationTimestamp).getMinutes())}`
        })
        //拉取配置
        that.globalData.useSidebar = db.data.profile.useSidebar;
        that.globalData.markdownByDefault = db.data.profile.markdownByDefault;
        that.globalData.markdownPreview = db.data.profile.markdownPreview;
        that.globalData.markdownPreviewDelay = db.data.profile.markdownPreviewDelay;
        that.globalData.pureTheme = db.data.profile.pureTheme;
        that.globalData.userInfo.nickName = db.data.profile.nickName;
        that.globalData.userInfo.avatarUrl = db.data.profile.avatarUrl;
        that.globalData.primaryColor = db.data.profile.primaryColor;
        that.globalData.categoryData = db.data.profile.categoryData;
        that.globalData.bing = db.data.profile.bing;
        that.globalData.hitokoto = db.data.profile.hitokoto;
        that.globalData.note = db.data.note;
        that.globalData.task = db.data.task;
        resort()
      }
      process()
    })
  },

  onThemeChange(e) {
    this.globalData.systemInfo.theme = e;
    console.log(e)
  },

  colorRgba(sHex, alpha) {
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{4}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/
    /* 16进制颜色转为RGB格式 */
    var sColor = sHex.toLowerCase()
    // var alpha = 1
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4 || sColor.length === 5) {
        var sColorNew = '#'
        for (var i = 1; i < sColor.length; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
        }
        sColor = sColorNew
      }
      // 如果有透明度再执行
      if (sColor.length === 9) {
        alpha = (parseInt('0x' + sColor.slice(7, 9)) / 255).toFixed(2)
      }
      //  处理六位的颜色值
      var sColorChange = []
      for (var i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
      }
      return 'rgba(' + sColorChange.join(',') + ',' + alpha + ')'
    } else {
      return sColor
    }
  },

  // 获取随机颜色
  getRandomColor() {
    if (this.globalData.pureTheme) {
      if(this.globalData.systemInfo.theme == 'light'){
        return "#ffffff"
      }else{
        return "#303638"
      }
    } else {
      let num = Math.random();
      if (num >= 0 && num < 0.2) {
        if (this.globalData.lastColor == "#ae6060") {
          return "#20a674";
        } else {
          this.globalData.lastColor = "#ae6060"
          return "#ae6060";
        }
      } else if (num >= 0.2 && num < 0.4) {
        if (this.globalData.lastColor == "#20a674") {
          return "#176095";
        } else {
          this.globalData.lastColor = "#20a674"
          return "#20a674";
        }
      } else if (num >= 0.4 && num < 0.6) {
        if (this.globalData.lastColor == "#176095") {
          return "#ffbc66";
        } else {
          this.globalData.lastColor = "#176095"
          return "#176095";
        }
      } else if (num >= 0.6 && num < 0.8) {
        if (this.globalData.lastColor == "#ffbc66") {
          return "#97756b";
        } else {
          this.globalData.lastColor = "#ffbc66"
          return "#ffbc66";
        }
      } else if (num >= 0.8 && num <= 1) {
        if (this.globalData.lastColor == "#97756b") {
          return "#ae6060";
        } else {
          this.globalData.lastColor = "#97756b"
          return "#97756b";
        }
      }
    }
  },

  //获取用户信息
  // getUserProfile() {
  //   wx.getUserProfile({
  //     desc: '完善个人资料',
  //     success: function(res) {
  //       var userInfo = res.userInfo
  //       console.log('userInfo==>', userInfo)
  //       wx.setStorageSync('storage_info', 1);//本地标记
  //       //下面将userInfo存入服务器中的用户个人资料
  //       //...
  //     },
  //     fail() {
  //       console.log("用户拒绝授权")
  //     }
  //   })
  // },

  //跨页面异步传递
  // addListener(callback) {
  //   this.callback = callback;
  // },

  // setChangedData(data) {
  //   this.data = data;
  //   if (this.callback != null) {
  //     this.callback(data)
  //   }
  // },

  globalData: {
    userInfo: {},
    note: [],
    task: [],
    hasUserInfo: false,
    primaryColor: "#4285f4",
    openid: null,
    id: null,
    currentPage: 1,
    formerPage: null,
    systemInfo: null,
    isPad: false,
    useSidebar: false,
    markdownByDefault: true,
    hitokoto: false,
    bing: true,
    pureTheme: false,
    categoryData: [],
    lastColor: "#ae6060"
  }
})