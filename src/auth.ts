import * as jwt from 'koa-jwt'
import * as jwtManager from 'jsonwebtoken'
const { JWT: { Secret, Audience, Issuer } } = require('../app.json')

const JWTMiddleware = jwt({ secret: Secret, issuer: Issuer, audience: Audience})

const CreateToken = (payload: any) => {
   return jwtManager.sign(payload, Secret, {
        audience: Audience,
        issuer: Issuer,
        expiresIn: 3600 * 24 * 2
    })
}

export  {
    JWTMiddleware, CreateToken
}