export function inicioDia(fecha: Date): Date {
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function finDia(fecha: Date): Date {
    const d = new Date(fecha);
    d.setHours(23, 59, 59, 999);
    return d;
}