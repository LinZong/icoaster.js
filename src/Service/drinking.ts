import DrinkingRecord from '../Persistence/Model/DrinkingRecords'

export const GetUserDrinkingRecords = async (UID: string, Yesterday: number, Now: number) => {
  const queryResult = await DrinkingRecord.aggregate([
    {
      $match: { 'UID': UID }
    },
    {
      $project: {
        records: {
          $filter: {
            input: "$records",
            as: "records",
            cond: {
              $and: [{ $gte: ["$$records.Time", Yesterday] },
              { $lt: ["$$records.Time", Now] }]
            }
          }
        },
        UID: 1,
        _id: 0
      }
    }
  ]).limit(1)

  return queryResult.length === 1 ? queryResult[0] : {}
}