import { User, Nominator, Appointer, Beneficiary, Middleman } from '../store/index';

export const AccountService = {
  async login(_id: string) {
    const payload = { uid: _id };
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  async donate(accountId: string, amount: number) {
    const payload = {
      from : '',
      to: accountId,
      amount,
      type: 'donation',
      timestamp: new Date()
    };
    const res = await fetch('http://localhost:3000/donate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accountId
      },
      body: JSON.stringify(payload)
    });
    
    return res.json();
  },
  async updateUser(updatedUser: User) {
    const res = await fetch('http://localhost:3000/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': updatedUser._id
      },
      body: JSON.stringify(updatedUser)
    });
    
    return res.json();
  },
  async nominateBeneficiary(nominator: Nominator, beneficiary: string) {
    const payload = {
      phone: beneficiary,
      nominatedBy: [nominator],
      owed: [0],
      receivedThisMonth: 0
    };
    const res = await fetch('http://localhost:3000/beneficiaries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': nominator._id
      },
      body: JSON.stringify(payload)
    });
    
    return res.json();
  },
  async getBeneficiaries(accountId: string) {
    const res = await fetch('http://localhost:3000/beneficiaries', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accountId
      }
    });
    
    return res.json();
  },
  async getBeneficiary(beneficiary: string, accountId: string) {
    const payload = { phone: beneficiary };
    const res = await fetch('http://localhost:3000/beneficiaries/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accountId
      },
      body: JSON.stringify(payload)
    });
    
    return res.json();
  },
  async updateBeneficiary(nominator: Nominator, beneficiary: Beneficiary) {
    const payload = {
      _id: beneficiary._id,
      phone: beneficiary.phone,
      nominatedBy: [ ...beneficiary.nominatedBy, nominator],
      owed: [ ...beneficiary.owed, 0],
      receivedThisMonth: beneficiary.receivedThisMonth
    };

    const res = await fetch('http://localhost:3000/beneficiaries', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': nominator._id
      },
      body: JSON.stringify(payload)
    });
    
    return res.json();
  },
  async appointMiddleman(appointer: Appointer, middleman: string) {
    const payload = {
      phone: middleman,
      appointedBy: [appointer]
    };
    const res = await fetch('http://localhost:3000/middlemen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': appointer._id
      },
      body: JSON.stringify(payload)
    });
    
    return res.json();
  },
  async getMiddlemen(accountId: string) {
    const res = await fetch('http://localhost:3000/middlemen', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accountId
      }
    });
    
    return res.json();
  },
  async getMiddleman(middleman: string, accountId: string) {
    const payload = { phone: middleman };
    const res = await fetch('http://localhost:3000/middlemen/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accountId
      },
      body: JSON.stringify(payload)
    });
    
    return res.json();
  },
  async updateMiddleman(appointer: Appointer, middleman: Middleman) {
    const payload = {
      _id: middleman._id,
      phone: middleman.phone,
      appointedBy: [ ...middleman.appointedBy, appointer],
    };

    const res = await fetch('http://localhost:3000/middlemen', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': appointer._id
      },
      body: JSON.stringify(payload)
    });
    
    return res.json();
  },
  async getTransactions(accountId: string) {
    const res = await fetch('http://localhost:3000/transactions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accountId
      }
    });
    
    return res.json();
  },
  async queryTransactions(donorsId: string, bnfId: string, ) {
    const payload =  {
      pipeline: [
        {
          $match: { to: bnfId }
        },
        {
            $project: { 
              type: 1, 
              amount: 1, 
              from: 1, 
              to: 1, 
              timestamp: 1, 
              month: { "$month":  { $dateFromString: { dateString: "$timestamp" } } } 
            }
        },
        {
            $match: { month: new Date().getMonth() }
        },
        {
            $project: { type: 1, amount: 1, from: 1, to: 1, timestamp: 1 }
        }
      ]
    };
    const res = await fetch('http://localhost:3000/transactons/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': donorsId
      },
      body: JSON.stringify(payload)
    });
    
    return res.json();
  }

};
