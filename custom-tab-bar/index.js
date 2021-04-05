Component({
  properties: {},
  data: {
    primaryColor: getApp().globalData.primaryColor,
    rgbaPrimaryColor: getApp().colorRgba(getApp().globalData.primaryColor,.2),
  },
  methods: {
    switch (e) {
      const path = e.currentTarget.dataset.path;
      setTimeout(() => {
        wx.switchTab({
          url: path,
        });
      }, 200);
    },
  }
})