import { Document, Schema } from "mongoose";
import mongoose from '../MongoConfig'
export interface IDrinkingRecords extends Document {
    Time: number,
    Vol: number
}

export const DrinkingRecordScheme: Schema = new Schema({
    UID: String,
    records: [{ Time: Number, Vol: Number }]
},{ id: false, _id : false})

export default mongoose.model<IDrinkingRecords>('DrinkingRecords', DrinkingRecordScheme, 'drinking_history')