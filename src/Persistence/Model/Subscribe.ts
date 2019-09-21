
import { Table, Column, Model } from 'sequelize-typescript';
import { UserAccount } from './User';
import { Col } from 'sequelize/types/lib/utils';


@Table({ tableName: 'user_subscribe',timestamps : false })
export class UserSubscribe extends Model<UserSubscribe>
{

    @Column({ field: 'uid', primaryKey: true })
    UID: string

    @Column({ field: 'subscribe' })
    SubscribeUserUID: string

    @Column({ field: 'emergency' })
    IsEmergencyContact: number

    @Column({ field : 'tag'})
    Tag : string

    @Column({ field : 'request'})
    RequestBind : number
}

export const QuerySubscribeUser = (subscribe : string, uid : string) => `select sub.uid UID, sub.subscribe Subscribe, sub.emergency IsEmergencyContact, acc.nickname NickName, acc.avatar AvatarUrl, sub.tag Tag, sub.request RequestBind from user_subscribe sub, user_account acc where sub.uid = acc.uid and sub.${subscribe} = '${uid}'`