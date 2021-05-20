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
    theme: app.globalData.systemInfo.theme,
    mainStyle: "",
    floatStyle: "",
    sidebarStyle: "",
    // maskVisible: "display:none;",
    // maskStyle: "",
    // dialogVisible: "display:none;",
    // dialogStyle: "",
    slide: false,
    // masked: true,
    password: '',
    correctPassword: '',
    popupPassword: false,
    popupPasswordIf: false,
    popCategoryEdit: false,
    popCategoryEditIf: false,
    popupRecord: false,
    popupRecordIf: false,
    useFingerprint: false,
    fingerprintContent: "请触摸指纹传感器",
    listData: [],
    uploadVideo: true,
  },
  methods: {
    // showDialog() {
    //   this.setData({
    //     maskVisible: "display:block;",
    //     dialogVisible: "display:block;",
    //   })
    //   setTimeout(() => {
    //     this.setData({
    //       maskStyle: "opacity:.5;",
    //       dialogStyle: "transform:scale(1,1);",
    //     })
    //   }, 10)
    // },
    // hideDialog() {
    //   this.setData({
    //     maskStyle: "",
    //     dialogStyle: "",
    //   })
    //   setTimeout(() => {
    //     this.setData({
    //       maskVisible: "display:none;",
    //       dialogVisible: "display:none;",
    //     })
    //   }, 200)
    // },
    // back() {
    //   this.setData({
    //     mainStyle: "",
    //     floatStyle: "",
    //     sidebarStyle: "",
    //     slide: false,
    //   })
    //   this.hideDialog();
    // },

    initializeListData() {
      let array = app.globalData.categoryData.slice(1, );
      let result = [];
      this.setData({
        defaultContent: app.globalData.categoryData[0]
      })
      array.forEach((element, index, array) => {
        let object = {
          content: element,
          top: 0,
        }
        result.push(object)
      })
      this.setData({
        listData: result,
        popCategoryEditIf: true
      })
      setTimeout(() => {
        this.setData({
          popCategoryEdit: true,
        })
      }, 100)
    },

    listInput(e) {
      console.log(e)
      let index = e.currentTarget.dataset.index
      this.setData({
        [`listData[${index}].content`]: e.detail.value,
      })
    },

    listAddItem() {
      let array = this.data.listData
      array.push({
        content: "",
        top: 0,
      })
      this.setData({
        listData: array,
      })
    },

    listDeleteItem(e) {
      let index = e.currentTarget.dataset.index
      let array = this.data.listData
      array.splice(index, 1, )
      this.setData({
        listData: array,
      })
    },

    defaultListInput(e) {
      this.setData({
        defaultContent: e.detail.value,
      })
    },

    listCancel() {
      this.setData({
        popCategoryEdit: false
      })
    },

    listConfirm() {
      wx.showLoading({
        title: '操作中',
        mask: true
      })
      let result = [this.data.defaultContent]
      this.data.listData.forEach((element, index) => {
        result.push(element.content)
      })
      wx.cloud.database().collection('note').doc(app.globalData.id).update({
        data: {
          profile: {
            categoryData: result
          }
        }
      }).then(res => {
        app.globalData.categoryData = this.data.listData;
        this.listCancel()
        wx.showToast({
          title: '已保存',
        })
      }).catch(err => {
        wx.showToast({
          title: '网络错误',
          icon: "error"
        })
      })
    },

    dragStart(e) {
      // console.log(e)
      var that = this;
      var index = e.currentTarget.dataset.index;
      var query = this.createSelectorQuery()
      query.select('.list').boundingClientRect(rect => {
        // console.log(index * (-40), (this.data.listData.length - index - 1) * 40)
        this.setData({
          listTop: rect.top + index * 40,
          listMin: index * (-40),
          listMax: (this.data.listData.length - index - 1) * 40,
          listDragging: true,
          [`listData.[${index}].dragging`]: true
        })
        // console.log(rect.top)
      }).exec()
    },
    dragMove(e) {
      var that = this;
      var index = e.currentTarget.dataset.index;
      var top = this.data.listTop
      // console.log(e.changedTouches)
      var res = e.changedTouches[0].clientY - top - 100
      // console.log(e.changedTouches[0].clientY - top)
      if (res >= this.data.listMin && res <= this.data.listMax) {
        this.setData({
          [`listData[${index}].top`]: res
        })
      }
      // console.log(res)
      let a = res / 40
      if (a > 0) {
        a = Math.ceil(a)
      } else if (a < 0) {
        a = Math.floor(a)
      }
      let b = res % 40
      // console.log(res, a, b)
      if (this.data.listData[index + a] && a != 0) {
        if (b > 20) {
          this.setData({
            [`listData[${index+a}].top`]: -40
          })
        } else if (b > 0 && b <= 20) {
          this.setData({
            [`listData[${index+a}].top`]: 0
          })
        } else if (b >= -20 && b < 0) {
          this.setData({
            [`listData[${index+a}].top`]: 0
          })
        } else if (b < -20) {
          this.setData({
            [`listData[${index+a}].top`]: 40
          })
        }
        this.setData({
          listTarget: Math.round(res / 40),
        })
      }
    },
    dragEnd(e) {
      var that = this;
      var index = e.currentTarget.dataset.index;
      for (let i = 0; i < this.data.listData.length; i++) {
        this.setData({
          [`listData.[${i}].top`]: 0
        })
      }
      this.setData({
        [`listData.[${index}].dragging`]: false,
        listDragging: false
      })
      let data = this.data.listData
      if (this.data.listTarget > 0) {
        for (let i = index; i < index + this.data.listTarget; i++) {
          let temp = data[i]
          data[i] = data[i + 1]
          data[i + 1] = temp
        }
      } else if (this.data.listTarget < 0) {
        for (let i = index; i > index + this.data.listTarget; i--) {
          let temp = data[i]
          data[i] = data[i - 1]
          data[i - 1] = temp
        }
      }
      this.setData({
        listData: data,
        edited: true,
      })
      // let flist = this.data.listData[index];
      // let nlist = this.data.listData[index + this.data.listTarget];
      // this.setData({
      //   [`listData.[${index}]`]: nlist, 
      //   [`listData.[${index + this.data.listTarget}]`]: flist, 
      // })
    },

    setting() {
      wx.navigateTo({
        url: '/pages/themeSetting/themeSetting',
      })
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
      var that = this
      this.setData({
        floatAStyle: '',
        floatBStyle: '',
        floatCStyle: '',
        floatDStyle: '',
        floatSelect: false,
      })
      this.popupRecord()
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
          // mainStyle: "",
          floatStyle: "",
          floatAStyle: '',
          slide: false,
        })
        // this.hideDialog();
      } else {
        if (!this.data.floatSelect) {
          if (this.data.currentPage == 1 || this.data.currentPage == 2) {
            this.setData({
              floatAStyle: "transform: rotate(135deg)",
              floatBStyle: "bottom:80px;width:165px;",
              floatCStyle: "bottom:150px;width:165px;",
              floatDStyle: "bottom:220px;width:165px;",
              floatSelect: true
            })
          } else if (this.data.currentPage == 3) {
            //编辑类别
            this.initializeListData()
          }
        } else {
          this.setData({
            floatAStyle: '',
            floatBStyle: '',
            floatCStyle: '',
            floatDStyle: '',
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
          res.eventChannel.emit('addTodo', {
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

    popupRecord() {
      this.setData({
        popCategoryEditIf: false,
        popupPasswordIf: false,
        popupRecordIf: true,
      })
      setTimeout(() => {
        this.setData({
          popupRecord: true,
        })
      }, 100)
    },
    popupPassword(e) {
      this.setData({
        popCategoryEditIf: false,
        popupPasswordIf: true,
      })
      setTimeout(() => {
        this.setData({
          data: e,
          popupPassword: true,
        })
      }, 100)
    },

    passwordFocus() {
      this.setData({
        contentInputStyle: `border: 2px solid ${this.data.primaryColor};`,
        contentPlaceholderStyle: `top: -10px;transform: scale(.8);color:${this.data.primaryColor};`
      })
    },

    passwordInput(e) {
      // console.log(e)
      this.setData({
        password: e.detail.value
      })
    },

    passwordBlur() {
      if (this.data.password != "") {
        this.setData({
          contentInputStyle: '',
          contentPlaceholderStyle: `top: -10px;transform: scale(.8);`
        })
      } else {
        this.setData({
          contentInputStyle: '',
          contentPlaceholderStyle: '',
        })
      }
    },

    videoSwitch(){
      this.setData({
        uploadVideo : this.data.uploadVideo ? false : true,
      })
    },

    passwordSwitch() {
      if (this.data.useFingerprint) {
        this.setData({
          useFingerprint: false
        })
      } else {
        this.startAuth()
        this.setData({
          useFingerprint: true
        })
      }
      // this.setData({
      //   useFingerprint: this.data.useFingerprint ? false : true,
      // })
    },

    encryptToNote() {
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
          res.eventChannel.emit('toNote', {
            edit: false,
            data: that.data.data
          })
          that.setData({
            useFingerprint: false,
            fingerprintContent: "请触摸指纹传感器",
          })
          that.deleteContainer()
        }
      })
    },

    passwordConfirm() {
      var that = this
      if (this.data.password == this.data.data.password) {
        this.encryptToNote()
        this.setData({
          password: '',
        })
      } else {
        this.setData({
          contentInputStyle: `border: 2px solid #ff5252;`
        })
      }
    },

    startAuth(e) {
      const startSoterAuthentication = () => {
        wx.startSoterAuthentication({
          requestAuthModes: ['fingerPrint'],
          challenge: 'femark',
          authContent: '请触摸指纹传感器',
          success: (res) => {
            this.setData({
              fingerprintContent: "认证成功"
            })
            setTimeout(() => {
              this.encryptToNote()
            }, 500)
          },
          fail: (err) => {
            console.error(err)
            this.setData({
              fingerprintContent: "认证失败"
            })
          }
        })
      }

      const checkIsEnrolled = () => {
        wx.checkIsSoterEnrolledInDevice({
          checkAuthMode: 'fingerPrint',
          success: (res) => {
            console.log(res)
            if (parseInt(res.isEnrolled) <= 0) {
              this.setData({
                fingerprintContent: "没有找到指纹信息，请录入后重试"
              })
              return
            }
            startSoterAuthentication();
          },
          fail: (err) => {
            this.setData({
              fingerprintContent: "你的设备未接入 SOTER 生物认证平台"
            })
            console.error(err)
          }
        })
      }

      wx.checkIsSupportSoterAuthentication({
        success: (res) => {
          console.log(res)
          checkIsEnrolled()
        },
        fail: (err) => {
          console.error(err)
          this.setData({
            fingerprintContent: "你的设备不支持指纹识别"
          })
        }
      })
    },

    deleteContainer(){
      setTimeout(() => {
        this.setData({
          popCategoryEditIf: false,
          popupPasswordIf: false,
          popupRecordIf: false,
        })
      }, 100);
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
      // console.log(start)
      // console.log(end)
      if (start[1] < end[1] - 70) {
        // console.log('下滑')
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