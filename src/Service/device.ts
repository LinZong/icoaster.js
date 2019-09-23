import { UserBindDevice } from "../Persistence/Model/User";
import GetAES256GCMCipher from "../Utils/AES256GCMCipher";
import { TryParseJSON } from "../Utils/common";
import moment = require("moment");
import Redis from "../Persistence/RedisConfig";
import Environments from '../Persistence/Model/Envrionments'
const { Decrypter } = GetAES256GCMCipher()

const CoasterUploadUserStatus = async (Did: string, Message: any) => {
  const UID = await GetDidBindUser(Did)
  const { cmd, encrypted, iv } = Message
  // Discard messages which cannot be decrypted.
  if (encrypted && iv) {
    const data = Decrypter(encrypted, Did + UID, iv)
    const now = moment().unix()
    TryParseJSON(data).then(obj => {
      switch (cmd) {
        case 'env':
          const { Wet, Temp } = obj
          // Persist that data to db.
          console.log(`Environment data: ${Wet}, ${Temp}`)
          SaveEnvrionmentReport(UID, {
            Time : now,
            Wet: Wet,
            Temp: Temp
          })
          break
        case 'drink':
          SaveDrinkingRecord(UID, {
            Time : now,
            ...obj
          })
          break
      }
    })
  }
}

const SaveDrinkingRecord = async (UID: string, Record: any) => {
  await Environments.updateOne({ UID: UID }, {
    $push: {
      records: Record
    }
  }, { upsert: true })
}

const SaveEnvrionmentReport = async (UID: string, Report: any) => {
  await Environments.updateOne({ UID: UID }, {
    $push: {
      records: Report
    }
  }, { upsert: true })
}

const GetDidBindUser = async (did: string) => {
  try {
    const cachedUser = await Redis.PromiseGet('bind:' + did)
    if (cachedUser) return cachedUser
  }
  catch {
    // Fall back to search in database.
  }
  const device = await UserBindDevice.findOne({ where: { DeviceID: did } })
  Redis.SET('bind:' + did, device.UID, 'EX', 60 * 60 * 12)
  return device.UID
}

const BindDevice = async (UID: string, Did: string, type: number) => {
  // 清除从前的绑定信息
  Redis.DEL('bind:' + Did)

  return await UserBindDevice.findOrCreate({
    where: {
      UID: UID
    },
    defaults: { UID: UID, DeviceID: Did, Type: type } as UserBindDevice
  }).then(async ([bind, created]) => {
    if (created) {
      Redis.DEL(Did)
      return true
    }
    else {
      console.log(`User ${UID} have been bind a coaster. Updating info.`)
      return await UserBindDevice.update({ DeviceID: Did, Type: type }, { where: { UID: UID } }).then(([affect, devices]) => {
        if (affect === 1 && devices[0].UID === UID) return true
        return false
      })
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

const DetectIfDidIsBound = async(Did : string) => {
  return await UserBindDevice.findOne({where : { DeviceID : Did}})
}

const UnbindDevice = async (Did: string,authUser? : string) => {
  const UID = await GetDidBindUser(Did)
  if(authUser && authUser !== UID) return { StatusCode : -3 }
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
      // 删除掉缓存中的用户关联信息
      Redis.DEL('bind:' + Did)
      // 告知杯垫已经被用户解绑, 返回可被发现状态。
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

export { DetectIfDidIsBound, BindDevice, GetBoundDevice, UnbindDevice, CoasterUploadUserStatus }