import * as express from 'express';
import { AppRequest } from '../server';
import { MANUAL_PAYMENT_PROVIDER_NAME } from '../core/payment';

export const manualPayRoutes = express.Router();

manualPayRoutes.post('/', (req: AppRequest, res) => {
  const notification = req.body;
  console.log('Manual payment notification');
  req.core.transactions.handleProviderNotification(MANUAL_PAYMENT_PROVIDER_NAME, notification)
    .then(_ => res.status(200).send())
    .catch(_ => res.status(400).send());
});
