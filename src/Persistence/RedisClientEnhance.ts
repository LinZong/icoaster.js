import { RedisClient } from 'redis'

export interface RedisClientEnhance extends RedisClient {
    PromiseGet(key: string): Promise<string>
}

function PromiseGet(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
        this.GET(key, (err, reply) => {
            if (err) reject(err)
            else resolve(reply)
        })
    })
}

export function WithPromise(client: RedisClient): RedisClientEnhance {
    const unwrapType = client as any
    unwrapType.PromiseGet = PromiseGet.bind(unwrapType)
    return unwrapType as RedisClientEnhance
}


