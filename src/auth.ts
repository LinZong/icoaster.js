import * as jwt from 'koa-jwt'
import * as jwtManager from 'jsonwebtoken'
const { JWT: { Secret, Audience, Issuer } } = require('./config-loader')

const JWTMiddleware = jwt({ secret: Secret, issuer: Issuer, audience: Audience})

export interface TokenPayload {
    UID : string
}

const CreateToken = (payload: TokenPayload) => {
   return jwtManager.sign(payload, Secret, {
        audience: Audience,
        issuer: Issuer,
        expiresIn: 3600 * 24 * 2
    })
}

export  {
    JWTMiddleware, CreateToken
}