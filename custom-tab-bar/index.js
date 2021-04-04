Component({
  properties: {},
  data: {
    primaryColor: getApp().globalData.primaryColor,
  },
  methods: {
    switch(e){
      const path = e.currentTarget.dataset.path;
      wx.switchTab({
        url: path,
      });
    },
  }
})