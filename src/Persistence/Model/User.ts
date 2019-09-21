
import { Table, Column, Model, DataType,HasMany } from 'sequelize-typescript';
import { UserSubscribe } from './Subscribe';


@Table({ tableName: 'user_account', timestamps: false })
export class UserAccount extends Model<UserAccount>
{
    @Column({ primaryKey: true, field: 'openid' })
    OpenID: string

    @Column({ field: 'sessionkey' })
    SessionKey: string

    @Column({ field: 'uid' })
    UID: string

    @Column({ field : 'nickname'})
    NickName : string

    @Column({ field : 'avatar'})
    AvatarUrl : string
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

@Table({ tableName: 'user_notify', timestamps: false })
export class UserNotifySetting extends Model<UserNotifySetting>
{
    @Column({ field: 'uid', primaryKey: true})
    UID: string 

    @Column({ field: 'mobile', type: DataType.NUMBER, get(){return MobileNotificationSettingGetter.call(this)},
                                                      set(v){MobileNotificationSettingSetter.call(this,v)} })
    MobileMask: number

    @Column({ field: 'coaster' ,type: DataType.NUMBER, get(){return CoasterNotificationSettingGetter.call(this)},
                                                       set(v){CoasterNotificationSettingSetter.call(this,v)} })
    CoasterMask: number
}


@Table({ tableName: 'user_profile', timestamps: false })
export class UserProfile extends Model<UserProfile>
{
    @Column({ field: 'uid', primaryKey: true })
    UID: string

    @Column({ field: 'sex' })
    Sex: boolean

    @Column({ field: 'birthday', validate: { IsDate } })
    Birthday: string

    @Column({ field: 'height', validate: { isNumeric: true } })
    Height: number

    @Column({ field: 'weight', validate: { isNumeric: true } })
    Weight: number

    @Column({ field: 'healthy', validate: { isNumeric: true } })
    Healthy: number
}

function MobileNotificationSettingGetter() {
    const mask = this.getDataValue('MobileMask')
    return {
        Vibration: 1 & mask >> 2,
        Notification: 1 & mask >> 1,
        Ring: 1 & mask
    }
}

function IsDate(date : string) {
    if(!/^((?:19|20)\d\d)-([1-9]|1[012])-([1-9]|[12][0-9]|3[01])$/.test(date)) {
        throw new Error('Only yyyy-MM-dd are allowed!'); 
    }
}

function MobileNotificationSettingSetter(v: MobileNotificationSetting) {
    const mask = 1 * v.Ring + 2 * v.Notification + 4 * v.Vibration
    this.setDataValue('MobileMask', mask)
}

function CoasterNotificationSettingGetter(): CoasterNotificationSetting {
    const mask = this.getDataValue('CoasterMask')
    return {
        Light : 1 & mask >> 1,
        Ring : 1 & mask
    }
}

function CoasterNotificationSettingSetter(v: CoasterNotificationSetting) {
    const mask = 1 * v.Ring + 2 * v.Light 
    this.setDataValue('CoasterMask', mask)
}

export class MobileNotificationSetting {

    Vibration: number = 0
    Notification: number = 0
    Ring: number = 0
}
export class CoasterNotificationSetting {
    Light: number = 0
    Ring: number = 0
}

export interface INotificationSetting {
    new(): CoasterNotificationSetting | MobileNotificationSetting
}
