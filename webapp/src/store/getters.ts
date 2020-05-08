import { GetterTree } from 'vuex';
import { AppState } from '../types';

const getters: GetterTree<AppState, AppState> = {
  totalAmountDonated: ({ transactions }) => {
    return transactions.filter(t => t.type == 'donation' && t.amount > 0)
      .map(t => t.amount)
      .reduce((a, b) => a + b, 0);
  },
  totalAmountDistributed: ({ transactions, user }) => {
    return transactions.filter(t => t.type === 'distribution' && user && t.to === user._id)
      .map(t => t.amount)
      .reduce((a, b) => a + b, 0);
  },
  peopleDonatedTo: ({ transactions, user }) => {
    const recipients = transactions.filter(t => t.type === 'distribution' && (user && t.to !== user._id))
      .map(t => t.to);
    const uniqueRecipients = new Set(recipients);
    return uniqueRecipients.size;
  },
  donations: ({ transactions }) => {
    return transactions.filter(t => t.type == 'donation').reverse();
  },
  // numberOfBeneficiariesOwed: ({ beneficiaries, user }) => {
  //   return beneficiaries.filter(bnf => {
  //     if (user) {
  //       const nominatorIndex = bnf.nominatedBy.findIndex(nominator => nominator._id === user._id);
  //       return bnf.owed[nominatorIndex];
  //     }
  //     return false;
  //   }).length;
  // },
  // numberOfBeneficiariesNotOwed: ({ beneficiaries, user }) => {
  //   return beneficiaries.filter(bnf => {
  //     if (user) {
  //       const nominatorIndex = bnf.nominatedBy.findIndex(nominator => nominator._id === user._id);
  //       return !bnf.owed[nominatorIndex];
  //     }
  //     return false;
  //   }).length;
  // },
  // totalAmountOwedToBeneficiaries: ({ beneficiaries, user }) => {
  //   if (user) {
  //     return beneficiaries.reduce((total, bnf) => { 
  //       const nominatorIndex = bnf.nominatedBy.findIndex(nominator => nominator._id === user._id);
  //       return total + bnf.owed[nominatorIndex] 
  //     }, 0);
  //   }
  // }
}

export default getters;