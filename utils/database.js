const app = getApp()
//添加用户数组
function addArray(profile) {
  return new Promise((resolve, reject) => {
    profile.timestamp = new Date().getTime(),
      // const _ = wx.cloud.database().command
      wx.cloud.database().collection('note').add({
        data: {
          'note': [],
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
        title: `上传中（${index+1}/${array.length}）`,
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

function idToUrl(array){
  return new Promise(async (resort, reject)=>{
    try{
      for(let i = 0; i < array.length; i++){
        await wx.cloud.getTempFileURL({
          fileList: [array[i].fileID]
        }).then(res=>{
          array[i].src = res.fileList[0].tempFileURL
        })
      }
      resort()
    }catch(e){
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
  idToUrl
}