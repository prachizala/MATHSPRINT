import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responseHelper';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Backend Error]:', err.stack || err.message || err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  sendError(res, message, status);
};
