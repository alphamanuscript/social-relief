import { Router } from 'express';
import { AppRequest } from '../server';

export const atRoutes = Router();

atRoutes.post('/payments', (req: AppRequest, res) => {
  console.log('notification', req.body);
  res.status(200).send();
});
