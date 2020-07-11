import { GetterTree } from 'vuex';
import { AppState } from '../types';

const getters: GetterTree<AppState, AppState> = {
  totalAmountDonated: ({ transactions }) => {
    return transactions.filter(t => t.type === 'donation' && t.status === 'success' && t.amount > 0)
      .map(t => t.amount)
      .reduce((a, b) => a + b, 0);
  },
  totalAmountDistributed: ({ transactions, user }) => {
    return transactions.filter(t => t.type === 'distribution' && t.status === 'success' && user && t.from === user._id)
      .map(t => t.amount)
      .reduce((a, b) => a + b, 0);
  },
  peopleDonatedTo: ({ transactions, user }) => {
    const recipients = transactions.filter(t => t.type === 'distribution' && t.status === 'success' && (user && t.to !== user._id))
      .map(t => t.to);
    const uniqueRecipients = new Set(recipients);
    return uniqueRecipients.size;
  },
  donations: ({ transactions }) => {
    return transactions.filter(t => t.type == 'donation').reverse();
  },
  distributions: ({ transactions }) => {
    return transactions.filter(t => t.type == 'distribution').reverse();
  }
}

export default getters;