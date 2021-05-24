const app = getApp()
//添加用户数组
function addArray(profile) {
  return new Promise((resolve, reject) => {
    profile.timestamp = new Date().getTime()
    const _ = wx.cloud.database().command
    wx.cloud.database().collection('note').add({
      data: {
        'note': [{
          category: 0,
          content: "Markdown 是什么？它有什么用？为什么要使用它？\n\n简单来说，Markdown 是一种轻量级标记语言，常用于文章排版。\n\n就这？我们已经有了功能更为强大，系统更为成熟的Word，可以直观地编辑我希望的任何细节，还要这 Markdown 有何用？你也许会这样想。\n\n确实，若仅仅为了排版，我们确实有更多的选择。但不难注意到，排版是一项复杂度不亚于写作本身的工作。在撰写一篇文稿后，你还要专门腾出一段时间，大费周章地调节字号，调整段落，添加注释，更改序号……相信你也遭受过类似的不愉快的经历。\n\nMarkdown 的神奇之处在于它重新合并了这两项工作。它可以使用简单的字符在写作的同时完成排版，让你专注于写作而不是纠结于排版。请相信，只要你使用过它，你就会爱上它。且看：\n\n---\n\n- 使用不同数量的井号`#`来设置不同层级的\n\n## 标题\n\n### 副标题\n\n使用 `*`，`~`  等简单符号的组合做到**加粗**，*斜体*，~~删除线~~。\n\n使用大于号`>`将文字转变为\n\n>引用\n\n使用一个短横`-`添加无序列表项，甚至还可以嵌套。\n\n- 1\n- - 1.1\n- 2\n- 3\n\n使用三个短横`---`添加分割线\n\n---\n\n以上只是 Markdown 语法中的一部分。它还可以实现诸如插入图片，表格，代码块，超链接等功能。如果希望系统地了解 Markdown 语法，可以访问 [这个链接](https://www.runoob.com/markdown/md-tutorial.html)。\n\n非常感谢 Toobug 的努力，他的 wemark 项目将 Markdown 带到了小程序平台！现在，你就可以使用 Femark 感受 Markdown 的神奇魔力。要在你的笔记上启用 Markdown 模式，仅需要在左侧控制栏启用【Markdown 模式】项。当然，如果你愿意将 Markdown 作为你的默认文章格式，你也可以在功能设置中启用【默认使用 Markdown】项。\n",
          contentDelta: {
            ops: [{
              insert: "Markdown 是什么？它有什么用？为什么要使用它？\n\n简单来说，Markdown 是一种轻量级标记语言，常用于文章排版。\n\n就这？我们已经有了功能更为强大，系统更为成熟的Word，可以直观地编辑我希望的任何细节，还要这 Markdown 有何用？你也许会这样想。\n\n确实，若仅仅为了排版，我们确实有更多的选择。但不难注意到，排版是一项复杂度不亚于写作本身的工作。在撰写一篇文稿后，你还要专门腾出一段时间，大费周章地调节字号，调整段落，添加注释，更改序号……相信你也遭受过类似的不愉快的经历。\n\nMarkdown 的神奇之处在于它重新合并了这两项工作。它可以使用简单的字符在写作的同时完成排版，让你专注于写作而不是纠结于排版。请相信，只要你使用过它，你就会爱上它。且看：\n\n---\n\n- 使用不同数量的井号`#`来设置不同层级的\n\n## 标题\n\n### 副标题\n\n使用 `*`，`~`  等简单符号的组合做到**加粗**，*斜体*，~~删除线~~。\n\n使用大于号`>`将文字转变为\n\n>引用\n\n使用一个短横`-`添加无序列表项，甚至还可以嵌套。\n\n- 1\n- - 1.1\n- 2\n- 3\n\n使用三个短横`---`添加分割线\n\n---\n\n以上只是 Markdown 语法中的一部分。它还可以实现诸如插入图片，表格，代码块，超链接等功能。如果希望系统地了解 Markdown 语法，可以访问 [这个链接](https://www.runoob.com/markdown/md-tutorial.html)。\n\n非常感谢 Toobug 的努力，他的 wemark 项目将 Markdown 带到了小程序平台！现在，你就可以使用 Femark 感受 Markdown 的神奇魔力。要在你的笔记上启用 Markdown 模式，仅需要在左侧控制栏启用【Markdown 模式】项。当然，如果你愿意将 Markdown 作为你的默认文章格式，你也可以在功能设置中启用【默认使用 Markdown】项。\n"
            }]
          },
          encrypt: false,
          files: [],
          gallery: [],
          heading: "关于 Markdown 的一些说明",
          imgTimeStamps: [],
          password: "",
          timestamp: 1621785600000,
          useMarkdown: true,
          voices: [],
        }, {
          category: 0,
          content: "\n很高兴与你相遇！\n\nFemark 是一款运行于微信小程序平台的轻量简洁的笔记应用。据统计，微信在2020年的月活用户已达12.5亿，微信小程序俨然成为重要的应用平台之一。我们充分利用微信小程序免安装，云同步特性，致力于将流畅舒适的笔记体验带到小程序平台。\n\nFemark 带来了媲美甚至优于本地App的笔记体验。你可以使用富文本编辑器轻松更改样式，插入图片，调整排版；你可以随心所欲地添加附件，随时查看/预览和下载；你还可以使用分享功能，将文字优雅地分享到社交圈；你甚至可以启用Markdown，并通过简单的滑动操作来同步预览。语音识别，录音，分类管理，OCR，密码保护，指纹解锁，提醒……笔记应用该有的功能，Femark 一个不落如数奉上。\n\nFemark 在流畅体验上下了很大功夫。它无处不充斥着细微的交互动画，给予用户及时而准确的反馈；它拥有亮/暗两套配色，可根据系统设置自动切换；它适配多分辨率，无论是在手机或平板，都能得到类似的浏览效果；它珍视你的灵光一现。长按Fab启动的【速记】，通过语音识别，能够在短短数秒间将你的想法转变为文字。此外，还有太多的使用细节等待你去发掘。当你对比使用其他笔记应用，你才会发现 Femark 做得如此精致，细致入微。\n\nFemark 坚守风格，而又强调个性。Femark 保持了简约的设计风格， 遵循 Material Design 设计规范，大量运用圆角，阴影和卡片设计，充满活力；但这并不妨碍用户彰显自己的个性。它同时提供两套主题，允许自定义强调色，还允许自定义一部分界面元素。这一切，都只为了贴合用户偏好，在保证易用性的同时做到美观。\n\n万千世界，故事很多，风景很美。稿纸已经为你铺好。从现在开始，享受写作，记录身边的故事与风景吧。\n",
          contentDelta: {
            ops: [{
              insert: "\n"
            }, {
              attributes: {
                "data-custom": "timestamp=1621785600000",
                "data-local": "",
                "width": "80%"
              },
              insert: {
                "image": "https://7375-suiyi-5goxhr285fd1f64b-1305453934.tcb.qcloud.la/image/kelly-sikkema-Oz_J_FXKvIs-unsplash.jpg"
              }
            }, {
              attributes: {
                "align": "center"
              },
              insert: "\n"
            }, {
              insert: "很高兴与你相遇！\n\nFemark 是一款运行于微信小程序平台的轻量简洁的笔记应用。据统计，微信在2020年的月活用户已达12.5亿，微信小程序俨然成为重要的应用平台之一。我们充分利用微信小程序免安装，云同步特性，致力于将流畅舒适的笔记体验带到小程序平台。\n\nFemark 带来了媲美甚至优于本地App的笔记体验。你可以使用富文本编辑器轻松更改样式，插入图片，调整排版；你可以随心所欲地添加附件，随时查看/预览和下载；你还可以使用分享功能，将文字优雅地分享到社交圈；你甚至可以启用Markdown，并通过简单的滑动操作来同步预览。语音识别，录音，分类管理，OCR，密码保护，指纹解锁，提醒……笔记应用该有的功能，Femark 一个不落如数奉上。\n\nFemark 在流畅体验上下了很大功夫。它无处不充斥着细微的交互动画，给予用户及时而准确的反馈；它拥有亮/暗两套配色，可根据系统设置自动切换；它适配多分辨率，无论是在手机或平板，都能得到类似的浏览效果；它珍视你的灵光一现。长按Fab启动的【速记】，通过语音识别，能够在短短数秒间将你的想法转变为文字。此外，还有太多的使用细节等待你去发掘。当你对比使用其他笔记应用，你才会发现 Femark 做得如此精致，细致入微。\n\nFemark 坚守风格，而又强调个性。Femark 保持了简约的设计风格， 遵循 Material Design 设计规范，大量运用圆角，阴影和卡片设计，充满活力；但这并不妨碍用户彰显自己的个性。它同时提供两套主题，允许自定义强调色，还允许自定义一部分界面元素。这一切，都只为了贴合用户偏好，在保证易用性的同时做到美观。\n\n万千世界，故事很多，风景很美。稿纸已经为你铺好。从现在开始，享受写作，记录身边的故事与风景吧。\n\n"
            }]
          },
          encrypt: false,
          files: [],
          gallery: [{
            fileID: "cloud://suiyi-5goxhr285fd1f64b.7375-suiyi-5goxhr285fd1f64b-1305453934/image/kelly-sikkema-Oz_J_FXKvIs-unsplash.jpg",
            fromContent: true,
            src: "https://7375-suiyi-5goxhr285fd1f64b-1305453934.tcb.qcloud.la/image/kelly-sikkema-Oz_J_FXKvIs-unsplash.jpg",
            timestamp: "1621785600000"
          }],
          heading: "记录身边的故事与风景",
          imgTimeStamps: ["1621785600000"],
          password: "",
          timestamp: 1621785600000,
          useMarkdown: false,
          voices: [],
        }],
        'task': [],
        'profile': profile,
      }
    }).then(res => {
      resolve();
    }).catch(err => {
      reject();
    })
  })
}

