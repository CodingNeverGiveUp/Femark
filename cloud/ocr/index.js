// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  let imgbuffer = new Buffer(event.buffer)
  let result
  result = await cloud.openapi.ocr.printedText({
    type: 'photo',
    img: {
      contentType: 'image/png',
      value: imgbuffer
    }
  })
  return {
    result
  }
}