"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("koa-jwt");
const jwtManager = require("jsonwebtoken");
const { JWT: { Secret, Audience, Issuer } } = require('../app.json');
const JWTMiddleware = jwt({ secret: Secret, issuer: Issuer, audience: Audience });
exports.JWTMiddleware = JWTMiddleware;
const CreateToken = (payload) => {
    jwtManager.sign(payload, Secret, {
        audience: Audience,
        issuer: Issuer,
        expiresIn: 1800
    });
};
exports.CreateToken = CreateToken;
//# sourceMappingURL=auth.js.map