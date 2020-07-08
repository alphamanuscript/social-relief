const axios = require('axios');

class TransactionNotifier {
  /**
   * 
   * @param {string} webhookUrl 
   */
  constructor (webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  async sendNotification(transaction) {
    try {
      console.log('Sending transaction notification', transaction._id.toString());
      await axios.post(this.webhookUrl, transaction);
    }
    catch (e) {
      console.error('Error while sending transaction notification', e);
    }
  }
}

exports.TransactionNotifier = TransactionNotifier;
