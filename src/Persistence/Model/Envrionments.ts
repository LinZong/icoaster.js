import { Document, Schema } from "mongoose";
import mongoose from '../MongoConfig'
export interface IEnvironments extends Document {
    Time: number
    Wet: number,
    Temp: number
}

export const EnvironmentsScheme: Schema = new Schema({
    UID: String,
    records: [{ Time: Number, Wet: Number, Temp: Number }]
}, { id: false, _id: false })

export default mongoose.model<IEnvironments>('Environments', EnvironmentsScheme, 'environments')