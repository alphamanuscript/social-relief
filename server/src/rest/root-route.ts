import { Router } from 'express';
import { statusCodes } from '../server';

export const root = Router();

root.get('/', (req, res) => {
  res.status(statusCodes.STATUS_SUCCESS).json({ ok : true });
});
