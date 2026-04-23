declare global {
  namespace Express {
    interface Request {
      metadata?: {
        account?: {
          userId: string;
        }
      };
    }
  }
}

export {};
