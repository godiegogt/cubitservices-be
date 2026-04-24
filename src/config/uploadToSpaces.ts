// src/config/uploadToSpaces.ts
import { Upload } from "@aws-sdk/lib-storage";
import { spacesClient } from "./spaces";
import { v4 as uuidv4 } from "uuid";

export async function uploadToSpaces(
    file: Express.Multer.File,
    folder: string, // "clientes", "cuentas"
    entityId?: string // id del cliente, cuenta, etc.
): Promise<{ url: string; storageKey: string }> {
    const ext = file.originalname.split(".").pop();
    
    const basePath = entityId 
    ? `archivos/${folder}/${entityId}`
    : `archivos/${folder}`;

    const storageKey = `${basePath}/${uuidv4()}.${ext}`;

    const upload = new Upload({
    client: spacesClient,
    params: {
        Bucket: process.env.DO_SPACES_BUCKET!,
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