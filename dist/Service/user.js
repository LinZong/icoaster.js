"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserAccount_1 = require("../Persistence/Model/UserAccount");
const GenerateUID = () => Math.random().toString(36).substr(2, 11);
const Login = async (OpenID, SessionKey) => {
    const user = new UserAccount_1.default({ OpenID: OpenID, SessionKey: SessionKey, UID: GenerateUID() });
    await user.save();
};
exports.Login = Login;
//# sourceMappingURL=user.js.map