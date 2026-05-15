"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToSpaces = uploadToSpaces;
// src/config/uploadToSpaces.ts
const lib_storage_1 = require("@aws-sdk/lib-storage");
const spaces_1 = require("./spaces");
const uuid_1 = require("uuid");
async function uploadToSpaces(file, folder, // "clientes", "cuentas"
entityId // id del cliente, cuenta, etc.
) {
    const ext = file.originalname.split(".").pop();
    const basePath = entityId
        ? `archivos/${folder}/${entityId}`
        : `archivos/${folder}`;
    const storageKey = `${basePath}/${(0, uuid_1.v4)()}.${ext}`;
    const upload = new lib_storage_1.Upload({
        client: spaces_1.spacesClient,
        params: {
            Bucket: process.env.DO_SPACES_BUCKET,
            Key: storageKey,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read",
        },
    });
    await upload.done();
    const url = `${process.env.DO_SPACES_ENDPOINT}/${process.env.DO_SPACES_BUCKET}/${storageKey}`;
    return { url, storageKey };
}
