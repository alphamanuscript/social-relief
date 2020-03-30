export const AccountService = {
  deposit(accountId: string, amount: number) {
    console.log('final amount', amount);
    return Promise.resolve({
      _id: Math.floor(Math.random() * 10000).toString(),
      from : '',
      to: accountId,
      amount,
      type: 'deposit'
    });
  }
};
