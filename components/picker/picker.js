// components/picker/picker.js
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
    dataset: {
      type: Array,
      value: [],
    },
    disabled: {
      type: Boolean,
      value: false,
    },
    selected: {
      type: Number,
      value: 0,
    },
    mode: {
      type: String,
      value: "selector"
    },
    result: {
      type: String,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    result: null,
    resultKey: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _onTap() {
      var detail = {
        value: this.data.result,
        valueKey: this.data.resultKey,
        disabled: this.data.disabled
      };
      var option = {};
      this.triggerEvent('pick', detail, option);
    },
    _change(e) {
      // console.log(e.detail.value)
      if(this.data.mode == 'selector'){
        this.setData({
          resultKey: Number(e.detail.value),
          result: this.data.dataset[e.detail.value],
        })
      }else if(this.data.mode == 'date' || this.data.mode == 'time'){
        this.setData({
          result: e.detail.value
        })
      }
      var detail = {
        value: this.data.result,
        valueKey: this.data.resultKey,
        disabled: this.data.disabled,
      };
      var option = {};
      this.triggerEvent('pick', detail, option);
    },
    refreshStatus() {
      if (this.data.disabled) {
        if (getApp().globalData.systemInfo.theme == "dark") {
          this.setData({
            selectedStyle: "color:#ccc;"
          })
        } else if (getApp().globalData.systemInfo.theme == "light") {
          this.setData({
            selectedStyle: "color:#666;"
          })
        }
      } else {
        this.setData({
          selectedStyle: "",
        })
      }
      if(this.data.mode == 'selector'){
        this.setData({
          result: this.data.dataset[this.data.selected],
          resultKey: this.data.selected,
        })
      }
    },
  },

  // 生命周期函数
  lifetimes: {
    attached: function () {
      const time = require("../../utils/util.js")
      if(this.data.mode == 'selector'){
        this.setData({
          result: this.data.dataset[this.data.selected],
          resultKey: this.data.selected,
        })
      }else if(this.data.mode == 'date'){
        if(this.data.result == ""){
          let str = `${new Date().getFullYear()}-${time.formatNumber(new Date().getMonth()+1)}-${time.formatNumber(new Date().getDate())}`
          // console.log(str)
          this.setData({
            // selected: str,
            result: str
          })
        }
      }else if(this.data.mode == 'time'){
        if(this.data.result == ""){
          let str = `${time.formatNumber(new Date().getHours())}:${time.formatNumber(new Date().getMinutes())}`
          // console.log(str)
          this.setData({
            // selected: str,
            result: str
          })
        }
      }
      // console.log(getApp().globalData.systemInfo.theme)
      if (this.data.disabled) {
        if (getApp().globalData.systemInfo.theme == "dark") {
          this.setData({
            selectedStyle: "color:#ccc;"
          })
        } else if (getApp().globalData.systemInfo.theme == "light") {
          this.setData({
            selectedStyle: "color:#666;"
          })
        }
      } else {
        this.setData({
          selectedStyle: ""
        })
      }
    },
  }
})