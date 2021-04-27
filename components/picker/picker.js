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
      // var detail = {
      //   value: this.data.result,
      // };
      // var option = {};
      // this.triggerEvent('pick', detail, option);
    },
    _change(e){
      // console.log(e.detail.value)
      this.setData({
        resultKey: Number(e.detail.value),
        result: this.data.dataset[e.detail.value],
      })
      var detail = {
        value: this.data.result,
        valueKey: this.data.resultKey,
      };
      var option = {};
      this.triggerEvent('pick', detail, option);
    }
  },

  // 生命周期函数
  lifetimes: {
    attached: function () {
      this.setData({
        result: this.data.dataset[this.data.selected],
        resultKey: this.data.selected,
      })
      // console.log(getApp().globalData.systemInfo.theme)
      if(this.data.disabled){
        if(getApp().globalData.systemInfo.theme == "dark"){
          this.setData({
            selectedStyle: "color:#ccc;"
          })
        }else if(getApp().globalData.systemInfo.theme == "light"){
          this.setData({
            selectedStyle: "color:#666;"
          })
        }
      }
    },
  }
})
