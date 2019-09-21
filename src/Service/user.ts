import { UserAccount, INotificationSetting, UserNotifySetting } from '../Persistence/Model/User'
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



export { Login }