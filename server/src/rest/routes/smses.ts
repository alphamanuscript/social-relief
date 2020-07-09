import { Router } from 'express';
import { wrapResponse, requireAuth } from '../middleware';

export const smses = Router();