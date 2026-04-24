import { Request, Response } from "express";
import {
    createArchivoSchema,
    updateArchivoEstadoSchema,
} from "./cuentas-servicio-archivo.schemas";
import {
    createArchivoService,
    getArchivosService,
    updateArchivoEstadoService,
} from "./cuentas-servicio-archivo.service";
import { EstadoArchivo } from "@prisma/client";
import { uploadToSpaces } from "../../config/uploadToSpaces";

export async function listArchivos(req: Request, res: Response) {
    try {
        const empresaId = req.auth!.empresaId;
        const { cuentaServicioId } = req.params;

        const archivos = await getArchivosService(cuentaServicioId, empresaId);

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
        const { cuentaServicioId } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: "No se recibió ningún archivo" });
        }

        const { url, storageKey } = await uploadToSpaces(file, "cuentas-servicio", cuentaServicioId);

        const parsed = createArchivoSchema.parse({
            nombre: req.body.nombre,
            categoria: req.body.categoria,
            mimeType: file.mimetype,
            storageKey,
        });

        const archivo = await createArchivoService(
            cuentaServicioId,
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
        const { cuentaServicioId, id } = req.params;
        const parsed = updateArchivoEstadoSchema.parse(req.body);

        const archivo = await updateArchivoEstadoService(
            id,
            cuentaServicioId,
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