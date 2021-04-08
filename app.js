// app.js
App({
  onLaunch() {
    //注册云开发
    wx.cloud.init({
      env: "suiyi-5goxhr285fd1f64b",
    })

    //获取openid
    wx.cloud.callFunction({
        name: "getOpenid"
      }).then(res => {
        console.log(res);
        this.globalData.openid = res.result.openid;
      })
      .catch(res => {
        console.log("failed")
      })

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
    if (systemInfo.windowWidth > 375) {
      this.globalData.isPad = true;
    }
  },

  onThemeChange() {},

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
  //跨页面异步传递
  addListener(callback) {
    this.callback = callback;
  },

  setChangedData(data) {
    this.data = data;
    if (this.callback != null) {
      this.callback(data)
    }
  },

  globalData: {
    userInfo: null,
    primaryColor: "#4285f4",
    openid: null,
    systemInfo: null,
    isPad: false,
    useSidebar: false,
  }
})