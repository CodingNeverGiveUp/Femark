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
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _onTap() {},
  },

  // 生命周期函数
  lifetimes: {
    attached: function () {
      this.setData({
        result: this.data.dataset[0],
      })
    },
  }
})
