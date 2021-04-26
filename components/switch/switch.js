// utils/components/switch/switch.js
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
    selected: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    _onTap() {
      if (!this.data.disabled) {
        if (this.data.selected) {
          this.setData({
            selected: false,
            bar: "background:#9e9e9e;",
            dot: "right:17px;background:#fff;"
          })
        } else {
          this.setData({
            selected: true,
            bar: `background:${this.data.rgbaPrimaryColor};`,
            dot: `right:0;background:${this.data.primaryColor};`
          })
        }
        var detail = {
          value: this.data.selected,
        };
        var option = {};
        this.triggerEvent('switch', detail, option);
      }
    },
  },

  // 生命周期函数
  lifetimes: {
    attached: function () {
      if (this.data.disabled) {
        if (this.data.selected) {
          this.setData({
            bar: "background:#e0e0e0;",
            dot: "right:0;background:#bdbdbd;"
          })
        } else {
          this.setData({
            bar: "background:#e0e0e0;",
            dot: "right:17px;background:#bdbdbd;"
          })
        }
      } else {
        if(this.data.selected){
          this.setData({
            bar: `background:${this.data.rgbaPrimaryColor};`,
            dot: `right:0;background:${this.data.primaryColor};`
          })
        }else{
          this.setData({
            bar: "background:#9e9e9e;",
            dot: `right:17px;background:#fff;`
          })
        }
      }
    },
  },
  // 数据监听器
  observers: {},
})