function uploadImg(imgs) {
  function upload(element, index, array) {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: `图片（${index+1}/${array.length}）`,
        mask: true
      })
      let cloudpath = `image/${app.globalData.openid}/${new Date().getTime()}.jpg`;
      wx.cloud.uploadFile({
        cloudPath: cloudpath,
        filePath: element.src
      }).then(res => {
        // wx.hideLoading()
        element.fileID = res.fileID
        resolve()
      }).catch(err => {
        reject()
      })
    })
  }
  return new Promise((resolve, reject) => {
    async function action() {
      for (let i = 0; i < imgs.length; i++) {
        try {
          await upload(imgs[i], i, imgs)
        } catch {
          console.log("upload failed")
          reject()
        }
        if (i == imgs.length - 1) {
          console.log("upload finished")
          // wx.hideLoading()
          resolve()
        }
      }
    }
    action()
    // imgs.paths.forEach(async (element, index, array) => {})
  })
}

function uploadFile(files) {
  function upload(element, index, array) {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: `文件（${index+1}/${array.length}）`,
        mask: true
      })
      let cloudpath = `file/${app.globalData.openid}/${new Date().getTime()}_${element.name}`;
      wx.cloud.uploadFile({
        cloudPath: cloudpath,
        filePath: element.path
      }).then(res => {
        element.fileID = res.fileID
        resolve()
      }).catch(err => {
        reject()
      })
    })
  }
  return new Promise((resolve, reject) => {
    async function action() {
      for (let i = 0; i < files.length; i++) {
        try {
          await upload(files[i], i, files)
        } catch {
          console.log("upload failed")
          reject()
        }
        if (i == files.length - 1) {
          console.log("upload finished")
          // wx.hideLoading()
          resolve()
        }
      }
    }
    action()
  })
}

