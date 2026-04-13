declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        empresaId: string;
        rolId: string;
      };
    }
  }
}

export {};