const exampleFunction = () => {
  console.log("content")
}

//添加待办数据
const addTask = () => {
  console.log("content")
}

//删除待办数据
const deleteTask = () => {
  console.log("content")
}

//修改待办数据
const changeTask = () => {
  console.log("content")
}

//查询待办数据
const getTask = () => {
  console.log("content")
}

//添加笔记数据
const addNote = (noteDate, noteContent, noteTitle, noteType) => {
  const _ = wx.cloud.database().command
  wx.cloud.database().collection('note').where({
      _openid: "oxY3r5W1q6qmHTczqCMHbpYc6TCk"
    }).get()
    .then(res => {
      let id = res.data[0]._id
      wx.cloud.database().collection('note').doc(id).update({
        data: {
          'note': _.push({
            "content": noteContent,
            "date": noteDate,
            "title": noteTitle,
            "type": noteType,
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
  exampleFunction: exampleFunction,
  addNote: addNote
}