const cloud = require('wx-server-sdk');

exports.main = async (event, context) => {
  cloud.init();
  const db = cloud.database();
  //获取当前时间戳和时间
  var currenttime = (new Date()).valueOf();
  var currentdate = new Date(currenttime);
  try {
    // 从云开发数据库中查询等待发送的消息列表
    const messages = await db
      .collection('task')
      .where({
        done: false,
      })
      .get();

    // 循环消息列表
    const sendPromises = messages.data.map(async message => {
      try {
        // 发送订阅消息
        if(currentdate.valueOf()>=message.remindTime){
        await cloud.openapi.subscribeMessage.send({
          touser:message._openid,//要推送用户的openid
          //page:'',
          data:{//推送的内容
            thing1:{
              value: message.title//'xx会议'
            },
            time2:{
              value:message.time//'2019年11月30日 21:00:00'
            },
            phrase9:{
              value:message.urgency//'紧急且重要'
            },
            thing4:{
              value:message.content//'会议内容为.....'
            },
            phrase8:{
              value:message.reminderStatus//'待确认'
            }
          },
            templateId:'n5ZgQ_uHeZFwKecg8S_WjDb3Gfx7a9BUTZbkLPnWTXI'//模板id
          })
        // 发送成功后将消息的状态改为已发送
        return db
          .collection('task')
          .doc(message._id)
          .update({
            data: {
              done: true,
            },
          });
        }
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