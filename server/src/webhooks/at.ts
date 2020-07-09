import * as express from 'express';
import { AppRequest } from '../server';
import { AT_PAYMENT_PROVIDER_NAME } from '../core/payment';

export const atRoutes = express.Router();

atRoutes.use(express.urlencoded({ extended: true }))

atRoutes.post('/payments', (req: AppRequest, res) => {
  const notification = req.body;
  console.log('AfricasTalking payment notification');
  req.core.transactions.handleProviderNotification(AT_PAYMENT_PROVIDER_NAME, notification)
    .then(_ => res.status(200).send())
    .catch(_ => res.status(400).send());
});
