// pages/account/account.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hitokoto: false,
    bing: true,
    isPad: app.globalData.isPad,
    useSidebar: app.globalData.useSidebar,
    primaryColor: app.globalData.primaryColor,
    rgbaPrimaryColor: app.colorRgba(getApp().globalData.primaryColor, .2),
    currentPage: app.globalData.currentPage,
    motto: "From small beginnings comes great things.",
    motto_from: "Winston Churchill",
    avatarUrl: "/source/img/avatar.png",
    nickName: "微信用户",
    description: "欢迎使用 Femark",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(app.globalData.userInfo.avatarUrl){
      this.setData({
        avatarUrl: app.globalData.userInfo.avatarUrl
      })
    }
    if(app.globalData.userInfo.nickName){
      this.setData({
        nickName: app.globalData.userInfo.nickName
      })
    }
    if(app.globalData.avatarUrl){
      this.setData({
        avatarUrl: app.globalData.avatarUrl
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getImage();
    this.getMoto();
    this.animation();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let tabbar = this.getTabBar()
    tabbar.setData({
      currentPage: 4,
      btn3: `color:${this.data.primaryColor}`,
      ["sld" + app.globalData.currentPage]: `color:${this.data.primaryColor};background:var(--rgbaprimaryColor--);transition:none;`,
      ["sld" + app.globalData.formerPage]: 'transition:none;',
      sld1: 'transition:none;',
      sld2: 'transition:none;',
      sld3: 'transition:none;',
      slide: false,
      sidebarStyle: "left:-250px",
    })
    app.globalData.currentPage = 4;
    setTimeout(() => {
      tabbar.setData({
        ["sld" + app.globalData.currentPage]: `color:${this.data.primaryColor};background:var(--rgbaprimaryColor--);`,
        ["sld" + app.globalData.formerPage]: '',
        sld1: '',
        sld2: '',
        sld3: '',
      })
    }, 250)
  },

  getImage: function () {
    if (app.globalData.bing) {
      wx.request({
        url: 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1',
        method: 'GET',
        dataType: 'json',
        success: res => {
          let url = 'https://s.cn.bing.net/' + res.data.images[0].url;
          this.setData({
            imgUrl: url
          })
        }
      })
    } else {
      return;
      wx.cloud.getTempFileURL({
        fileList: ["cloud://holotask-1gb3a2qhe28a3262.686f-holotask-1gb3a2qhe28a3262-1304966310/image/account/sajad-nori-i4lvriR96Ek-unsplash.jpg"],
        success: res => {
          this.setData({
            imgUrl: res.fileList[0].tempFileURL
          })
        },
        fail: res => {
          console.log("Failed to request img.")
        }
      })
    }
  },

  getMoto: function () {
    if (app.globalData.hitokoto) {
      wx.request({
        url: 'https://v1.hitokoto.cn/?c=a&c=b&c=c&c=d&c=i&encode=json&max_length=30',
        method: 'GET',
        dataType: 'json',
        success: res => {
          this.setData({
            motto: res.data.hitokoto,
            motto_from: res.data.from
          })
          // console.log(res.data);
        }
      })
    }
  },

  animation: function () {
    this.animate('.motto_container', [{
      opacity: 1.0,
      offset: 0
    }, {
      opacity: 0.0,
      offset: 1
    }, ], 2000, {
      scrollSource: '.scroller',
      timeRange: 2000,
      startScrollOffset: 50,
      endScrollOffset: 120
    })

    this.animate('.header', [{
      height: '100%',
    }, {
      height: '120%',
    }, ], 2000, {
      scrollSource: '.scroller',
      timeRange: 2000,
      startScrollOffset: 0,
      endScrollOffset: 150
    })

    // this.animate('#motto_setting', [{
    //   opacity: 1.0,
    //   transform: 'rotate(0deg)',
    //   offset: 0
    // }, {
    //   opacity: 1.0,
    //   transform: 'rotate(32deg)',
    //   offset: .18
    // }, {
    //   opacity: 0.0,
    //   transform: 'rotate(180deg)',
    //   offset: 1
    // }, ], 2000, {
    //   scrollSource: '#scroller',
    //   timeRange: 2000,
    //   startScrollOffset: 0,
    //   endScrollOffset: 280
    // })
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

  }
})