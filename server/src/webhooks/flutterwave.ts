import * as express from 'express';
import { AppRequest } from '../server';
import { FLUTTERWAVE_PAYMENT_PROVIDER_NAME } from '../core/payment';

export const flutterwaveRoutes = express.Router();

flutterwaveRoutes.post('/', (req: AppRequest, res) => {
  const notification = req.body;
  console.log('Flutterwave payment notification');
  req.core.transactions.handleProviderNotification(FLUTTERWAVE_PAYMENT_PROVIDER_NAME, notification)
    .then(_ => res.status(200).send())
    .catch(e => {
      console.error('Flutterwave notification error', e);
      res.status(400).send();
    });
});
