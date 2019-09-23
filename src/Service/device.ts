import { UserBindDevice } from "../Persistence/Model/User";
import GetAES256GCMCipher from "../Utils/AES256GCMCipher";
import { TryParseJSON } from "../Utils/common";
import moment = require("moment");
import RedisClient from "../Persistence/RedisConfig";

const { Decrypter } = GetAES256GCMCipher()
const CoasterUploadUserStatus = async (Did: string, Message: any) => {
  const UID = GetDidBindUSer(Did)
  const { cmd, encrypted, iv } = Message
  // Discard messages which cannot be decrypted.
  if (encrypted && iv) {
    const data = Decrypter(encrypted, Did + UID, iv)
    const now = moment().unix()
    TryParseJSON(data).then(obj => {
      switch (cmd) {
        case 'env':
          const { wet, temp } = obj
          // Persist that data to db.
          console.log(`Environment data: ${wet}, ${temp}`)
          break
        case 'drink':
          const { vol } = obj
          break
      }
    })
  }
}

const GetDidBindUSer = (did : string) : string => {
  return '3ijdiz7hjxg'
}

const BindDevice = async (UID: string, Did: string, type: number) => {
  await UserBindDevice.findOrCreate({
    where: {
      UID: UID
    },
    defaults: { UID: UID, DeviceID: Did, Type: type } as UserBindDevice
  }).then(async ([bind, created]) => {
    if (created) RedisClient.DEL(Did)
    else {
      console.log(`User ${UID} have been bind a coaster. Updating info.`)
      await UserBindDevice.update({ DeviceID: Did, Type: type }, { where: { UID: UID } })
    }
  })
}

const GetBoundDevice = async (UID: string) => {
  return await UserBindDevice.findByPk(UID)
    .then(found => {
      if (found) {
        return {
          StatusCode: 0,
          DeviceID: found.DeviceID,
          Type: found.Type
        }
      }
      return {
        StatusCode: -1
      }
    }, err => {
      return {
        StatusCode: -2,
        Error: err
      }
    })
}

const UnbindDevice = async (UID: string, Did: string) => {
  // 0 正常完成, -1 没有绑定杯垫， -2 数据库读写错误.
  const condition = {
    UID: UID,
    DeviceID: Did
  }

  /*
    Should finish tasks below.
    1. Check if user had bind a coaster with such did
    2. Send unbind request to coaster
    3. Remove binding info from database.
   */

  try {
    const device = await UserBindDevice.findOne({
      where: condition
    });
    if (device) {
      return await UserBindDevice.destroy({
        where: condition
      }).thenReturn({ StatusCode: 0 }).catchReturn({ StatusCode: -2 })
    }
    return {
      StatusCode: -1
    }
  }
  catch (err) {
    return { StatusCode: -2, Error: err }
  }
}

export { BindDevice, GetBoundDevice, UnbindDevice, CoasterUploadUserStatus }