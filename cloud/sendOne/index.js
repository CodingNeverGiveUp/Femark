// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  try{
    const result = await cloud.openapi.subscribeMessage.send({
      touser:event.openid,//要推送用户的openid
      //page:'',
      data:{//推送的内容
        thing1:{
          value: event.title//'xx会议'
        },
        time2:{
          value:event.time//'2019年11月30日 21:00:00'
        },
        phrase9:{
          value:event.urgency//'紧急且重要'
        },
        thing4:{
          value:event.content//'会议内容为.....'
        },
        phrase8:{
          value:event.reminderStatus//'待确认'
        }
      },
        templateId:'n5ZgQ_uHeZFwKecg8S_WjDb3Gfx7a9BUTZbkLPnWTXI'//模板id
      })
      return result
    }catch(err) {
      return err
    }
}