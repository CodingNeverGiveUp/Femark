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
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
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
      this.setData({
        data: changedData,
      })
      console.log(changedData);
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
    //拉取选中状态
    setTimeout(()=>{
      let tabbar = this.getTabBar()
      tabbar.setData({
        btn1: `color:${this.data.primaryColor}`,
        sidebarStyle: "left:-250px",
      })
    },500)
    //拉取强调色
    if (app.globalData.primaryColor) {
      this.setData({
        primaryColor: app.globalData.primaryColor
      })
    }
  },

  onShow() {
    let tabbar = this.getTabBar()
    tabbar.setData({
      btn1: `color:${this.data.primaryColor}`,
      sidebarStyle: "left:-250px",
    })
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
  }
})