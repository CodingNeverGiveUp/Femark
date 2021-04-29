
//添加用户数组
function addArray(profile) {
  return new Promise((resolve, reject) => {
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

function uploadImg(tempImgs){
  return new Promise((resolve,reject)=>{
    
  })
}

//添加测试待办
const addTask2 = (tasktitle,tasktime,taskurgency,taskcontent,taskreminderStatus,ifDone) => {
  const _ = wx.cloud.database().command
  var currenttime = (new Date()).valueOf();
  wx.cloud.database().collection('task').add({
    data: {
        title:tasktitle,
        time:tasktime,
        urgency:taskurgency,
        content:taskcontent,
        reminderStatus:taskreminderStatus,
        remindTime:currenttime,
        done: ifDone,
    }
  })
}

//添加待办数据
const addTask = (taskDate, taskContent, taskTitle, taskType) => {
  const _ = wx.cloud.database().command
  wx.cloud.database().collection('note').where({
      _openid: "oxY3r5W1q6qmHTczqCMHbpYc6TCk"
    }).get()
    .then(res => {
      let id = res.data[0]._id
      var timestamp = new Date().getTime();
      console.log(res)
      wx.cloud.database().collection('note').doc(id).update({
        data: {
          'task': _.push({
            "content": taskContent,
            "date": taskDate,
            "title": taskTitle,
            "type": taskType,
            "time": timestamp,
          }),
        }
      })
    })
}

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

//添加笔记数据
const addNote = (noteDate, noteContent, noteTitle, noteType) => {
  const _ = wx.cloud.database().command
  wx.cloud.database().collection('note').where({
      _openid: "oxY3r5W1q6qmHTczqCMHbpYc6TCk"
    }).get()
    .then(res => {
      let id = res.data[0]._id
      var timestamp = new Date().getTime();
      console.log(res)
      wx.cloud.database().collection('note').doc(id).update({
        data: {
          'note': _.push({
            "content": noteContent,
            "date": noteDate,
            "title": noteTitle,
            "type": noteType,
            "time": timestamp,
          }),
        }
      })
    })
}

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
  addNote: addNote,
  addTask: addTask,
  deleteTask: deleteTask,
  addArray: addArray,
  getTask: getTask,
  addTask2: addTask2,
}