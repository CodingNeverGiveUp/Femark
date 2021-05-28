// pages/guide/guide.js
const app = getApp()
const database = require("../../utils/database.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: app.globalData.systemInfo.theme,
    primaryColor: app.globalData.primaryColor,
    rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
    isPad: app.globalData.isPad,
    windowWidth: app.globalData.systemInfo.windowWidth,
    buttonContent: "chevron_right",
    page: 1,
    profile: {
      nickName: null,
      avatarUrl: null,
      pureTheme: false,
      useSidebar: false,
      primaryColor: "#4285f4",
      categoryData: ["默认", "学习", "工作", "生活"],
      bing: true,
      hitokoto: false,
      markdownByDefault: false,
      markdownPreview: true,
      markdownPreviewDelay: 2,
      saveRecordFileByDefault: true,
      recordLanguage: 0,
    },
  },

  toLower() {
    var that = this;
    if (this.data.page == 1 && this.data.buttonContent == "chevron_right") {
      this.setData({
        scrollTo: 'sss',
      })
    }else if(this.data.page == 1 && this.data.buttonContent == "priority_high"){
      wx.showModal({
        title: "警告",
        content: "是否略过授权？将无法使用大部分功能",
        confirmText: "暂不授权",
        cancelText: "重新授权",
        cancelColor: this.data.primaryColor,
        confirmColor: "#ff5252",
      }).then(res=>{
        if(res.confirm){
          wx.switchTab({
            url: '/pages/index/index',
          })
        }else{
          wx.showLoading({
            title: '准备中',
            mask: true
          })
          wx.getUserProfile({
            desc: '完善个人资料',
            success: function (res) {
              wx.hideLoading()
              var userInfo = res.userInfo
              that.setData({
                buttonContent: "done",
                ['profile.nickName']: userInfo.nickName,
                ['profile.avatarUrl']: userInfo.avatarUrl,
              })
              app.globalData.userInfo = userInfo
              console.log('userInfo==>', userInfo)
              // wx.setStorageSync('storage_info', 1); //本地标记
              //下面将userInfo存入服务器中的用户个人资料
              //...
            },
            fail() {
              wx.hideLoading()
              that.setData({
                buttonContent: "priority_high"
              })
              console.log("用户拒绝授权")
            }
          })
        }
      })
    } else if ((this.data.page == 1 && this.data.buttonContent == "settings")) {
      wx.showLoading({
        title: '准备中',
        mask: true
      })
      wx.getUserProfile({
        desc: '完善个人资料',
        success: function (res) {
          wx.hideLoading()
          var userInfo = res.userInfo
          that.setData({
            buttonContent: "done",
            ['profile.nickName']: userInfo.nickName,
            ['profile.avatarUrl']: userInfo.avatarUrl,
          })
          app.globalData.userInfo = userInfo
          console.log('userInfo==>', userInfo)
          // wx.setStorageSync('storage_info', 1); //本地标记
          //下面将userInfo存入服务器中的用户个人资料
          //...
        },
        fail() {
          wx.hideLoading()
          that.setData({
            buttonContent: "priority_high"
          })
          console.log("用户拒绝授权")
        }
      })
    } else if (this.data.page == 1 && this.data.buttonContent == "done") {
      console.log("done");
      this.setData({
        page1: "top:-100vh",
        page: 2,
      })
      setTimeout(() => {
        this.setData({
          buttonContent: "chevron_right",
        })
      }, 500)
    } else if (this.data.page == 2 && this.data.buttonContent == "chevron_right") {
      //上传
      wx.showLoading({
        title: '处理中',
        mask: true
      })
      database.addArray(this.data.profile)
        .then(() => {
          wx.hideLoading();
          this.setData({
            page: 3,
            page2: "top:-100vh",
            float: "bottom:20vh;right:50vw;transform:translate(50%,50%)"
          })
        })
        .catch((err) => {
          console.log(err)
          wx.hideLoading()
          wx.showToast({
            title: '网络错误',
            icon: 'error'
          })
        })
      app.globalData.primaryColor = this.data.profile.primaryColor;
      app.globalData.pureTheme = this.data.profile.pureTheme;
      app.globalData.useSidebar = this.data.profile.useSidebar;
      app.globalData.bing = true;
      app.globalData.hitokoto = false; 

    } else if (this.data.page == 3 && this.data.buttonContent == "chevron_right") {
      wx.showLoading({
        title: '请稍等',
        mask: true
      })
      wx.cloud.callFunction({
        name: "getOpenid"
      }).then(res => {
        let openid = res.result.openid;
        app.globalData.openid = openid;
        wx.cloud.database().collection('note').where({
          _openid: openid
        }).get()
        .then(res=>{
          app.globalData.id = res.data[0]._id;
          wx.hideLoading()
          wx.switchTab({
            url: '/pages/index/index',
          })
        })
      })
    }
  },

  setStatus() {
    if (this.data.buttonContent != "done") {
      this.setData({
        buttonContent: "settings"
      })
    }
  },

  cancelStatus() {
    if (this.data.buttonContent != "done") {
      this.setData({
        buttonContent: "chevron_right"
      })
    }
  },

  animation() {
    this.animate('.icon', [{
      transform: 'rotate(0deg)',
      offset: 0.0
    }, {
      transform: 'rotate(360deg)',
      offset: 1.0
    }], 1000, {
      scrollSource: '.scroll',
      orientation: 'horizontal',
      timeRange: 1000,
      startScrollOffset: 0,
      endScrollOffset: this.data.windowWidth,
    })
  },

  switch (e) {
    // console.log(e);
    if (e.currentTarget.dataset.id == 'markdownByDefault') {
      this.setData({
        ['profile.markdownByDefault']: e.detail.value,
      })
    } else if (e.currentTarget.dataset.id == 'useSidebar') {
      this.setData({
        ['profile.useSidebar']: e.detail.value,
      })
    }
  },

  themeColorful() {
    this.setData({
      ['profile.pureTheme']: false,
      themeColorful: `border:${this.data.primaryColor} solid 2px;`,
      themePure: ''
    })
  },
  themePure() {
    this.setData({
      ['profile.pureTheme']: true,
      themePure: `border:${this.data.primaryColor} solid 2px;`,
      themeColorful: ''
    })
  },

  colorSelect(e) {
    let color = e.currentTarget.dataset.color;
    // console.log(color);
    this.setData({
      ['profile.primaryColor']: color,
      primaryColor: color,
      rgbaPrimaryColor: app.colorRgba(color, .2)
    })
    if (this.data.profile.pureTheme) {
      this.setData({
        themePure: `border:${color} solid 2px;`,
        themeColorful: ''
      })
    } else {
      this.setData({
        themePure: '',
        themeColorful: `border:${color} solid 2px;`,
      })
    }
    this.selectAllComponents('.switch').forEach(element => {
      element.refreshStatus()
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.animation();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.onThemeChange((result) => {
      // console.log(result)
      this.setData({
        theme: result.theme
      })
    })
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
})