function uploadVoice(voices) {
  function upload(element, index, array) {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: `录音（${index+1}/${array.length}）`,
        mask: true
      })
      let cloudpath = `voice/${app.globalData.openid}/${new Date().getTime()}_${element.name}`;
      wx.cloud.uploadFile({
        cloudPath: cloudpath,
        filePath: element.tempFilePath
      }).then(res => {
        element.fileID = res.fileID
        resolve()
      }).catch(err => {
        reject()
      })
    })
  }
  return new Promise((resolve, reject) => {
    async function action() {
      for (let i = 0; i < voices.length; i++) {
        try {
          await upload(voices[i], i, voices)
        } catch {
          console.log("upload failed")
          reject()
        }
        if (i == voices.length - 1) {
          console.log("upload finished")
          // wx.hideLoading()
          resolve()
        }
      }
    }
    action()
  })
}

function idToUrl(array) {
  return new Promise(async (resort, reject) => {
    try {
      for (let i = 0; i < array.length; i++) {
        await wx.cloud.getTempFileURL({
          fileList: [array[i].fileID]
        }).then(res => {
          array[i].src = res.fileList[0].tempFileURL
        })
      }
      resort()
    } catch (e) {
      console.log(e)
      reject()
    }
  })
}

function addNote(object) {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: `数据处理中`,
      mask: true
    })
    const _ = wx.cloud.database().command
    wx.cloud.database().collection('note').where({
        _openid: app.globalData.openid
      }).get()
      .then(res => {
        let id = res.data[0]._id
        // var timestamp = new Date().getTime();
        // console.log(res)
        wx.cloud.database().collection('note').doc(id).update({
            data: {
              'note': _.push(object),
            }
          })
          .then(res => {
            // wx.hideLoading()
            resolve()
          })
          .catch(err => {
            reject()
          })
      }).catch(err => {
        reject()
      })
  })
}


