import * as jwt from 'koa-jwt'
import * as jwtManager from 'jsonwebtoken'
const { JWT: { Secret, Audience, Issuer } } = require('../app.json')

const JWTMiddleware = jwt({ secret: Secret, issuer: Issuer, audience: Audience})

const CreateToken = (payload: any) => {
    jwtManager.sign(payload, Secret, {
        audience: Audience,
        issuer: Issuer,
        expiresIn: 1800
    })
}

export  {
    JWTMiddleware, CreateToken
}