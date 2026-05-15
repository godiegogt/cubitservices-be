"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spacesClient = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
exports.spacesClient = new client_s3_1.S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT,
    region: process.env.DO_SPACES_REGION,
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET,
    },
});
