
import { Table, Column, Model } from 'sequelize-typescript';

@Table({ tableName: 'user_account', timestamps: false })
export class UserAccount extends Model<UserAccount>
{
    @Column({ primaryKey: true, field: 'openid' })
    OpenID: string

    @Column({ field: 'sessionkey' })
    SessionKey: string

    @Column({ field: 'uid' })
    UID: string
}


@Table({ tableName: 'user_bind', timestamps: false })
export class UserBindDevice extends Model<UserBindDevice>
{
    @Column({ field: 'uid', primaryKey: true })
    UID: string

    @Column({ field: 'did' })
    DeviceID: string

    @Column({ field: 'type' })
    Type: number
}

