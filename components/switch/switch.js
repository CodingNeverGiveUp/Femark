// utils/components/switch/switch.js
Component({
  externalClasses: ['theme_color'],
  options: {
    multipleSlots: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    selected: false,
    primaryColor: getApp().globalData.primaryColor,
    rgbaPrimaryColor: getApp().colorRgba(getApp().globalData.primaryColor, .2),
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _onTap() {
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
    },
  }
})