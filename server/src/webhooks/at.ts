import * as express from 'express';
import { PaymentNotification } from 'africastalking-types';
import { AppRequest } from '../server';

export const atRoutes = express.Router();

atRoutes.use(express.urlencoded({ extended: true }))

atRoutes.post('/payments', (req: AppRequest, res) => {
  const notification = req.body;
  console.log('Notification');
  req.core.transactions.handleProviderNotification(notification)
    .then(_ => res.status(200).send())
    .catch(_ => res.status(400).send());
});
