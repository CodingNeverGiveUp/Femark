// components/input/input.js
Component({
  externalClasses: [],
  options: {
    multipleSlots: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    primaryColor: {
      type: String,
      value: getApp().globalData.primaryColor,
    },
    rgbaPrimaryColor: {
      type: String,
      value: getApp().colorRgba(getApp().globalData.primaryColor, .2)
    },
    disabled: {
      type: Boolean,
      value: false,
    },
    value: {
      type: String,
      value: "",
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    result: null,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _onTap() {
      if (!this.data.disabled) {
        wx.showModal({
          editable: true,
          title: "设置密码",
          content: this.data.value,
          confirmColor: this.data.primaryColor
        }).then(res => {
          if (res.confirm) {
            let pattern = /^\w{1,8}$/
            pattern.lastIndex = 0; //巨坑
            if (pattern.test(res.content)) {
              pattern.lastIndex = 0; //巨坑
              this.setData({
                result: res.content
              })
              var detail = {
                disabled: this.data.disabled,
                value: this.data.result,
              };
              var option = {};
              this.triggerEvent('input', detail, option);
            } else {
              pattern.lastIndex = 0; //巨坑
              wx.showModal({
                title: "仅允许1-8位数字/字母密码",
                confirmColor: this.data.primaryColor,
                confirmText: "重试",
              }).then(res => {
                if (res.confirm) {
                  this._onTap()
                }
              })
            }
          }
        })
      }
    },
    refreshStatus() {
      if (this.data.disabled) {
        if (getApp().globalData.systemInfo.theme == "dark") {
          this.setData({
            inputStyle: "color:#ccc;"
          })
        } else if (getApp().globalData.systemInfo.theme == "light") {
          this.setData({
            inputStyle: "color:#666;"
          })
        }
      } else {
        this.setData({
          inputStyle: '',
        })
      }
    },
  },
  lifetimes: {
    attached: function () {
      this.setData({
        result: this.data.value
      })
      if (this.data.disabled) {
        if (getApp().globalData.systemInfo.theme == "dark") {
          this.setData({
            inputStyle: "color:#ccc;"
          })
        } else if (getApp().globalData.systemInfo.theme == "light") {
          this.setData({
            inputStyle: "color:#666;"
          })
        }
      } else {
        this.setData({
          inputStyle: '',
        })
      }
    }
  }
})