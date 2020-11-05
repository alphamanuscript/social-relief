import { User } from '../user';
import { extractFirstName } from '../util';

export function beneficiariesAndAmountReceived(beneficiaries: User[], receivedAmount: number[]): string {
  let message: string = '';
  beneficiaries.forEach((beneficiary: User, index: number) => {
    message += `${extractFirstName(beneficiary.name)} (${receivedAmount[index]})` + ((index < beneficiaries.length - 1) ? ', ' : '');
  });
  return message;
}