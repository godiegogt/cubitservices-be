import { Request, Response } from "express";
import {
    createArchivoSchema,
    updateArchivoEstadoSchema,
} from "./orden-archivo.schemas";
import {
    createArchivoService,
    getArchivosService,
    updateArchivoEstadoService,
} from "./orden-archivo.service";
import { uploadToSpaces } from "../../config/uploadToSpaces";

export async function listArchivos(req: Request, res: Response) {
    try {
        const empresaId = req.auth!.empresaId;
        const { ordenServicioId } = req.params;

        const archivos = await getArchivosService(ordenServicioId, empresaId);

        return res.json({
            success: true,
            message: "Archivos obtenidos correctamente",
            data: archivos,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error instanceof Error ? error.message : "Error obteniendo archivos",
        });
    }
}

export async function createArchivoHandler(req: Request, res: Response) {
    try {
        const empresaId = req.auth!.empresaId;
        const usuarioId = req.auth!.userId;
        const { ordenServicioId } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: "No se recibió ningún archivo" });
        }

        const { url, storageKey } = await uploadToSpaces(file, "ordenes", ordenServicioId);

        const parsed = createArchivoSchema.parse({
            nombre: req.body.nombre,
            categoria: req.body.categoria,
            mimeType: file.mimetype,
            storageKey,
        });

        const archivo = await createArchivoService(
            ordenServicioId,
            empresaId,
            usuarioId,
            {
                ...parsed,
                extension: file.originalname.split(".").pop(),
                tamanoBytes: file.size,
                url,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Archivo creado correctamente",
            data: archivo,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error creando archivo",
        });
    }
}

export async function updateArchivoEstadoHandler(req: Request, res: Response) {
    try {
        const empresaId = req.auth!.empresaId;
        const { ordenServicioId, id } = req.params;
        const parsed = updateArchivoEstadoSchema.parse(req.body);

        const archivo = await updateArchivoEstadoService(
            id,
            ordenServicioId,
            empresaId,
            parsed.estado
        );

        return res.json({
            success: true,
            message: "Estado del archivo actualizado correctamente",
            data: archivo,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error ? error.message : "Error actualizando estado del archivo",
        });
    }
}