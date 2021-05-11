// pages/category/category.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryData: []
  },

  //跨页面异步传递
  // send() {
  //   console.log("clicked");
  //   app.setChangedData("2")
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.onPullDownRefresh()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let tabbar = this.getTabBar()
    //重新拉取侧栏
    tabbar.setData({
      useSidebar: app.globalData.useSidebar,
      primaryColor: app.globalData.primaryColor,
      rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
    })
    //重新拉取配置
    this.setData({
      useSidebar: app.globalData.useSidebar,
      pureTheme: app.globalData.pureTheme,
      primaryColor: app.globalData.primaryColor,
      rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
      isPad: app.globalData.isPad
    })
    //数据拉取
    this.setData({
      note: app.globalData.note,
      task: app.globalData.task,
      categoryData: app.globalData.categoryData,
    })
    //侧栏状态
    tabbar.setData({
      currentPage: 3,
      btn2: `color:${this.data.primaryColor}`,
      ["sld" + app.globalData.currentPage]: `color:${this.data.primaryColor};background:var(--rgbaprimaryColor--);transition:none;`,
      ["sld" + app.globalData.formerPage]: 'transition:none;',
      sld1: 'transition:none;',
      sld2: 'transition:none;',
      sld4: 'transition:none;',
      slide: false,
      sidebarStyle: "left:-250px",
    })
    app.globalData.currentPage = 3;
    setTimeout(() => {
      tabbar.setData({
        ["sld" + app.globalData.currentPage]: `color:${this.data.primaryColor};background:var(--rgbaprimaryColor--);`,
        ["sld" + app.globalData.formerPage]: '',
        sld1: '',
        sld2: '',
        sld4: '',
      })
    }, 250)
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
    app.refresh().then(res => {
      //重新拉取侧栏
      let tabbar = this.getTabBar();
      tabbar.setData({
        useSidebar: app.globalData.useSidebar,
        primaryColor: app.globalData.primaryColor,
        rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
      })
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
        task: app.globalData.task,
        categoryData: app.globalData.categoryData,
      })
      //整理
      this.sort()
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

  // zhankai: function (e) {
  //   var n = e.currentTarget.dataset.xushu
  //   let tip = this.data.height_Array[n].tips
  //   let content_len = this.data.test01.list01[n].real_Content.length
  //   let gao = (content_len + 1) * 150
  //   let str = 'height_Array' + '[' + n + ']' + '.height'
  //   let str2 = 'height_Array' + '[' + n + ']' + '.tips'
  //   if (tip > 0) {
  //     this.setData({
  //       [str]: gao + 'rpx',
  //       [str2]: -1
  //     })
  //   } else {
  //     this.setData({
  //       [str]: '150rpx',
  //       [str2]: 1
  //     })
  //   }
  // },

  note(e) {
    var that = this
    let tabbar = this.getTabBar()
    console.log(e)
    if (!e.currentTarget.dataset.data.encrypt) {
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
    } else {
      tabbar.popupPassword(e.currentTarget.dataset.data)
    }
  },

  expand(e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      [`collatedData[${index}].triggered`]: this.data.collatedData[index].triggered ? false : true,
    })
  },

  sort() {
    var that = this
    var result = []
    this.data.categoryData.forEach((element, index) => {
      let cla = []
      this.data.note.forEach(innerElement => {
        if (innerElement.category == index) {
          cla.push(innerElement)
        }
      })
      result.push({
        color: app.getRandomColor(),
        data: cla,
        name: element,
        height: 150 + 60 * cla.length,
        triggered: false,
      })
    })
    this.setData({
      collatedData: result
    })
  },

})