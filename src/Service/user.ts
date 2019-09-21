import { UserAccount, UserBindDevice } from '../Persistence/Model/User'
import { CreateToken } from '../auth'
const GenerateUID = () => Math.random().toString(36).substr(2, 11)

const Login = async (OpenID: string, SessionKey: string) => {
  try {
    return await UserAccount.findOrCreate({
      where: {
        OpenID: OpenID
      },
      defaults: { OpenID: OpenID, SessionKey: SessionKey, UID: GenerateUID() }
    }).then(([user, created]) => {

      console.log(`User ${user.OpenID} ${created ? "created." : 'logined.'}`)
      return {
        StatusCode: 0,
        Token: CreateToken({ UID: user.UID })
      }
    })
  }
  catch (err) {
    return err
  }
}


const BindDevice = async (UID: string, Did: string, type: number) => {
  return await UserBindDevice.findOrCreate({
    where: {
      UID: UID
    },
    defaults: { UID: UID, DeviceID: Did, Type: type } as UserBindDevice
  }).then(([bind, created]) => {
    return {
      StatusCode: created ? 0 : -1
    }
  })
}

const GetBindDevice = async (UID: string) => {
  return await UserBindDevice.findByPk(UID).then(found => {
    if(found) {
      return {
        StatusCode: 0,
        DeviceID: found.DeviceID,
        Type: found.Type
      }
    }
    return {
      StatusCode : -1
    }
  }, err => {
    return {
      StatusCode: -2,
      Error : err
    }
  })
}

const UnbindDevice = async (UID: string, Did: string) => {
  // 0 正常完成, -1 没有绑定杯垫， -2 数据库读写错误.
  const condition = {
    UID: UID,
    DeviceID: Did
  }
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


export { Login, BindDevice, GetBindDevice, UnbindDevice }