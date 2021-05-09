const cloud = require('wx-server-sdk');

exports.main = async (event, context) => {
  cloud.init();
  const db = cloud.database();
  const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
  }
  var messages = []
  //获取当前时间戳和时间
  var currenttime = (new Date()).valueOf();
  var currentdate = new Date(currenttime);
  try {
    // 从云开发数据库中查询等待发送的消息列表
    await db
      .collection('note').field({
        task: true,
        _openid: true,
        _id: true,
      }).get()
      .then(res => {
        console.log(res)
        res.data.forEach((element, index) => {
          element.task.forEach((innerElement, innerIndex) => {
            if (innerElement.notification == true && innerElement.done == false && currenttime < innerElement.notificationTimestamp && currenttime + 300000 > innerElement.notificationTimestamp) {
              let message = {
                _openid: element._openid,
                _id: element._id,
                heading: innerElement.heading == null ? '' : innerElement.heading,
                time: formatTime(new Date(innerElement.notificationTimestamp)),
                urgency: "紧急且重要",
                content: innerElement.content == null ? '' : innerElement.content,
                reminderStatus: "待确认",
                index: innerIndex,
              }
              messages.push(message)
            }
          })
        })
      })

    // 循环消息列表
    const sendPromises = messages.map(async message => {
      try {
        // 发送订阅消息
        await cloud.openapi.subscribeMessage.send({
          touser: message._openid, //要推送用户的openid
          //page:'',
          data: { //推送的内容
            thing1: {
              value: message.heading //'xx会议'
            },
            time2: {
              value: message.time //'2019年11月30日 21:00:00'
            },
            phrase9: {
              value: message.urgency //'紧急且重要'
            },
            thing4: {
              value: message.content //'会议内容为.....'
            },
            phrase8: {
              value: message.reminderStatus //'待确认'
            }
          },
          templateId: 'n5ZgQ_uHeZFwKecg8S_WjDb3Gfx7a9BUTZbkLPnWTXI' //模板id
        })
        // 发送成功后将消息的状态改为已发送
        return db
          .collection('note')
          .doc(message._id)
          .update({
            data: {
              [`task.${message._index}`]: {
                done: true,
              }
            },
          });

      } catch (e) {
        return e;
      }
    });

    return Promise.all(sendPromises);
  } catch (err) {
    console.log(err);
    console.log(err.time);
    return err;
  }
};