function addTask(object) {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: `数据处理中`,
      mask: true
    })
    const _ = wx.cloud.database().command
    wx.cloud.database().collection('note').where({
        _openid: app.globalData.openid
      }).get()
      .then(res => {
        let id = res.data[0]._id
        // var timestamp = new Date().getTime();
        // console.log(res)
        wx.cloud.database().collection('note').doc(id).update({
            data: {
              'task': _.push(object),
            }
          })
          .then(res => {
            // wx.hideLoading()
            resolve()
          })
          .catch(err => {
            reject()
          })
      }).catch(err => {
        reject()
      })
  })
}

//添加测试待办
const addTask2 = (tasktitle, tasktime, taskurgency, taskcontent, taskreminderStatus, ifDone) => {
  const _ = wx.cloud.database().command
  var currenttime = (new Date()).valueOf();
  wx.cloud.database().collection('task').add({
    data: {
      title: tasktitle,
      time: tasktime,
      urgency: taskurgency,
      content: taskcontent,
      reminderStatus: taskreminderStatus,
      remindTime: currenttime,
      done: ifDone,
    }
  })
}

//添加待办数据
// const addTask = (taskDate, taskContent, taskTitle, taskType) => {
//   const _ = wx.cloud.database().command
//   wx.cloud.database().collection('note').where({
//       _openid: "oxY3r5W1q6qmHTczqCMHbpYc6TCk"
//     }).get()
//     .then(res => {
//       let id = res.data[0]._id
//       var timestamp = new Date().getTime();
//       console.log(res)
//       wx.cloud.database().collection('note').doc(id).update({
//         data: {
//           'task': _.push({
//             "content": taskContent,
//             "date": taskDate,
//             "title": taskTitle,
//             "type": taskType,
//             "time": timestamp,
//           }),
//         }
//       })
//     })
// }

//删除待办数据 //pull方法不懂，没做出来
const deleteTask = () => {
  const _ = wx.cloud.database().command
  wx.cloud.database().collection('note').where({
      _openid: "oxY3r5W1q6qmHTczqCMHbpYc6TCk"
    }).get()
    .then(res => {
      let id = res.data[0]
      let timesearch = res.data[0].task[1].time
      console.log(id)
      console.log(timesearch)

      wx.cloud.database().collection('note').doc(id).update({
        data: {
          'task': _.pull({
            'time': timesearch,
          }),
        }
      })
    })
}

//修改待办数据
const changeTask = () => {}

//查询待办数据
const getTask = () => {}


//删除笔记数据
const deleteNote = () => {
  console.log("content")
}

//修改笔记数据
const changeNote = () => {
  console.log("content")
}

//查询笔记数据
const getNote = () => {
  console.log("content")
}

module.exports = { //注册函数
  addNote,
  addTask,
  deleteTask,
  addArray,
  getTask,
  addTask2,
  uploadImg,
  uploadFile,
  uploadVoice,
  idToUrl
}