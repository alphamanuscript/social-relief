export const AccountService = {
  async deposit(accountId: string, amount: number) {
    const payload = {
      _id: Math.floor(Math.random() * 10000).toString(),
      from : '',
      to: accountId,
      amount,
      type: 'deposit'
    };
    const res = await fetch('http://localhost:3000/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    return res.json();
  },
  async nominateBeneficiary(accountId: string, beneficiary: string) {
    const payload = {
      _id: Math.floor(Math.random() * 10000).toString(),
      phone: beneficiary
    };
    const res = await fetch('http://localhost:3000/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    return res.json();
  }
};
