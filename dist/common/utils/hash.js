"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashText = hashText;
exports.compareHash = compareHash;
const bcrypt_1 = __importDefault(require("bcrypt"));
async function hashText(value) {
    return bcrypt_1.default.hash(value, 10);
}
async function compareHash(value, hashedValue) {
    return bcrypt_1.default.compare(value, hashedValue);
}
