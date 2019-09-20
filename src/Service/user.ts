import UserAccount from '../Persistence/Model/UserAccount'
import { CreateToken } from '../auth'
const GenerateUID = () => Math.random().toString(36).substr(2, 11)

const Login = async (OpenID: string, SessionKey: string) => {
    try {
        const [user,created] = await UserAccount.findOrCreate({
            where: {
                OpenID: OpenID
            },
            defaults: new UserAccount({ OpenID: OpenID, SessionKey: SessionKey, UID: GenerateUID() })
        })
        console.log(`User ${user.OpenID} ${created ? "created." : 'logined.'}`)
        return {
            StatusCode : 0,
            Token : CreateToken({user : user.UID})
        }
    }
    catch(err) {
        return err
    }
}

export { Login }