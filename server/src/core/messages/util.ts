import { User } from '../user';

export function beneficiariesAndAmountReceived(beneficiaries: User[], receivedAmounts: number[]): string {
  let message: string = '';
    beneficiaries.forEach((beneficiary: User, index: number) => {
      message += (isForSms ? '\n' : '<br><strong>') + `${extractFirstName(beneficiary.name)}: Ksh ${receivedAmount[index]}` + (isForSms ? '' : '</strong>');
    });
    return message;
}