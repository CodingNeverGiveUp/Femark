const app = getApp()
Component({
  properties: {},
  data: {
    touchS: [0, 0],
    touchE: [0, 0],
    currentPage: app.globalData.currentPage,
    primaryColor: app.globalData.primaryColor,
    rgbaPrimaryColor: app.colorRgba(app.globalData.primaryColor, .2),
    useSidebar: app.globalData.useSidebar,
    isPad: app.globalData.isPad,
    mainStyle: "",
    floatStyle: "",
    sidebarStyle: "",
    maskVisible: "display:none;",
    maskStyle: "",
    dialogVisible: "display:none;",
    dialogStyle: "",
    slide: false,
    masked: true,
  },
  methods: {
    showDialog() {
      this.setData({
        maskVisible: "display:block;",
        dialogVisible: "display:block;",
      })
      setTimeout(() => {
        this.setData({
          maskStyle: "opacity:.5;",
          dialogStyle: "transform:scale(1,1);",
        })
      }, 10)
    },
    hideDialog() {
      this.setData({
        maskStyle: "",
        dialogStyle: "",
      })
      setTimeout(() => {
        this.setData({
          maskVisible: "display:none;",
          dialogVisible: "display:none;",
        })
      }, 200)
    },
    back() {
      this.setData({
        mainStyle: "",
        floatStyle: "",
        sidebarStyle: "",
        slide: false,
      })
      this.hideDialog();
    },
    sideSwitch(e) {
      const path = e.currentTarget.dataset.path;
      const page = Number(e.currentTarget.dataset.page);
      const pages = getCurrentPages();
      let formerPage = app.globalData.currentPage;
      // console.log(formerPage, typeof(formerPage))
      // console.log(page, typeof(page))
      this.setData({
        ["sld" + formerPage]: '',
        ["sld" + page]: `color:${this.data.primaryColor};background:${this.data.rgbaPrimaryColor};`,
      })
      setTimeout(() => {
        app.globalData.currentPage = page;
        app.globalData.formerPage = formerPage;
        if ((formerPage == 1 && page == 2) || (formerPage == 2 && page == 1)) {
          this.setData({
            slide: false,
            sidebarStyle: "left:-250px",
          })
          pages[0].setData({
            currentPage: page,
          })
          if (page == 1) {
            pages[0].setData({
              sel1: `color:${this.data.primaryColor};background:${this.data.rgbaPrimaryColor};`,
              sel2: "",
            })
          }
          if (page == 2) {
            pages[0].setData({
              sel1: "",
              sel2: `color:${this.data.primaryColor};background:${this.data.rgbaPrimaryColor};`,
            })
          }
          // this.send(page);
          wx.switchTab({
            url: path,
          });
        } else if (page == formerPage) {
          this.setData({
            slide: false,
            sidebarStyle: "left:-250px",
          })
        } else {
          this.setData({
            ["sld" + page]: '',
          })
          wx.switchTab({
            url: path,
          });
        }
      }, 250);
    },
    switch (e) {
      const path = e.currentTarget.dataset.path;
      const page = Number(e.currentTarget.dataset.page);
      let formerPage = app.globalData.currentPage;
      this.setData({
        mainStyle: "",
        floatStyle: "",
        slide: false,
      })
      setTimeout(() => {
        app.globalData.currentPage = page;
        app.globalData.formerPage = formerPage;
        wx.switchTab({
          url: path,
        });
      }, 500);
    },
    record() {
      if (app.globalData.isPad) {
        this.setData({
          floatAStyle: "transform: rotate(135deg)",
          slide: true,
        })
        this.showDialog();
      } else {
        this.setData({
          mainStyle: "height:250px;",
          floatStyle: (this.data.isPad ? "bottom:210px;" : this.data.useSidebar ? "bottom:210px;" : "bottom:275px;"),
          floatAStyle: "transform: rotate(135deg)",
          slide: true,
        })
      }
    },
    menuTap() {
      if (this.data.slide) {
        this.setData({
          slide: false,
          sidebarStyle: "",
        })
      } else {
        this.setData({
          slide: true,
          sidebarStyle: "left: 0",
        })
      }
    },
    floatTap() {
      if (this.data.slide) {
        this.setData({
          mainStyle: "",
          floatStyle: "",
          floatAStyle: '',
          slide: false,
        })
        this.hideDialog();
      } else {
        if (!this.data.floatSelect) {
          this.setData({
            floatAStyle: "transform: rotate(135deg)",
            floatBStyle: "bottom:80px;width:165px;",
            floatCStyle: "bottom:150px;width:165px;",
            floatSelect: true
          })
        } else {
          this.setData({
            floatAStyle: '',
            floatBStyle: '',
            floatCStyle: '',
            floatSelect: false,
          })
        }
      }
    },

    addNote() {
      var that = this
      wx.navigateTo({
        url: '/pages/note/note',
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          acceptDataFromOpenedPage: function (data) {
            console.log(data)
          },
        },
        success(res) {
          res.eventChannel.emit('addNote', {
            edit: true,
          })
          that.setData({
            floatAStyle: '',
            floatBStyle: '',
            floatCStyle: '',
            floatSelect: false,
          })
        }
      })
    },

    addTodo() {
      var that = this
      wx.navigateTo({
        url: '/pages/todo/todo',
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          acceptDataFromOpenedPage: function (data) {
            console.log(data)
          },
        },
        success(res) {
          res.eventChannel.emit('addNote', {
            edit: true,
          })
          that.setData({
            floatAStyle: '',
            floatBStyle: '',
            floatCStyle: '',
            floatSelect: false,
          })
        }
      })
    },

    touchStart: function (e) {
      // console.log(e.touches[0].pageX)
      let sx = e.touches[0].pageX
      let sy = e.touches[0].pageY
      this.data.touchS = [sx, sy]
    },
    touchMove: function (e) {
      let sx = e.touches[0].pageX;
      let sy = e.touches[0].pageY;
      this.data.touchE = [sx, sy]
    },
    touchEnd: function (e) {
      let start = this.data.touchS
      let end = this.data.touchE
      console.log(start)
      console.log(end)
      if (start[1] < end[1] - 70) {
        console.log('下滑')
        this.setData({
          mainStyle: "",
          floatStyle: "",
          slide: false
        })
      } else if (start[1] > end[1] + 70) {
        console.log('上滑')
        if (app.globalData.isPad) {

        } else {
          this.setData({
            mainStyle: "height:250px;",
            floatStyle: (this.data.isPad ? "bottom:210px;" : this.data.useSidebar ? "bottom:210px;" : "bottom:275px;"),
            slide: true,
          })
        }
      } else {
        console.log('静止')
      }
    },
    // send(data) {
    //   // console.log("clicked");
    //   app.setChangedData(data);
    // },
  }
})