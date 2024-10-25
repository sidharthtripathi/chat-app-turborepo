"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisDB = void 0;
const redis_1 = require("redis");
exports.redisDB = (0, redis_1.createClient)({
    url: process.env.REDISDB_URL
});
