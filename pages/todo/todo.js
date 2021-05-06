// pages/todo/todo.js
const app = getApp()
const database = require("../../utils/database.js")
const time = require("../../utils/util.js")
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
    notificationDate: `${new Date().getFullYear()}-${time.formatNumber(new Date().getMonth()+1)}-${time.formatNumber(new Date().getDate())}`,
    notificationTime: `${time.formatNumber(new Date().getHours())}:${time.formatNumber(new Date().getMinutes())}`,
    edit: null,
    edited: false,
    heading: null,
    content: null,
    list: true,
    listData: [],
    listTop: null,
    listMin: null,
    listMax: null,
    listDragging: false,
    listTarget: null,
    notification: false,
    autoDelete: false,
    autoDeleteDelay: 4,
    autoDeleteDelayData: [1, 2, 3, 4, 5, 6, 7],
  },

  submit() {
    var that = this
    wx.showModal({
      title: "注意",
      content: "是否保存更改",
      confirmColor: this.data.primaryColor
    }).then(res => {
      if (res.confirm) {
        if (this.data.id == null) {
          console.log("new")
          //新建
          async function process() {
            try {
              let tempTime = that.data.notificationDate + " " + that.data.notificationTime
              let object = {
                heading: that.data.heading,
                content: that.data.content,
                list: that.data.list,
                listData: that.data.listData,
                notification: that.data.notification,
                notificationTimestamp: Date.parse(tempTime.replace(/-/g, '/')),
                autoDelete: that.data.autoDelete,
                autoDeleteDelay: that.data.autoDeleteDelay,
                timestamp: new Date().getTime(),
              }
              await database.addTask(object)
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
          }
          process()
        } else {
          //修改
          console.log("edit")
          async function process() {
            let tempTime = that.data.notificationDate + " " + that.data.notificationTime
            try {
              await wx.cloud.database().collection('note').doc(app.globalData.id).update({
                data: {
                  [`task.${that.data.id}.heading`]: that.data.heading,
                  [`task.${that.data.id}.content`]: that.data.content,
                  [`task.${that.data.id}.list`]: that.data.list,
                  [`task.${that.data.id}.listData`]: that.data.listData,
                  [`task.${that.data.id}.notification`]: that.data.notification,
                  [`task.${that.data.id}.autoDelete`]: that.data.autoDelete,
                  [`task.${that.data.id}.autoDeleteDelay`]: that.data.autoDeleteDelay,
                  [`task.${that.data.id}.notificationTimestamp`]: Date.parse(tempTime.replace(/-/g, '/')),
                  [`task.${that.data.id}.timestamp`]: new Date().getTime(),
                }
              })
              wx.showToast({
                title: "已保存更改",
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

  delete() {
    var that = this
    if (!this.data.edit) {
      this.showSnackbar("请先启用编辑")
    } else {}
  },

  toUpper() {
    if (this.data.theme == 'light') {
      this.setData({
        headbarStyle: "",
      })
    } else if (this.data.theme == 'dark') {
      this.setData({
        headbarStyle: "",
      })
    }
  },

  scroll() {
    if (this.data.theme == 'light') {
      this.setData({
        headbarStyle: "background:#fff;box-shadow: 0 0rpx 10rpx #bbb;",
      })
    } else if (this.data.theme == 'dark') {
      this.setData({
        headbarStyle: "background:#222426;box-shadow: 0 0rpx 10rpx #222;",
      })
    }
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
      headingNum: e.detail.value.length,
      heading: e.detail.value,
      edited: true,
    })
  },

  contentTap() {},

  contentFocus() {
    this.setData({
      contentStyle: `border-bottom-color:${this.data.primaryColor};`,
      contentNumStyle: `color:${this.data.primaryColor};`
    })
  },

  contentBlur() {
    this.setData({
      contentStyle: "",
      contentNumStyle: "",
    })
  },

  contentInput(e) {
    // console.log(e.detail.value.length);
    // this.data.temp = e.detail.value;
    this.setData({
      contentNum: e.detail.value.length,
      content: e.detail.value,
      edited: true,
    })
  },

  listTap() {
    var that = this
    if (!this.data.edit) {
      this.showSnackbar("请先启用编辑")
    } else {
      this.setData({
        list: this.data.list ? false : true,
        edited: true,
      })
    }
  },

  listInput(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index
    this.setData({
      [`listData[${index}].content`]: e.detail.value,
      edited: true,
    })
  },

  listSwitch(e) {
    if (!this.data.edit) {
      this.showSnackbar("请先启用编辑")
    } else {
      let index = e.currentTarget.dataset.index
      this.setData({
        [`listData[${index}].finished`]: this.data.listData[index].finished ? false : true,
        edited: true,
      })
    }
  },

  listAddItem() {
    if (!this.data.edit) {
      this.showSnackbar("请先启用编辑")
    } else {
      let array = this.data.listData
      array.push({
        content: "",
        top: 0,
        finished: false,
      })
      this.setData({
        listData: array,
        edited: true,
      })
    }
  },

  listDeleteItem(e) {
    let index = e.currentTarget.dataset.index
    let array = this.data.listData
    array.splice(index, 1, )
    this.setData({
      listData: array,
      edited: true,
    })
  },

  dragStart(e) {
    // console.log(e)
    var that = this;
    var index = e.currentTarget.dataset.index;
    var query = wx.createSelectorQuery()
    query.select('.list').boundingClientRect(rect => {
      // console.log(index * (-40), (this.data.listData.length - index - 1) * 40)
      this.setData({
        listTop: rect.top + index * 40,
        listMin: index * (-40),
        listMax: (this.data.listData.length - index - 1) * 40,
        listDragging: true,
        [`listData.[${index}].dragging`]: true
      })
      // console.log(rect.top)
    }).exec()
  },
  dragMove(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var top = this.data.listTop
    var res = e.changedTouches[0].clientY - top - 20
    // console.log(e.changedTouches[0].clientY - top)
    if (res >= this.data.listMin && res <= this.data.listMax) {
      this.setData({
        [`listData[${index}].top`]: res
      })
    }
    // console.log(res)
    let a = res / 40
    if (a > 0) {
      a = Math.ceil(a)
    } else if (a < 0) {
      a = Math.floor(a)
    }
    let b = res % 40
    console.log(res, a, b)
    if (this.data.listData[index + a] && a != 0) {
      if (b > 20) {
        this.setData({
          [`listData[${index+a}].top`]: -40
        })
      } else if (b > 0 && b <= 20) {
        this.setData({
          [`listData[${index+a}].top`]: 0
        })
      } else if (b >= -20 && b < 0) {
        this.setData({
          [`listData[${index+a}].top`]: 0
        })
      } else if (b < -20) {
        this.setData({
          [`listData[${index+a}].top`]: 40
        })
      }
      this.setData({
        listTarget: Math.round(res / 40),
      })
    }
  },
  dragEnd(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    for (let i = 0; i < this.data.listData.length; i++) {
      this.setData({
        [`listData.[${i}].top`]: 0
      })
    }
    this.setData({
      [`listData.[${index}].dragging`]: false,
      listDragging: false
    })
    let data = this.data.listData
    if (this.data.listTarget > 0) {
      for (let i = index; i < index + this.data.listTarget; i++) {
        let temp = data[i]
        data[i] = data[i + 1]
        data[i + 1] = temp
      }
    } else if (this.data.listTarget < 0) {
      for (let i = index; i > index + this.data.listTarget; i--) {
        let temp = data[i]
        data[i] = data[i - 1]
        data[i - 1] = temp
      }
    }
    this.setData({
      listData: data,
      edited: true,
    })
    // let flist = this.data.listData[index];
    // let nlist = this.data.listData[index + this.data.listTarget];
    // this.setData({
    //   [`listData.[${index}]`]: nlist, 
    //   [`listData.[${index + this.data.listTarget}]`]: flist, 
    // })
  },

  pick(e) {
    console.log(e);
    if (e.detail.disabled) {
      this.showSnackbar("请先启用编辑")
    } else {
      this.setData({
        edited: true,
      })
      if (e.currentTarget.dataset.id == "markdownPreviewDelay") {
        this.setData({
          markdownPreviewDelay: e.detail.value
        })
      }else if(e.currentTarget.dataset.id == "notificationDate"){
        this.setData({
          notificationDate: e.detail.value
        })
      }else if(e.currentTarget.dataset.id == "notificationTime"){
        this.setData({
          notificationTime: e.detail.value
        })
      }else if(e.currentTarget.dataset.id == "autoDeleteDelay"){
        this.setData({
          autoDeleteDelay: Number(e.detail.value)
        })
      }
    }
  },

  switch (e) {
    console.log(e);
    if (e.detail.disabled) {
      this.showSnackbar("请先启用编辑")
    } else {
      this.setData({
        edited: true,
      })
      if (e.currentTarget.dataset.id == "notification") {
        this.setData({
          notification: e.detail.value
        })
      } else if (e.currentTarget.dataset.id == "autoDelete") {
        this.setData({
          autoDelete: e.detail.value
        })
      }
    }
  },

  floatTap() {
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
    this.selectAllComponents('.switch').forEach(element => {
      element.refreshStatus()
    })
    this.selectAllComponents('.picker').forEach(element => {
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //重新拉取配置
    this.setData({
      pureTheme: app.globalData.pureTheme,
      isPad: app.globalData.isPad,
      primaryColor: app.globalData.primaryColor,
      rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
    })
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('addTodo', (res) => {
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
    eventChannel.on('toTodo', (res) => {
      // console.log(res.edit)
      this.setData({
        edit: res.edit,
        id: res.data.id,
        heading: res.data.heading,
        content: res.data.content,
        list: res.data.list,
        listData: res.data.listData,
        notification: res.data.notification,
        notificationTimestamp: res.data.notificationTimestamp,
        autoDelete: res.data.autoDelete,
        autoDeleteDelay: res.data.autoDeleteDelay,
        timestamp: res.data.timestamp,
        notificationDate: `${new Date(res.data.notificationTimestamp).getFullYear()}-${time.formatNumber(new Date(res.data.notificationTimestamp).getMonth()+1)}-${time.formatNumber(new Date(res.data.notificationTimestamp).getDate())}`,
        notificationTime: `${time.formatNumber(new Date(res.data.notificationTimestamp).getHours())}:${time.formatNumber(new Date(res.data.notificationTimestamp).getMinutes())}`,
        headingNum: res.data.heading == null ? 0 : res.data.heading.length,
        contentNum: res.data.content == null ? 0 : res.data.content.length,
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
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  onThemeChange: function () {
    console.log(app.globalData.systemInfo.theme)
    this.setData({
      theme: app.globalData.systemInfo.theme
    })
  },
})