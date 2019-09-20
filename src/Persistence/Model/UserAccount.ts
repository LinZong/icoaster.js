
import { Table, Column, Model } from 'sequelize-typescript';

@Table({ tableName: "user_account", timestamps: false })
class UserAccount extends Model<UserAccount>
{
    @Column({ primaryKey: true, field: 'openid' })
    OpenID: string

    @Column({ field: 'sessionkey' })
    SessionKey: string

    @Column({ field: 'uid' })
    UID: string
}

export default UserAccount